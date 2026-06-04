package com.auction.app.domains.auction.bids;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.List;

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

import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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
    public void placeBid(Long auctionId, BidRequest request, User bidder) {

        Auction auction = auctionRepository.findByIdForUpdate(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction not found."));

        // Now validate and save safely
        AuctionResponse response = getActiveAuctionResponse(auctionId);
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
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processNextBid(Long auctionId) {
        // PESSIMISTIC LOCK: Thread will wait here until any previous
        // processNextBid for this auction is fully complete.

        while (true) {
            PendingBid pendingBid = cache.dequeueBid(auctionId);
            if (pendingBid == null)
                break;

            Bid bid = findBidById(pendingBid.getBidId());
            AuctionResponse response = getActiveAuctionResponse(auctionId);

            if (!bidValidatorService.isBidEligible(response, pendingBid.getAmount())) {
                bid.setStatus(BidStatus.REFUNDED);
                bidRepository.save(bid);
                continue;
            }

            // ATOMIC STEP:
            // 1. Clear previous HELD status (The repo method is atomic)
            bidRepository.refundPreviousHighest(auctionId);

            // 2. Set current bid to HELD
            bid.setStatus(BidStatus.HELD);
            bidRepository.save(bid);

            // 3. Update Cache & Notify
            updateAuctionAndNotify(auctionId, response, pendingBid);
            log.info("[Bid Service] Bid #{} promoted to HELD", bid.getId());
        }
    }

    private void updateAuctionAndNotify(Long auctionId, AuctionResponse response, PendingBid pendingBid) {
        BigDecimal newIncrement = calculateIncrement(pendingBid.getAmount());
        response.setCurrentPrice(pendingBid.getAmount());
        response.setMinBidIncrement(newIncrement);
        response.setBidCount(response.getBidCount() + 1);
        response.setWinnerId(pendingBid.getBidderId());
        response.setWinnerLabel(pendingBid.getBidderLabel());

        // Check if sniper protection applies
        boolean isExtended = applySniperProtection(auctionId, response);
        response.setExtended(isExtended);

        // Immediately persist auction to DB
        Auction auction = findAuctionById(auctionId);
        auction.setCurrentPrice(response.getCurrentPrice());
        auction.setBidCount(response.getBidCount());
        auction.setMinBidIncrement(response.getMinBidIncrement());
        auction.setWinner(userRepository.findById(response.getWinnerId()).orElse(null));
        if (isExtended) {
            auction.setEndTime(response.getEndTime());
            auction.setExtended(true);
        }
        auctionRepository.save(auction);

        cache.cacheAuctionResponse(auctionId, response);

        publisher.publishBidFeedEvent(auctionId, BidFeedEvent.builder()
                .bidId(pendingBid.getBidId())
                .auctionId(auctionId)
                .bidderId(pendingBid.getBidderId())
                .bidderLabel(pendingBid.getBidderLabel())
                .amount(pendingBid.getAmount())
                .placedAt(pendingBid.getPlacedAt())
                .build());

        BidNotificationPayload ticker = BidNotificationPayload.builder()
                .auctionId(auctionId)
                .currentPrice(response.getCurrentPrice())
                .minNextBid(response.getCurrentPrice().add(response.getMinBidIncrement()))
                .bidderLabel(response.getWinnerLabel())
                .bidCount(response.getBidCount())
                .endTime(response.getEndTime())
                .extended(response.isExtended())
                .ended(false)
                .build();
        publisher.publish(ticker);

        log.info("[Bid Service] Auction #{} updated: price ${}, bids {}, minIncrement ${}",
                auctionId, response.getCurrentPrice(), response.getBidCount(), response.getMinBidIncrement());
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

    @Scheduled(fixedRate = 500)
    public void syncAuctionsToDb() {

        List<AuctionResponse> responses = cache.getAllAuctionResponses();

        for (AuctionResponse response : responses) {
            if (response.getStatus() != AuctionStatus.ACTIVE) {
                continue;
            }

            auctionRepository.findById(response.getId()).ifPresent(
                    auction -> {
                        auction.setCurrentPrice(response.getCurrentPrice());
                        auction.setBidCount(response.getBidCount());
                        auction.setMinBidIncrement(response.getMinBidIncrement());
                        if (response.getWinnerId() != null) {
                            userRepository.findById(response.getWinnerId()).ifPresent(auction::setWinner);
                        }
                        auctionRepository.save(auction);
                    });
        }
    }

    @Scheduled(fixedRate = 2000)
    @Transactional
    public void drainDeadBids() {
        try {
            List<Auction> activeAuctions = auctionRepository.findAll().stream()
                    .filter(a -> a.getStatus() == AuctionStatus.ACTIVE)
                    .toList();

            for (Auction auction : activeAuctions) {
                int deletedCount = bidRepository.deleteDeadBids(auction.getId(), auction.getCurrentPrice());
                if (deletedCount > 0) {
                    log.info("[Dead Bid Drainer] Auction #{} — deleted {} dead bids at price ${}",
                            auction.getId(), deletedCount, auction.getCurrentPrice());
                }
            }
        } catch (Exception e) {
            log.error("[Dead Bid Drainer] Error draining dead bids", e);
        }
    }
}