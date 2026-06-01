package com.auction.app.domains.auction.bids.validator;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.model.BidStatus;
import com.auction.app.domains.auction.exceptions.InsufficientBalanceException;
import com.auction.app.domains.auction.exceptions.InvalidBidException;
import com.auction.app.domains.users.users.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BidValidatorServiceImpl implements BidValidatorService {

    private final BidRepository bidRepository;

    @Override
    public void validateUser(Long bidderId, Long sellerId) {
        if (sellerId.equals(bidderId)) {
            throw new InvalidBidException("You cannot bid on your own auction");
        }
    }

    @Override
    public void validateBidAmount(BigDecimal amount, AuctionResponse response) {
        BigDecimal minimumBid = response.getCurrentPrice().add(response.getMinBidIncrement());
        if (amount.compareTo(minimumBid) < 0) {
            throw new InvalidBidException("Bid must be at least " + minimumBid + " (current price + minimum increment)");
        }
    }

    @Override
    public void validateSpendableBalance(User bidder, BigDecimal amount) {
        BigDecimal spendable = getSpendableBalance(bidder);
        if (amount.compareTo(spendable) > 0) {
            throw new InsufficientBalanceException("Insufficient spendable balance. Available: " + spendable + ", Attempted: " + amount);
        }
    }

    @Override
    public boolean isBidEligible(AuctionResponse response, BigDecimal amount) {
        if (response.getStatus() != AuctionStatus.ACTIVE) return false;
        BigDecimal minimumBid = response.getCurrentPrice().add(response.getMinBidIncrement());
        return amount.compareTo(minimumBid) >= 0;
    }

    @Override
    public boolean hasSufficientBalance(User bidder, BigDecimal amount) {
        return amount.compareTo(getSpendableBalance(bidder)) <= 0;
    }

    private BigDecimal getSpendableBalance(User user) {
        BigDecimal locked = bidRepository.sumLockedAmountByBidderIdAndStatuses(
                user.getId(), List.of(BidStatus.PENDING, BidStatus.HELD)
        );
        return user.getBalance().subtract(locked);
    }
}