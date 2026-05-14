package com.ltnc.auction.infrastructure.websocket;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.ltnc.auction.domain.auction.bid.BidNotificationPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionWebSocketPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String NOTIFY_PREFIX = "auction:notify:";

    public void publish(BidNotificationPayload payload) {
        String channel = NOTIFY_PREFIX + payload.getAuctionId();
        redisTemplate.convertAndSend(channel, payload);
        log.info("Published bid notification to channel {} — price ${}",
                channel, payload.getCurrentPrice());
    }

    public void publishAuctionEnded(Long auctionId, String winnerLabel, BigDecimal finalPrice) {
    BidNotificationPayload payload = BidNotificationPayload.builder()
            .auctionId(auctionId)
            .currentPrice(finalPrice)
            .minNextBid(BigDecimal.ZERO)
            .bidderLabel(winnerLabel != null ? winnerLabel : "No winner")
            .endTime(Instant.now())
            .extended(false)
            .bidCount(0)
            .ended(true)        // ← add this flag to BidNotificationPayload
            .build();

    redisTemplate.convertAndSend("auction:notify:" + auctionId, payload);
    log.info("Auction #{} ENDED notification published", auctionId);
}

}