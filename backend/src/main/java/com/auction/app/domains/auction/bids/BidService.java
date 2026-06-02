package com.auction.app.domains.auction.bids;

import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import com.auction.app.domains.users.users.model.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

public interface BidService {
    void placeBid(Long auctionId, BidRequest request, User bidder);

    Slice<BidResponse> getBidHistory(Long auctionId, Pageable pageable);

    Page<Long> getAuctionsBiddenByCurrentUser(Pageable pageable);
}
