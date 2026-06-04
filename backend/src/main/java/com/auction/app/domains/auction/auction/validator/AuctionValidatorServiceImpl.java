package com.auction.app.domains.auction.auction.validator;

import java.time.Instant;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.exceptions.InvalidEndTimeException;
import com.auction.app.domains.auction.exceptions.InvalidProductQuantity;
import com.auction.app.domains.auction.exceptions.NotUpcommingAuctionException;
import com.auction.app.domains.users.users.model.User;

@Service
public class AuctionValidatorServiceImpl implements AuctionValidatorService {

    @Override
    public void validateTime(Instant startTime, Instant endTime) {
        if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
            throw new InvalidEndTimeException("End time must be after start time");
        }
    }

    @Override
    public void validateQuantity(Integer requestedQuantity, Integer currentQuantity) {
        if (requestedQuantity == null || currentQuantity == null || requestedQuantity > currentQuantity) {
            throw new InvalidProductQuantity(
                    "Requested quantity (" + requestedQuantity + ") exceeds available stock (" + currentQuantity + ")"
            );
        }
    }

    @Override
    public void validateUser(User seller, User currentUser) {
        if (seller == null || currentUser == null || !seller.getId().equals(currentUser.getId())) {
            throw new BadCredentialsException("You are not the seller of this auction");
        }
    }

    @Override
    public void validateAuctionCancellation(Auction auction) {
        if (auction == null) {
            throw new NotUpcommingAuctionException("Auction not found");
        }
        if (auction.getStatus() == AuctionStatus.ENDED || auction.getStatus() == AuctionStatus.CANCELLED) {
            throw new NotUpcommingAuctionException("Cannot cancel an already ended or cancelled auction");
        }
        if (auction.getStatus() == AuctionStatus.ACTIVE && auction.getBidCount() > 0) {
            throw new NotUpcommingAuctionException("Cannot cancel an active auction that already has bids");
        }
    }
}