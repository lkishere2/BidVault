package com.auction.app.domains.auction.bids;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.auction.redis.AuctionRedisService;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;
import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import com.auction.app.domains.auction.bids.dtos.PendingBid;
import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.model.BidStatus;
import com.auction.app.domains.auction.bids.validator.BidValidatorService;
import com.auction.app.domains.auction.exceptions.*;
import com.auction.app.domains.users.exceptions.UserNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.app.domains.auction.auction.model.Auction;
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
    private final AuctionRedisService cache;
    private final AuctionPublisher publisher;
    private final SecurityUtils securityUtils;
    private final BidValidatorService bidValidatorService;
    private final BidServiceImpl self;

    public BidServiceImpl(
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            UserRepository userRepository,
            AuctionRedisService cache,
            AuctionPublisher publisher,
            SecurityUtils securityUtils,
            BidValidatorService bidValidatorService,
            @Lazy BidServiceImpl self) {

        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.cache = cache;
        this.publisher = publisher;
        this.securityUtils = securityUtils;
        this.bidValidatorService = bidValidatorService;
        this.self = self;
    }

    private static final long SNIPER_PROTECTION_SECONDS = 120;
    private static final BigDecimal INCREMENT_PERCENTAGE = BigDecimal.valueOf(0.05);

    @Override
    @Transactional
    public void placeBid(Long auctionId, BidRequest request) {

        log.info("[Bid Service - Place Bid] Get the current user and auction info");
        User bidder = securityUtils.getCurrentUser();
        AuctionResponse response = getActiveAuctionResponse(auctionId);
        Auction auction = findAuctionById(auctionId);

        log.info("[Bid Service - Place Bid] Validate info before continue");
        bidValidatorService.validateUser(bidder.getId(), response.getSellerId());
        bidValidatorService.validateBidAmount(request.getAmount(), response);
        bidValidatorService.validateSpendableBalance(bidder, request.getAmount());

        log.info("[Bid Service - Place Bid] Save new bid to the DB");
        Bid pendingBid = buildBid(auction, bidder, request.getAmount());
        bidRepository.save(pendingBid);

        log.info("[Bid Service - Place Bid] Create pending bid for Redis");
        PendingBid queued = buildPendingBid(pendingBid, auctionId, bidder, request.getAmount());

        try {
            cache.enqueueBid(auctionId, queued);
            log.info("[Bid Service - Place Bid] Bid queued successfully — auction #{}, bidder #{}, amount ${}",
                    auctionId, bidder.getId(), request.getAmount());
        } catch (Exception e) {
            pendingBid.setStatus(BidStatus.REFUNDED);
            bidRepository.save(pendingBid);
            log.error("[Bid Service - Place Bid] Failed to queue new bid — bid #{} marked REFUNDED, error: {}",
                    pendingBid.getId(), e.getMessage());
            return;
        }

        self.processNextBid(auctionId);
    }

    @Async
    @Transactional
    public void processNextBid(Long auctionId) {
        while (true) {
            log.info("[Bid Service - Process Bid] De-queuing next bid for auction #{}", auctionId);
            PendingBid pendingBid = cache.dequeueBid(auctionId);
            if (pendingBid == null)
                break;

            Bid bid = findBidById(pendingBid.getBidId());

            AuctionResponse response = getActiveAuctionResponse(auctionId);

            log.info("[Bid Service - Process Bid] Validate info for bid #{}", pendingBid.getBidId());
            if (!bidValidatorService.isBidEligible(response, pendingBid.getAmount())) {
                bid.setStatus(BidStatus.REFUNDED);
                bidRepository.save(bid);
                log.info("[Bid Service - Process Bid] Bid #{} rejected — marked REFUNDED. auction #{}", bid.getId(),
                        auctionId);
                continue;
            }

            User bidder = findBidderById(pendingBid.getBidderId());
            if (!bidValidatorService.hasSufficientBalance(bidder, pendingBid.getAmount())) {
                bid.setStatus(BidStatus.REFUNDED);
                bidRepository.save(bid);
                log.info("[Bid Service - Process Bid] Bid #{} rejected — insufficient balance. bidder #{}", bid.getId(),
                        pendingBid.getBidderId());
                continue;
            }

            refundPreviousHighestBidder(auctionId);

            bid.setStatus(BidStatus.HELD);
            bidRepository.save(bid);

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
            response.setWinnerId(pendingBid.getBidderId());
            response.setWinnerLabel(pendingBid.getBidderLabel());
            cache.cacheAuctionResponse(auctionId, response);
            log.info("[Bid Service - Process Bid] Bid #{} promoted to HELD — auction #{}, price ${}, bidder #{}",
                    bid.getId(), auctionId, pendingBid.getAmount(), pendingBid.getBidderId());

            publisher.publish(BidNotificationPayload.builder()
                    .auctionId(auctionId)
                    .currentPrice(pendingBid.getAmount())
                    .minNextBid(pendingBid.getAmount().add(newIncrement))
                    .bidderLabel(pendingBid.getBidderLabel())
                    .endTime(response.getEndTime())
                    .extended(isExtended)
                    .bidCount(response.getBidCount())
                    .build());
        }
    }

    @Override
    public Slice<BidResponse> getBidHistory(Long auctionId, Pageable pageable) {
        return bidRepository.findByAuctionIdOrderByPlacedAtDesc(auctionId, pageable)
                .map(BidResponse::from);
    }

    @Override
    public Page<Long> getAuctionsBiddenByCurrentUser(Pageable pageable) {
        return bidRepository.findDistinctAuctionIdsByBidderId(securityUtils.getCurrentUserId(), pageable);
    }

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
        AuctionResponse response = Optional.ofNullable(cache.getAuctionResponse(auctionId))
                .orElseGet(() -> {
                    log.info("[Bid Service] Auction #{} not in cache, fallback to DB", auctionId);
                    Auction auction = findAuctionById(auctionId);
                    AuctionResponse dbResponse = AuctionResponse.from(auction);
                    cache.cacheAuctionResponse(auctionId, dbResponse);
                    return dbResponse;
                });

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

    private void refundPreviousHighestBidder(Long auctionId) {
        bidRepository.findByAuctionIdAndStatus(auctionId, BidStatus.HELD)
                .forEach(oldBid -> {
                    oldBid.setStatus(BidStatus.REFUNDED);
                    bidRepository.save(oldBid);
                    log.info("[Bid Service] Bid #{} flipped to REFUNDED — outbid on auction #{}", oldBid.getId(),
                            auctionId);
                });
    }

    private boolean applySniperProtection(Long auctionId, AuctionResponse response) {
        Instant now = Instant.now();
        if (Duration.between(now, response.getEndTime()).getSeconds() < SNIPER_PROTECTION_SECONDS) {
            Instant newEndTime = now.plusSeconds(SNIPER_PROTECTION_SECONDS);
            Auction auction = findAuctionById(auctionId);
            response.setEndTime(newEndTime);
            response.setExtended(true);
            auction.setEndTime(newEndTime);
            auction.setExtended(true);
            auctionRepository.save(auction);
            log.info("[Bid Service] Auction #{} extended by 2 minutes", response.getId());
            return true;
        }
        return false;
    }

    private BigDecimal calculateIncrement(BigDecimal amount) {
        return amount.multiply(INCREMENT_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);
    }
}