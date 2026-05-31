package com.auction.app.domains.auction.auction.notification;

import java.math.BigDecimal;
import java.time.Instant;

import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String NOTIFY_PREFIX = "auction:notify:";
    private static final String BIDS_SUFFIX = ":bids";

    public void publish(BidNotificationPayload payload) {
        String channel = NOTIFY_PREFIX + payload.getAuctionId();
        redisTemplate.convertAndSend(channel, payload);
        log.info("Published bid notification to channel {} — price ${}", channel, payload.getCurrentPrice());
    }

    // Replaces publishHistory — pushes a single feed event so all watchers see "X bid $Y"
    public void publishBidFeedEvent(Long auctionId, BidFeedEvent event) {
        String channel = NOTIFY_PREFIX + auctionId + BIDS_SUFFIX;
        redisTemplate.convertAndSend(channel, event);
        log.info("Published bid feed event to channel {} — {} bid ${}", channel, event.getBidderLabel(), event.getAmount());
    }

    public void publishAuctionStarted(Auction auction) {
        BigDecimal minNextBid = auction.getCurrentPrice().add(auction.getMinBidIncrement());

        BidNotificationPayload payload = BidNotificationPayload.builder()
                .auctionId(auction.getId())
                .currentPrice(auction.getCurrentPrice())
                .minNextBid(minNextBid)
                .bidderLabel(null)
                .endTime(auction.getEndTime())
                .extended(false)
                .bidCount(auction.getBidCount())
                .ended(false)
                .build();

        redisTemplate.convertAndSend(NOTIFY_PREFIX + auction.getId(), payload);
        log.info("Auction #{} ACTIVE notification published with current price: {}",
                auction.getId(), auction.getCurrentPrice());
    }

    public void publishAuctionEnded(Long auctionId, String winnerLabel, BigDecimal finalPrice, Integer bidCount, Instant endTime) {
        BidNotificationPayload payload = BidNotificationPayload.builder()
                .auctionId(auctionId)
                .currentPrice(finalPrice)
                .minNextBid(BigDecimal.ZERO)
                .bidderLabel(winnerLabel != null ? winnerLabel : "No winner")
                .endTime(endTime)
                .extended(false)
                .bidCount(bidCount)
                .ended(true)
                .build();

        redisTemplate.convertAndSend(NOTIFY_PREFIX + auctionId, payload);
        log.info("Auction #{} ENDED notification published", auctionId);
    }
}