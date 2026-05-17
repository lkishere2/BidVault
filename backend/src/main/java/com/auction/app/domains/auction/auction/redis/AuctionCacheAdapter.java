package com.auction.app.domains.auction.auction.redis;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import com.auction.app.domains.auction.auction.dtos.AuctionState;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.auction.app.domains.auction.bids.dtos.PendingBid;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AuctionCacheAdapter {
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String STATE_PREFIX = "auction:state:";
    private static final String QUEUE_PREFIX = "auction:queue:";
    private static final Duration POST_AUCTION_RETENTION = Duration.ofDays(1);

    public void cacheAuctionState(Long auctionId, AuctionState state) {
        redisTemplate.opsForValue().set(getStateKey(auctionId), state, calculateTtl(state));
    }

    public AuctionState getAuctionState(Long auctionId) {
        return (AuctionState) redisTemplate.opsForValue().get(getStateKey(auctionId));
    }

    public void updateAuctionState(Long auctionId, AuctionState state) {
        cacheAuctionState(auctionId, state);
    }

    public void enqueueBid(Long auctionId, PendingBid bid) {
        redisTemplate.opsForList().rightPush(getQueueKey(auctionId), bid);
    }

    public PendingBid dequeueBid(Long auctionId) {
        return (PendingBid) redisTemplate.opsForList().leftPop(getQueueKey(auctionId));
    }

    public PendingBid peekBid(Long auctionId) {
        return (PendingBid) redisTemplate.opsForList().index(getQueueKey(auctionId), 0);
    }

    public void clearAuctionCache(Long auctionId) {
        redisTemplate.delete(List.of(getStateKey(auctionId), getQueueKey(auctionId)));
    }

    private String getStateKey(Long auctionId) {
        return STATE_PREFIX + auctionId;
    }

    private String getQueueKey(Long auctionId) {
        return QUEUE_PREFIX + auctionId;
    }

    private Duration calculateTtl(AuctionState state) {
        Instant now = Instant.now();
        if (state.getEndTime().isBefore(now)) {
            return POST_AUCTION_RETENTION;
        }
        return Duration.between(now, state.getEndTime()).plus(POST_AUCTION_RETENTION);
    }
}