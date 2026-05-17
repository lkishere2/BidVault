package com.auction.app.domains.auction.auction.scheduler;

import java.time.Instant;
import java.util.List;

import com.auction.app.domains.auction.auction.*;
import com.auction.app.domains.auction.auction.dtos.AuctionState;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.auction.redis.AuctionCacheAdapter;
import com.auction.app.domains.auction.bids.dtos.PendingBid;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.auction.app.domains.auction.bids.Bid;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.BidStatus;
import com.auction.app.domains.products.Product;
import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.users.users.User;
import com.auction.app.domains.users.users.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionHandler {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionCacheAdapter auctionCacheAdapter;
    private final AuctionService auctionService;
    private final AuctionPublisher publisher;

    private static final long QUEUE_DRAIN_EXTENSION_SECONDS = 300L; // 5 minutes

    // This method check and activate all upcoming auctions after 30 seconds
    // Another approach I would want to implement is using Redis listener
    // But that would take another STATUS key, and killing all the RAM
    // In addition, if server suddenly turns off then the key might stuck with UPCOMING
    // DB polling is much safer and cheaper
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void activateUpcomingAuctions() {
        // Fetch all can reduce the time so much, I recommend using Page here
        // And then we could process a batch with size 25, for example
        // TODO: I will optimize this later
        List<Auction> toActivate = auctionRepository.findUpcomingToActivate(AuctionStatus.UPCOMING, Instant.now());

        if (toActivate.isEmpty()) {
            return;
        }

        for (Auction auction : toActivate) {
            auction.setStatus(AuctionStatus.ACTIVE);
            auctionRepository.save(auction);

            // Update or create cache state, flip to ACTIVE
            AuctionState state = auctionCacheAdapter.getAuctionState(auction.getId());

            if (state != null) {
                // Cache exists, update it
                state.setStatus(AuctionStatus.ACTIVE);
                auctionCacheAdapter.updateAuctionState(auction.getId(), state);
            }
            else {
                // Cache doesn't exist.
                // Since 'auction' was just set to ACTIVE on the line above,
                // caching it now will automatically create it with an ACTIVE status!
                auctionService.cacheAuctionState(auction);
            }

            // Notify all subscribers that auction is now ACTIVE
            publisher.publishAuctionStarted(auction);
            log.info("Auction #{} is now ACTIVE", auction.getId());
        }
    }

    // Same logic as the active
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void endActiveAuctions() {
        List<Auction> toEnd = auctionRepository.findActiveToEnd(AuctionStatus.ACTIVE, Instant.now());

        if (toEnd.isEmpty()) {
            return;
        }

        for (Auction auction : toEnd) {
            // If the bid queue still has pending bids, extend by 5 minutes and skip
            PendingBid peeked = auctionCacheAdapter.peekBid(auction.getId());
            if (peeked != null) {
                if (auction.isExtended()) {
                    log.warn("Auction #{} has pending bids but grace period is over. Forcing close.", auction.getId());
                } else {
                    AuctionState state = auctionCacheAdapter.getAuctionState(auction.getId());

                    if (state != null) {
                        Instant newEndTime = auction.getEndTime().plusSeconds(QUEUE_DRAIN_EXTENSION_SECONDS);

                        // Update the cache
                        state.setEndTime(newEndTime);
                        state.setExtended(true);
                        auctionCacheAdapter.updateAuctionState(auction.getId(), state);

                        // Update the DB Entity
                        auction.setEndTime(newEndTime);
                        auction.setExtended(true);

                        // Tell the FE to add 5 minutes more
                        publisher.publishAuctionExtended(auction);
                        log.info("Auction #{} has pending bids — extended to {} (FINAL EXTENSION)", auction.getId(), newEndTime);

                        continue;
                    }
                }
            }

            // Queue is empty or has already extended — finalize from Redis state
            AuctionState finalState = auctionCacheAdapter.getAuctionState(auction.getId());
            if (finalState != null) {
                auction.setCurrentPrice(finalState.getCurrentPrice());
                auction.setBidCount(finalState.getBidCount());
                auction.setEndTime(finalState.getEndTime());
                if (finalState.getWinnerId() != null) {
                    userRepository.findById(finalState.getWinnerId()).ifPresent(auction::setWinner);
                }
            }

            if (auction.getBidCount() == 0) {
                handleNoBids(auction);
            } else {
                handleWinner(auction);
            }

            auction.setStatus(AuctionStatus.ENDED);
            auctionRepository.save(auction);

            // Clear Redis after commit so nothing reads a stale state mid-transaction
            Long auctionId = auction.getId();
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        auctionCacheAdapter.clearAuctionCache(auctionId);
                    }
                });
            } else {
                auctionCacheAdapter.clearAuctionCache(auctionId);
            }

            String winnerLabel = auction.getWinner() != null
                    ? auction.getWinner().getDisplayName() + " #" + auction.getWinner().getId()
                    : null;
            publisher.publishAuctionEnded(
                    auction.getId(), winnerLabel, auction.getCurrentPrice(), auction.getBidCount());

            log.info("Auction #{} ENDED — winner: {}", auction.getId(), winnerLabel);
        }
    }

    // Helpers
    private void handleNoBids(Auction auction) {
        // Restore quantity back to the seller's product
        Product product = auction.getProduct();
        product.setQuantity(product.getQuantity() + auction.getAuctionedQuantity());
        productRepository.save(product);
        log.info("Auction #{} ended with no bids — quantity restored to product #{}",
                auction.getId(), product.getId());
    }

    private void handleWinner(Auction auction) {
        Bid winningBid = bidRepository.findByAuctionIdAndStatus(auction.getId(), BidStatus.HELD).orElse(null);

        if (winningBid == null) {
            log.warn("Auction #{} has bidCount > 0 but no HELD bid found", auction.getId());
            handleNoBids(auction);
            return;
        }

        User winner = winningBid.getBidder();
        User seller = auction.getSeller();

        // Flip bid to WON and transfer balance
        winningBid.setStatus(BidStatus.WON);
        bidRepository.save(winningBid);

        winner.setBalance(winner.getBalance().subtract(winningBid.getAmount()));
        seller.setBalance(seller.getBalance().add(winningBid.getAmount()));
        userRepository.save(winner);
        userRepository.save(seller);

        // Transfer auctionedQuantity to winner's product inventory
        Product soldProduct = auction.getProduct();
        Product winnerProduct = productRepository
                .findByIdAndOwnerUserId(soldProduct.getId(), winner.getId())
                .orElseGet(() -> {
                    // Winner doesn't own this product yet — create a new entry
                    Product newProduct = new Product();
                    newProduct.setProductName(soldProduct.getProductName());
                    newProduct.setPrice(soldProduct.getPrice());
                    newProduct.setQuantity(0);
                    newProduct.setTags(soldProduct.getTags());
                    newProduct.setOwner(winner);
                    newProduct.setCreatedAt(java.time.LocalDateTime.now());
                    return newProduct;
                });

        winnerProduct.setQuantity(winnerProduct.getQuantity() + auction.getAuctionedQuantity());
        productRepository.save(winnerProduct);

        auction.setWinner(winner);

        log.info("Auction #{} — winner #{} paid ${}, seller #{} credited. {} units transferred.",
                auction.getId(), winner.getId(), winningBid.getAmount(),
                seller.getId(), auction.getAuctionedQuantity());
    }
}