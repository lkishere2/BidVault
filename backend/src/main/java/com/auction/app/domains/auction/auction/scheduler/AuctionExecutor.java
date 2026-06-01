package com.auction.app.domains.auction.auction.scheduler;

import com.auction.app.domains.auction.auction.*;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.auction.redis.AuctionRedisService;
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
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionExecutor {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionRedisService cache;
    private final AuctionPublisher publisher;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processActiveAuctionById(Long auctionId) {

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction not found: " + auctionId));

        AuctionResponse response = null;
        try {
            response = cache.getAuctionResponse(auction.getId());
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
            log.info("[Auction Execution Service - End Auction] Cache hit for auction #{}", auctionId);
        } catch (Exception e) {
            log.error("[Auction Execution Service - End Auction] Failed to read cache for auction #{}, errors: {}", auctionId, e.getMessage());
        }

        if (response != null) {
            auction.setCurrentPrice(response.getCurrentPrice());
            auction.setBidCount(response.getBidCount());
            auction.setEndTime(response.getEndTime());
            response.setStatus(AuctionStatus.ENDED);
            cache.cacheAuctionResponse(auction.getId(), response);
            log.info("[Auction Execution Service - End Auction] Cache auction #{} success to update", auctionId);
        }
        else {
            log.warn("[Auction Execution Service - End Auction] No cache entry for auction #{}, proceeding with DB values", auctionId);
        }

        List<Bid> heldBids = bidRepository.findByAuctionIdAndStatus(auctionId, BidStatus.HELD);

        if (heldBids.isEmpty()) {
            handleNoBids(auction);
        }
        else {
            handleWinner(auction, heldBids);
        }

        auction.setStatus(AuctionStatus.ENDED);
        auctionRepository.save(auction);

        Long id = auction.getId();
        String winnerLabel = auction.getWinner() != null
                ? auction.getWinner().getDisplayName()
                : null;
        BigDecimal finalPrice = auction.getCurrentPrice();
        Integer finalBidCount = auction.getBidCount();
        Instant finalEndTime = auction.getEndTime();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
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
        Bid winningBid = heldBids.getFirst();
        for (int i = 1; i < heldBids.size(); i++) {
            heldBids.get(i).setStatus(BidStatus.REFUNDED);
            bidRepository.save(heldBids.get(i));
            log.warn("Auction #{} — extra HELD bid #{} found and refunded", auction.getId(), heldBids.get(i).getId());
        }

        User winner = winningBid.getBidder();
        User seller = auction.getSeller();

        winningBid.setStatus(BidStatus.WON);
        bidRepository.save(winningBid);

        seller.setBalance(seller.getBalance().add(winningBid.getAmount()));
        userRepository.save(seller);

        Product soldProduct = auction.getProduct();
        Product winnerProduct = productRepository
                .findByIdAndOwnerUserId(soldProduct.getId(), winner.getId())
                .orElseGet(() -> Product.builder()
                        .productName(soldProduct.getProductName())
                        .description(soldProduct.getDescription())
                        .productImageUrl(soldProduct.getProductImageUrl())
                        .tags(soldProduct.getTags())
                        .owner(winner)
                        .quantity(0)
                        .build()
                );

        winnerProduct.setQuantity(winnerProduct.getQuantity() + auction.getAuctionedQuantity());
        log.info("Product is sent to {}", winner.getDisplayName());
        productRepository.save(winnerProduct);
        log.info("This was saved");

        auction.setWinner(winner);

        log.info("Auction #{} — winner #{} credited ${} to seller #{}. {} units transferred.",
                auction.getId(), winner.getId(), winningBid.getAmount(),
                seller.getId(), auction.getAuctionedQuantity());
    }
}