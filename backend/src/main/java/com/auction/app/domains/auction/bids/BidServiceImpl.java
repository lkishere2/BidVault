package com.auction.app.domains.auction.bids;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;
import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import com.auction.app.domains.auction.bids.dtos.PendingBid;
import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.model.BidStatus;
import com.auction.app.domains.auction.exceptions.*;
import com.auction.app.domains.users.exceptions.UserNotFoundException;

import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.redis.AuctionCacheAdapter;
import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.infrastructure.security.SecurityUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BidServiceImpl implements BidService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final AuctionCacheAdapter auctionCacheAdapter;
    private final AuctionPublisher publisher;
    private final SecurityUtils securityUtils;
    private final BidServiceImpl self;

    private static final long SNIPER_PROTECTION_SECONDS = 120L;
    private static final BigDecimal INCREMENT_PERCENTAGE = BigDecimal.valueOf(0.05);

    public BidServiceImpl(
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            UserRepository userRepository,
            AuctionCacheAdapter auctionCacheAdapter,
            AuctionPublisher publisher,
            SecurityUtils securityUtils,
            @Lazy BidServiceImpl self
    ) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.auctionCacheAdapter = auctionCacheAdapter;
        this.publisher = publisher;
        this.securityUtils = securityUtils;
        this.self = self;
    }

    @Override
    @Transactional
    public void placeBid(Long auctionId, BidRequest request) {

        Long currentUserId = securityUtils.getCurrentUserId();
        User bidder = findBidderById(currentUserId);
        AuctionResponse response = getActiveAuctionResponse(auctionId);

        validateUser(bidder.getId(), response.getSellerId());
        validateBidAmount(request.getAmount(), response);
        validateSpendableBalance(bidder, request.getAmount());

        Auction auction = findAuctionById(auctionId);

        Bid pendingBid = buildBid(auction, bidder, request.getAmount());
        Bid savedBid = bidRepository.save(pendingBid);

        PendingBid queued = buildPendingBid(savedBid, auctionId, bidder, request.getAmount());

        try {
            auctionCacheAdapter.enqueueBid(auctionId, queued);
            log.info("Bid queued successfully — auction #{}, bidder #{}, amount ${}", auctionId, bidder.getId(), request.getAmount());
        } catch (Exception e) {
            savedBid.setStatus(BidStatus.REFUNDED);
            bidRepository.save(savedBid);
            log.error("Failed to queue new bid — bid #{} marked REFUNDED, error: {}", savedBid.getId(), e.getMessage());
            return;
        }

        self.dequeueBid(auctionId);
    }

    @Async
    public void dequeueBid(Long auctionId) {
        boolean lockAcquired = auctionCacheAdapter.acquireProcessingLock(auctionId);
        if (!lockAcquired) {
            log.info("Bid processing lock not acquired for auction #{} — another thread is processing", auctionId);
            return;
        }

        try {
            boolean hasMoreBids = true;
            while (hasMoreBids) {
                try {
                    hasMoreBids = self.processNextBid(auctionId)
                            .map(payload -> {
                                publisher.publish(payload);
                                return true;
                            })
                            .orElse(false);
                } catch (Exception e) {
                    log.error("Error processing bid for auction #{} — stopping dequeue loop: {}", auctionId, e.getMessage());
                    hasMoreBids = false;
                }
            }
        } finally {
            auctionCacheAdapter.releaseProcessingLock(auctionId);
        }
    }

    @Transactional
    public Optional<BidNotificationPayload> processNextBid(Long auctionId) {

        PendingBid pendingBid = auctionCacheAdapter.dequeueBid(auctionId);
        if (pendingBid == null) return Optional.empty();

        Bid bid = findBidById(pendingBid.getBidId());

        AuctionResponse response = getActiveAuctionResponse(auctionId);
        if (!isBidEligible(response, pendingBid.getAmount())) {
            bid.setStatus(BidStatus.REFUNDED);
            bidRepository.save(bid);
            log.info("Bid #{} rejected after dequeue — marked REFUNDED. auction #{}", bid.getId(), auctionId);
            return Optional.empty();
        }

        User bidder = findBidderById(pendingBid.getBidderId());
        if (!hasSufficientBalance(bidder, pendingBid.getAmount())) {
            bid.setStatus(BidStatus.REFUNDED);
            bidRepository.save(bid);
            log.info("Bid #{} rejected after dequeue — insufficient balance. bidder #{}", bid.getId(), pendingBid.getBidderId());
            return Optional.empty();
        }

        refundPreviousHighestBidder(auctionId);

        bid.setStatus(BidStatus.HELD);
        bidRepository.save(bid);

        // Publish to the live feed so all watchers see "X bid $Y"
        BidFeedEvent feedEvent = BidFeedEvent.builder()
                .bidderLabel(pendingBid.getBidderLabel())
                .amount(pendingBid.getAmount())
                .placedAt(pendingBid.getPlacedAt())
                .build();
        publisher.publishBidFeedEvent(auctionId, feedEvent);

        boolean isExtended = applySniperProtection(auctionId, response);

        BigDecimal newIncrement = calculateIncrement(pendingBid.getAmount());
        response.setCurrentPrice(pendingBid.getAmount());
        response.setMinBidIncrement(newIncrement);
        response.setBidCount(response.getBidCount() + 1);
        response.setWinnerLabel(pendingBid.getBidderLabel());
        auctionCacheAdapter.cacheAuctionResponse(auctionId, response);
        log.info("Bid #{} promoted to HELD — auction #{}, price ${}, bidder #{}", bid.getId(), auctionId, pendingBid.getAmount(), pendingBid.getBidderId());

        return Optional.of(BidNotificationPayload.builder()
                .auctionId(auctionId)
                .currentPrice(pendingBid.getAmount())
                .minNextBid(pendingBid.getAmount().add(newIncrement))
                .bidderLabel(pendingBid.getBidderLabel())
                .endTime(response.getEndTime())
                .extended(isExtended)
                .bidCount(response.getBidCount())
                .build());
    }

    @Override
    public List<BidResponse> getBidHistory(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByPlacedAtDesc(auctionId)
                .stream()
                .map(BidResponse::from)
                .toList();
    }

    @Override
    public List<Long> getAuctionsBiddenByCurrentUser() {
        try {
            Long currentUserId = securityUtils.getCurrentUserId();
            return bidRepository.findDistinctAuctionIdsByBidderId(currentUserId);
        } catch (IllegalStateException e) {
            throw new InvalidBidException("User is not authenticated.");
        }
    }

    // Helpers

    private Bid buildBid(Auction auction, User bidder, BigDecimal amount) {
        return Bid.builder()
                .auction(auction)
                .bidder(bidder)
                .amount(amount)
                .build();
    }

    private PendingBid buildPendingBid(Bid bid, Long auctionId, User bidder, BigDecimal amount) {
        return PendingBid.builder()
                .bidId(bid.getId())
                .auctionId(auctionId)
                .bidderId(bidder.getId())
                .bidderLabel(bidder.getDisplayName())
                .amount(amount)
                .placedAt(bid.getPlacedAt())
                .build();
    }

    private AuctionResponse getActiveAuctionResponse(Long auctionId) {
        AuctionResponse response = auctionCacheAdapter.getAuctionResponse(auctionId);
        if (response == null) {
            log.info("Auction #{} is not found in cache. Fallback to DB!", auctionId);
            Auction auction = findAuctionById(auctionId);
            response = AuctionResponse.from(auction);
            auctionCacheAdapter.cacheAuctionResponse(auctionId, response);
        }
        if (response.getStatus() != AuctionStatus.ACTIVE) {
            throw new NotActiveAuctionException("Auction with ID " + auctionId + " is not active.");
        }
        return response;
    }

    private Auction findAuctionById(Long auctionId) {
        return auctionRepository.findById(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction with ID " + auctionId + " was not found."));
    }

    private Bid findBidById(Long bidId) {
        return bidRepository.findById(bidId)
                .orElseThrow(() -> new BidNotFoundException("Bid record with ID " + bidId + " was not found."));
    }

    private User findBidderById(Long bidderId) {
        return userRepository.findById(bidderId)
                .orElseThrow(() -> new UserNotFoundException("Bidder with ID " + bidderId + " was not found."));
    }

    private void validateBidAmount(BigDecimal amount, AuctionResponse response) {
        BigDecimal minimumBid = response.getCurrentPrice().add(response.getMinBidIncrement());
        if (amount.compareTo(minimumBid) < 0) {
            throw new InvalidBidException("Bid must be at least " + minimumBid + " (current price + minimum increment)");
        }
    }

    private void validateSpendableBalance(User bidder, BigDecimal amount) {
        BigDecimal spendable = getSpendableBalance(bidder);
        if (amount.compareTo(spendable) > 0) {
            throw new InsufficientBalanceException("Insufficient spendable balance. Available: " + spendable + ", Attempted: " + amount);
        }
    }

    private BigDecimal getSpendableBalance(User user) {
        BigDecimal locked = bidRepository.sumLockedAmountByBidderIdAndStatuses(
                user.getId(), List.of(BidStatus.PENDING, BidStatus.HELD)
        );
        return user.getBalance().subtract(locked);
    }

    private void validateUser(Long bidderId, Long sellerId) {
        if (sellerId.equals(bidderId)) {
            throw new InvalidBidException("You cannot bid on your own auction");
        }
    }

    private boolean isBidEligible(AuctionResponse response, BigDecimal amount) {
        if (response.getStatus() != AuctionStatus.ACTIVE) return false;
        BigDecimal minimumBid = response.getCurrentPrice().add(response.getMinBidIncrement());
        return amount.compareTo(minimumBid) >= 0;
    }

    private boolean hasSufficientBalance(User bidder, BigDecimal amount) {
        return amount.compareTo(getSpendableBalance(bidder)) <= 0;
    }

    private void refundPreviousHighestBidder(Long auctionId) {
        bidRepository.findByAuctionIdAndStatus(auctionId, BidStatus.HELD)
                .forEach(oldBid -> {
                    oldBid.setStatus(BidStatus.REFUNDED);
                    bidRepository.save(oldBid);
                    log.info("Bid #{} flipped to REFUNDED — outbid on auction #{}", oldBid.getId(), auctionId);
                });
    }

    private boolean applySniperProtection(Long auctionId, AuctionResponse response) {
        Instant now = Instant.now();
        if (Duration.between(now, response.getEndTime()).getSeconds() < SNIPER_PROTECTION_SECONDS) {
            Instant newEndTime = now.plusSeconds(SNIPER_PROTECTION_SECONDS);
            response.setEndTime(newEndTime);
            auctionRepository.updateEndTime(auctionId, newEndTime);
            log.info("Auction #{} extended by 2 minutes", response.getId());
            return true;
        }
        return false;
    }

    private BigDecimal calculateIncrement(BigDecimal amount) {
        return amount.multiply(INCREMENT_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);
    }
}