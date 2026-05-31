package com.auction.app.domains.auction.auction.redis;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.auction.app.domains.auction.bids.dtos.PendingBid;

@Component
public class AuctionCacheAdapter implements AuctionRedisPort {

    private final RedisTemplate<String, AuctionResponse> auctionResponseRedisTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String RESPONSE_PREFIX = "auction:response:";
    private static final String QUEUE_PREFIX = "auction:queue:";
    // Fix #2 / #10: key prefix for the distributed scheduler / dequeue-loop lock
    private static final String PROCESSING_LOCK_PREFIX = "auction:processing-lock:";
    private static final Duration POST_AUCTION_RETENTION = Duration.ofDays(1);
    private static final Duration TERMINAL_RETENTION = Duration.ofMinutes(30);
    private static final Duration LOCK_TTL = Duration.ofSeconds(30);

    public AuctionCacheAdapter(
            @Qualifier("auctionResponseRedisTemplate") RedisTemplate<String, AuctionResponse> auctionResponseRedisTemplate,
            @Qualifier("redisTemplate") RedisTemplate<String, Object> redisTemplate
    ) {
        this.auctionResponseRedisTemplate = auctionResponseRedisTemplate;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void cacheAuctionResponse(Long auctionId, AuctionResponse response) {
        auctionResponseRedisTemplate.opsForValue().set(getResponseKey(auctionId), response, calculateTtl(response));
    }

    @Override
    public AuctionResponse getAuctionResponse(Long auctionId) {
        return auctionResponseRedisTemplate.opsForValue().get(getResponseKey(auctionId));
    }

    @Override
    public void cacheAuctionResponses(Map<Long, AuctionResponse> responses) {
        // Fix #8 / #15: multiSet has no per-key TTL support — pipeline individual SET EX calls instead
        // so each entry gets the same TTL logic as cacheAuctionResponse.
        // Cast explicitly to RedisCallback to resolve the ambiguous overload between
        // executePipelined(RedisCallback<?>) and executePipelined(SessionCallback<?>).
        auctionResponseRedisTemplate.executePipelined((RedisCallback<Object>) connection -> {
            responses.forEach((id, response) -> {
                String key = getResponseKey(id);
                Duration ttl = calculateTtl(response);
                auctionResponseRedisTemplate.opsForValue().set(key, response, ttl);
            });
            return null;
        });
    }

    @Override
    public List<AuctionResponse> getAuctionResponses(List<Long> ids) {
        List<String> keys = ids.stream()
                .map(this::getResponseKey)
                .toList();

        List<AuctionResponse> results = auctionResponseRedisTemplate.opsForValue().multiGet(keys);
        if (results == null) return new ArrayList<>(Collections.nCopies(ids.size(), null));

        return new ArrayList<>(results);
    }

    @Override
    public void enqueueBid(Long auctionId, PendingBid bid) {
        redisTemplate.opsForList().rightPush(getQueueKey(auctionId), bid);
    }

    @Override
    public PendingBid dequeueBid(Long auctionId) {
        return (PendingBid) redisTemplate.opsForList().leftPop(getQueueKey(auctionId));
    }

    @Override
    public void clearAuctionCache(Long auctionId) {
        redisTemplate.delete(List.of(getResponseKey(auctionId), getQueueKey(auctionId)));
    }

    // Fix #2 / #10: SET NX PX — atomic acquire; returns true only if this caller set the key
    @Override
    public boolean acquireProcessingLock(Long auctionId) {
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(getLockKey(auctionId), "locked", LOCK_TTL);
        return Boolean.TRUE.equals(acquired);
    }

    // Fix #2 / #10: unconditional delete — lock is always released in a finally block
    @Override
    public void releaseProcessingLock(Long auctionId) {
        redisTemplate.delete(getLockKey(auctionId));
    }

    private String getResponseKey(Long auctionId) {
        return RESPONSE_PREFIX + auctionId;
    }

    private String getQueueKey(Long auctionId) {
        return QUEUE_PREFIX + auctionId;
    }

    private String getLockKey(Long auctionId) {
        return PROCESSING_LOCK_PREFIX + auctionId;
    }

    private Duration calculateTtl(AuctionResponse response) {
        if (response.getStatus() == AuctionStatus.ENDED || response.getStatus() == AuctionStatus.CANCELLED) {
            return TERMINAL_RETENTION; // Safe 30 minutes
        }
        Instant now = Instant.now();
        Duration remainingTime = Duration.between(now, response.getEndTime());

        Duration totalTtl = remainingTime.plus(POST_AUCTION_RETENTION);
        if (totalTtl.isNegative() || totalTtl.isZero()) {
            return TERMINAL_RETENTION;
        }

        return totalTtl;
    }
}