package com.auction.app.domains.auction.auction.redis;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.bids.dtos.PendingBid;

import java.util.List;
import java.util.Map;

public interface AuctionRedisPort {

    void cacheAuctionResponse(Long auctionId, AuctionResponse response);

    AuctionResponse getAuctionResponse(Long auctionId);

    // Fix #8 / #15: old signature stored values with no TTL via multiSet.
    // Replaced with a per-entry version that honours each response's TTL.
    void cacheAuctionResponses(Map<Long, AuctionResponse> responses);

    List<AuctionResponse> getAuctionResponses(List<Long> ids);

    void enqueueBid(Long auctionId, PendingBid bid);

    PendingBid dequeueBid(Long auctionId);

    void clearAuctionCache(Long auctionId);

    // Fix #2 (bid domain) / #10: distributed processing lock to guard the dequeue loop
    // and prevent multi-instance scheduler double-processing
    boolean acquireProcessingLock(Long auctionId);

    void releaseProcessingLock(Long auctionId);
}