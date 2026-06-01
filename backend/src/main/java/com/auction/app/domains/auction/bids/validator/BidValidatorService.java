package com.auction.app.domains.auction.bids.validator;

import java.math.BigDecimal;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.users.users.model.User;

public interface BidValidatorService {


    void validateUser(Long bidderId, Long sellerId);

    /**
     * Checks if the proposed bid meets the required minimum bid amount.
     */
    void validateBidAmount(BigDecimal amount, AuctionResponse response);

    /**
     * Validates that the user has enough unallocated funds available to place the bid.
     */
    void validateSpendableBalance(User bidder, BigDecimal amount);

    /**
     * Checks if a dequeued bid amount is still high enough to top the current price.
     */
    boolean isBidEligible(AuctionResponse response, BigDecimal amount);

    /**
     * Re-validates spendable balance checks downstream during queue processing.
     */
    boolean hasSufficientBalance(User bidder, BigDecimal amount);

}