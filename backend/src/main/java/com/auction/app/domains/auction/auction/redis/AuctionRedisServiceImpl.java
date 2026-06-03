package com.auction.app.domains.auction.auction.redis;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.dtos.PendingBid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class AuctionRedisServiceImpl implements AuctionRedisService {

    private final RedisTemplate<String, AuctionResponse> auctionResponseRedisTemplate;
    private final RedisTemplate<String, PendingBid> pendingBidRedisTemplate;

    private static final String RESPONSE_PREFIX = "auction:response:";
    private static final String QUEUE_PREFIX = "auction:queue:";
    private static final Duration POST_AUCTION_RETENTION = Duration.ofDays(1);
    private static final Duration TERMINAL_RETENTION = Duration.ofMinutes(30);

    public AuctionRedisServiceImpl(
            @Qualifier("auctionResponseRedisTemplate") RedisTemplate<String, AuctionResponse> auctionResponseRedisTemplate,
            @Qualifier("pendingBidRedisTemplate") RedisTemplate<String, PendingBid> pendingBidRedisTemplate) {
        this.auctionResponseRedisTemplate = auctionResponseRedisTemplate;
        this.pendingBidRedisTemplate = pendingBidRedisTemplate;
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
        if (results == null)
            return new ArrayList<>(Collections.nCopies(ids.size(), null));

        return new ArrayList<>(results);
    }

    @Override
    public List<AuctionResponse> getAllAuctionResponses() {
        Set<String> keys = auctionResponseRedisTemplate.keys(RESPONSE_PREFIX + "*");
        if (keys == null || keys.isEmpty()) {
            return Collections.emptyList();
        }
        List<AuctionResponse> results = auctionResponseRedisTemplate.opsForValue().multiGet(keys);
        if (results == null)
            return Collections.emptyList();

        return results.stream().filter(java.util.Objects::nonNull).toList();
    }

    @Override
    public void enqueueBid(Long auctionId, PendingBid bid) {
        pendingBidRedisTemplate.opsForList().rightPush(getQueueKey(auctionId), bid);
    }

    @Override
    public PendingBid dequeueBid(Long auctionId) {
        return pendingBidRedisTemplate.opsForList().leftPop(getQueueKey(auctionId));
    }

    @Override
    public void clearAuctionCache(Long auctionId) {
        auctionResponseRedisTemplate.delete(getResponseKey(auctionId));
        pendingBidRedisTemplate.delete(getQueueKey(auctionId));
    }

    private String getResponseKey(Long auctionId) {
        return RESPONSE_PREFIX + auctionId;
    }

    private String getQueueKey(Long auctionId) {
        return QUEUE_PREFIX + auctionId;
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