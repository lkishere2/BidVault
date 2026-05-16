package com.auction.app.domains.auction.auction;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.auction.app.domains.auction.bids.PendingBid;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuctionCacheAdapter {
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String STATE_PREFIX = "auction:state:";
    private static final String QUEUE_PREFIX = "auction:queue:";

    // Maintain cache for 24 hours after the auction's exact end time
    private static final Duration POST_AUCTION_RETENTION = Duration.ofDays(1);

    public void cacheAuctionState(Long auctionId, AuctionState state) {
        redisTemplate.opsForValue().set(getStateKey(auctionId), state, calculateTtl(state));
    }

    public AuctionState getAuctionState(Long auctionId) {
        return (AuctionState) redisTemplate.opsForValue().get(getStateKey(auctionId));
    }

    public void updateAuctionState(Long auctionId, AuctionState state) {
        // Optimization: Instead of performing a separate network call to getExpire(),
        // we recalculate the TTL dynamically in Java. This cuts Redis I/O in half for every bid processed.
        cacheAuctionState(auctionId, state);
    }

    public void enqueueBid(Long auctionId, PendingBid bid) {
        redisTemplate.opsForList().rightPush(getQueueKey(auctionId), bid);
    }

    public PendingBid dequeueBid(Long auctionId) {
        return (PendingBid) redisTemplate.opsForList().leftPop(getQueueKey(auctionId));
    }

    public void clearAuctionCache(Long auctionId) {
        // Delete both keys in a single network round-trip
        redisTemplate.delete(List.of(getStateKey(auctionId), getQueueKey(auctionId)));
    }

    // Helpers

    private String getStateKey(Long auctionId) {
        return STATE_PREFIX + auctionId;
    }

    private String getQueueKey(Long auctionId) {
        return QUEUE_PREFIX + auctionId;
    }

    private Duration calculateTtl(AuctionState state) {
        Instant now = Instant.now();

        // Safety fallback: If the auction is somehow already in the past,
        // prevent a negative Duration from being passed to Redis (which causes immediate deletion/errors).
        if (state.getEndTime().isBefore(now)) {
            return POST_AUCTION_RETENTION;
        }

        return Duration.between(now, state.getEndTime()).plus(POST_AUCTION_RETENTION);
    }
}