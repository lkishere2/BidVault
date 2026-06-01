package com.auction.app.domains.auction.auction.validator;

import java.time.Instant;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.users.users.model.User;

public interface AuctionValidatorService {

    void validateTime(Instant startTime, Instant endTime);

    void validateQuantity(Integer requestedQuantity, Integer currentQuantity);

    void validateUser(User seller, User currentUser);

    void validateAuctionCancellation(Auction auction);
}