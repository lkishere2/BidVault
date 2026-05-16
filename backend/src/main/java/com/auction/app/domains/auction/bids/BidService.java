package com.auction.app.domains.auction.bids;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.app.domains.auction.auction.Auction;
import com.auction.app.domains.auction.auction.AuctionCacheAdapter;
import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.AuctionState;
import com.auction.app.domains.auction.auction.AuctionStatus;
import com.auction.app.domains.users.users.User;
import com.auction.app.domains.users.users.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BidService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final AuctionCacheAdapter auctionCacheAdapter;

    private static final long SNIPER_PROTECTION_SECONDS = 120L;
    private static final BigDecimal INCREMENT_PERCENTAGE = BigDecimal.valueOf(0.05);

    public void placeBid(Long auctionId, BidRequest request) {
        User bidder = getCurrentUser();
        AuctionState state = getActiveAuctionState(auctionId);

        validateNotSeller(auctionId, bidder.getId());
        validateBidAmount(request.getAmount(), state);
        validateSpendableBalance(bidder, request.getAmount());

        PendingBid pendingBid = PendingBid.builder()
                .auctionId(auctionId)
                .bidderId(bidder.getId())
                .bidderLabel(bidder.getDisplayName() + " # " + bidder.getId())
                .amount(request.getAmount())
                .placedAt(Instant.now())
                .build();

        auctionCacheAdapter.enqueueBid(auctionId, pendingBid);
    }

    @Transactional
    public Optional<BidNotificationPayload> processNextBid(Long auctionId) {
        PendingBid pendingBid = auctionCacheAdapter.dequeueBid(auctionId);
        if (pendingBid == null) {
            return Optional.empty();
        }

        AuctionState state = auctionCacheAdapter.getAuctionState(auctionId);
        if (!isBidEligibleForProcessing(state, pendingBid)) {
            saveRejectedBid(auctionId, pendingBid);
            return Optional.empty();
        }

        User bidder = userRepository.findById(pendingBid.getBidderId())
                .orElseThrow(() -> new RuntimeException("Bidder not found"));

        if (!hasSufficientSpendableBalance(bidder, pendingBid.getAmount())) {
            log.info("Bid rejected after dequeue due to insufficient balance. Bidder #{}", pendingBid.getBidderId());
            saveRejectedBid(auctionId, pendingBid);
            return Optional.empty();
        }

        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        refundPreviousHighestBidder(auctionId);
        persistNewWinningBid(auction, bidder, pendingBid);

        boolean isExtended = applySniperProtection(state);
        BigDecimal newIncrement = calculateNextIncrement(pendingBid.getAmount());

        updateAuctionCacheState(auctionId, state, pendingBid, newIncrement);

        return Optional.of(buildNotificationPayload(auctionId, state, pendingBid, newIncrement, isExtended));
    }

    public List<BidResponse> getBidHistory(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByPlacedAtDesc(auctionId)
                .stream()
                .map(BidResponse::from)
                .toList();
    }

    public List<Long> getAuctionsBiddenByCurrentUser() {
        return bidRepository.findDistinctAuctionIdsByBidderUserId(getCurrentUser().getId());
    }

    // --- Private Helper Methods ---

    private AuctionState getActiveAuctionState(Long auctionId) {
        AuctionState state = auctionCacheAdapter.getAuctionState(auctionId);
        if (state == null || state.getStatus() != AuctionStatus.ACTIVE) {
            throw new RuntimeException("Auction not found or not active");
        }
        return state;
    }

    private void validateNotSeller(Long auctionId, Long bidderId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        if (auction.getSeller().getId().equals(bidderId)) {
            throw new RuntimeException("You cannot bid on your own auction");
        }
    }

    private void validateBidAmount(BigDecimal amount, AuctionState state) {
        BigDecimal minimumBid = state.getCurrentPrice().add(state.getMinBidIncrement());
        if (amount.compareTo(minimumBid) < 0) {
            throw new RuntimeException("Bid must be at least " + minimumBid);
        }
    }

    private void validateSpendableBalance(User bidder, BigDecimal amount) {
        BigDecimal spendable = getSpendableBalance(bidder);
        if (amount.compareTo(spendable) > 0) {
            throw new RuntimeException("Insufficient balance. Spendable: " + spendable);
        }
    }

    private boolean isBidEligibleForProcessing(AuctionState state, PendingBid pendingBid) {
        if (state == null || state.getStatus() != AuctionStatus.ACTIVE) {
            return false;
        }
        BigDecimal minimumBid = state.getCurrentPrice().add(state.getMinBidIncrement());
        return pendingBid.getAmount().compareTo(minimumBid) >= 0;
    }

    private boolean hasSufficientSpendableBalance(User bidder, BigDecimal amount) {
        return amount.compareTo(getSpendableBalance(bidder)) <= 0;
    }

    private BigDecimal getSpendableBalance(User user) {
        BigDecimal totalHeld = bidRepository.sumAmountByBidderIdAndStatus(user.getId(), BidStatus.HELD);
        return user.getBalance().subtract(totalHeld);
    }

    private void persistNewWinningBid(Auction auction, User bidder, PendingBid pendingBid) {
        Bid newBid = Bid.builder()
                .auction(auction)
                .bidder(bidder)
                .amount(pendingBid.getAmount())
                .status(BidStatus.HELD)
                .placedAt(pendingBid.getPlacedAt())
                .build();
        bidRepository.save(newBid);
    }

    private void refundPreviousHighestBidder(Long auctionId) {
        bidRepository.findByAuctionIdAndStatus(auctionId, BidStatus.HELD)
                .ifPresent(oldBid -> {
                    oldBid.setStatus(BidStatus.REFUNDED);
                    bidRepository.save(oldBid);
                    log.info("Bid #{} status shifted to REFUNDED for auction #{}", oldBid.getId(), auctionId);
                });
    }

    private void saveRejectedBid(Long auctionId, PendingBid pendingBid) {
        try {
            Auction auction = auctionRepository.findById(auctionId).orElse(null);
            User bidder = userRepository.findById(pendingBid.getBidderId()).orElse(null);
            if (auction != null && bidder != null) {
                Bid failedBid = Bid.builder()
                        .auction(auction)
                        .bidder(bidder)
                        .amount(pendingBid.getAmount())
                        .status(BidStatus.REFUNDED)
                        .placedAt(pendingBid.getPlacedAt())
                        .build();
                bidRepository.save(failedBid);
            }
        } catch (Exception e) {
            log.error("Failed to store trace log of invalid bid for auction #{}", auctionId, e);
        }
    }

    private boolean applySniperProtection(AuctionState state) {
        Instant now = Instant.now();
        long secondsLeft = Duration.between(now, state.getEndTime()).getSeconds();
        if (secondsLeft < SNIPER_PROTECTION_SECONDS) {
            state.setEndTime(now.plusSeconds(SNIPER_PROTECTION_SECONDS));
            return true;
        }
        return false;
    }

    private BigDecimal calculateNextIncrement(BigDecimal currentAmount) {
        return currentAmount.multiply(INCREMENT_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);
    }

    private void updateAuctionCacheState(Long auctionId, AuctionState state, PendingBid pendingBid, BigDecimal newIncrement) {
        state.setCurrentPrice(pendingBid.getAmount());
        state.setMinBidIncrement(newIncrement);
        state.setBidCount(state.getBidCount() + 1);
        state.setWinnerId(pendingBid.getBidderId());
        state.setWinnerLabel(pendingBid.getBidderLabel());

        auctionCacheAdapter.updateAuctionState(auctionId, state);

        log.info("Bid successfully processed as HELD — auction #{}, price ${}, bidder #{}",
                auctionId, pendingBid.getAmount(), pendingBid.getBidderId());
    }

    private BidNotificationPayload buildNotificationPayload(Long auctionId, AuctionState state, PendingBid pendingBid, BigDecimal newIncrement, boolean isExtended) {
        return BidNotificationPayload.builder()
                .auctionId(auctionId)
                .currentPrice(pendingBid.getAmount())
                .minNextBid(pendingBid.getAmount().add(newIncrement))
                .bidderLabel(pendingBid.getBidderLabel())
                .endTime(state.getEndTime())
                .extended(isExtended)
                .bidCount(state.getBidCount())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}