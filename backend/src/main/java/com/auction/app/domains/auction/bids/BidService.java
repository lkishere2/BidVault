package com.auction.app.domains.auction.bids;

import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.dtos.BidResponse;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BidService {
    void placeBid(Long auctionId, BidRequest request);
    List<BidResponse> getBidHistory(Long auctionId);
    Page<Long> getAuctionsBiddenByCurrentUser(Pageable pageable);
}
