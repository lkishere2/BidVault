package com.auction.app.auction.notification;

import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class AuctionPublisherTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @InjectMocks
    private AuctionPublisher auctionPublisher;

    @Test
    void publishBidFeedEvent_ShouldSendToRedis() {
        BidFeedEvent event = BidFeedEvent.builder().build();
        auctionPublisher.publishBidFeedEvent(1L, event);
        verify(redisTemplate).convertAndSend("auction:notify:1:bids", event);
    }
}
