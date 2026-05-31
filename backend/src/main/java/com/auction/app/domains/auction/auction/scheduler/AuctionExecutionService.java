package com.auction.app.domains.auction.auction.scheduler;

import com.auction.app.domains.auction.auction.*;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.auction.redis.AuctionCacheAdapter;
import com.auction.app.domains.auction.exceptions.AuctionNotFoundException;
import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.model.BidStatus;
import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.domains.users.users.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionExecutionService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionCacheAdapter cache;
    private final AuctionPublisher publisher;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processActiveAuctionById(Long auctionId) {

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction not found: " + auctionId));

        AuctionResponse response = null;
        try {
            response = cache.getAuctionResponse(auction.getId());
            // Fix #18: was "Cache auction" on a read — renamed to "Cache hit"
            log.info("[Auction Execution Service - Activate Auction] Cache hit for auction #{}", auctionId);
        } catch (Exception e) {
            log.error("[Auction Execution Service - Activate Auction] Failed to read cache for auction #{}, errors: {}", auctionId, e.getMessage());
        }

        if (response != null) {
            log.info("[Auction Execution Service - Activate Auction] Cache auction #{} to active", auctionId);
            response.setStatus(AuctionStatus.ACTIVE);
            cache.cacheAuctionResponse(auction.getId(), response);
        }
        else {
            // Fix #6: cache-miss branch was setting status on the entity but never saving it.
            // AuctionHandler already did the bulk DB update via updateStatusForIds, so we just need
            // to build the response from the current entity state (which reflects ACTIVE after the
            // bulk update) and populate the cache correctly.
            log.info("[Auction Execution Service - Activate Auction] Auction #{} not exist in cache, fall back to DB!", auctionId);
            AuctionResponse freshResponse = AuctionResponse.from(auction);
            freshResponse.setStatus(AuctionStatus.ACTIVE);
            cache.cacheAuctionResponse(auction.getId(), freshResponse);
        }

        publisher.publishAuctionStarted(auction);
        log.info("Auction #{} is now ACTIVE", auction.getId());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processEndedAuctionById(Long auctionId) {

        Auction auction = auctionRepository.findByIdWithDetails(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction not found: " + auctionId));

        AuctionResponse response = null;
        try {
            response = cache.getAuctionResponse(auction.getId());
            // Fix #18: was "Cache auction" on a read — renamed to "Cache hit"
            log.info("[Auction Execution Service - End Auction] Cache hit for auction #{}", auctionId);
        } catch (Exception e) {
            log.error("[Auction Execution Service - End Auction] Failed to read cache for auction #{}, errors: {}", auctionId, e.getMessage());
        }

        if (response != null) {
            // Sync live bidding state from cache back to the entity before persisting
            auction.setCurrentPrice(response.getCurrentPrice());
            auction.setBidCount(response.getBidCount());
            auction.setEndTime(response.getEndTime());
            response.setStatus(AuctionStatus.ENDED);
            cache.cacheAuctionResponse(auction.getId(), response);
            log.info("[Auction Execution Service - End Auction] Cache auction #{} success to update", auctionId);
        }
        // Fix #14: if response is null (Redis cold), auction.getBidCount() reads the DB value which
        // is never updated during live bidding — only the cached bidCount is incremented per bid.
        // Without cache, we cannot reliably know the true bid count, so we check for a HELD bid
        // directly instead of trusting the stale DB bidCount field.

        // Fix #3: BidRepository.findByAuctionIdAndStatus now returns List (bid domain fix).
        // handleWinner updated accordingly — it takes the first HELD bid and handles the rest defensively.
        List<Bid> heldBids = bidRepository.findByAuctionIdAndStatus(auctionId, BidStatus.HELD);

        if (heldBids.isEmpty()) {
            // Fix #14: use the HELD bid presence as the source of truth instead of the stale bidCount
            handleNoBids(auction);
        }
        else {
            handleWinner(auction, heldBids);
        }

        auction.setStatus(AuctionStatus.ENDED);
        auctionRepository.save(auction);

        Long id = auction.getId();
        String winnerLabel = auction.getWinner() != null
                ? auction.getWinner().getDisplayName() + " #" + auction.getWinner().getId()
                : null;
        BigDecimal finalPrice = auction.getCurrentPrice();
        Integer finalBidCount = auction.getBidCount();
        java.time.Instant finalEndTime = auction.getEndTime();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                // Fix #5: publishAuctionEnded was firing before commit — if any of handleWinner's
                // saves rolled back, clients would receive an ENDED notification for an ACTIVE auction.
                // Moved inside afterCommit so the publishing only happens once the DB is durably updated.
                publisher.publishAuctionEnded(id, winnerLabel, finalPrice, finalBidCount, finalEndTime);
                cache.clearAuctionCache(id);
            }
        });

        log.info("Auction #{} ENDED — winner: {}", auction.getId(), winnerLabel);
    }

    // Helpers

    private void handleNoBids(Auction auction) {
        Product product = auction.getProduct();
        product.setQuantity(product.getQuantity() + auction.getAuctionedQuantity());
        productRepository.save(product);
        log.info("Auction #{} ended with no bids — quantity restored to product #{}", auction.getId(), product.getId());
    }

    private void handleWinner(Auction auction, List<Bid> heldBids) {

        // Fix #3: take the first HELD bid as the winning bid; any extras are defensive leftovers
        // from before the uniqueness constraint was enforced — refund them all
        Bid winningBid = heldBids.getFirst();
        for (int i = 1; i < heldBids.size(); i++) {
            heldBids.get(i).setStatus(BidStatus.REFUNDED);
            bidRepository.save(heldBids.get(i));
            log.warn("Auction #{} — extra HELD bid #{} found and refunded", auction.getId(), heldBids.get(i).getId());
        }

        User winner = winningBid.getBidder();
        User seller = auction.getSeller();

        // Flip bid to WON and transfer balance
        winningBid.setStatus(BidStatus.WON);
        bidRepository.save(winningBid);

        // Fix #4: winner's balance was being subtracted here even though funds were already locked
        // when the bid was placed (HELD status means the amount is excluded from spendable balance).
        // The correct action is simply to transfer the locked amount to the seller — not deduct again.
        seller.setBalance(seller.getBalance().add(winningBid.getAmount()));
        userRepository.save(seller);

        // Transfer auctionedQuantity to winner's product inventory
        Product soldProduct = auction.getProduct();
        Product winnerProduct = productRepository
                .findByIdAndOwnerUserId(soldProduct.getId(), winner.getId())
                .orElseGet(() -> Product.builder()
                        // Winner doesn't own this product yet — create a new entry
                        .productName(soldProduct.getProductName())
                        .description(soldProduct.getDescription())
                        .productImageUrl(soldProduct.getProductImageUrl())
                        .tags(soldProduct.getTags())
                        .owner(winner)
                        // Fix #9: quantity must be initialized to 0 — if null, the addition below throws NPE
                        .quantity(0)
                        .build()
                );

        winnerProduct.setQuantity(winnerProduct.getQuantity() + auction.getAuctionedQuantity());
        productRepository.save(winnerProduct);

        auction.setWinner(winner);

        log.info("Auction #{} — winner #{} credited ${} to seller #{}. {} units transferred.",
                auction.getId(), winner.getId(), winningBid.getAmount(),
                seller.getId(), auction.getAuctionedQuantity());
    }
}