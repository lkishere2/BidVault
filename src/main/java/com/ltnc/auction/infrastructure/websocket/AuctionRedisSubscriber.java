package com.ltnc.auction.infrastructure.websocket;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ltnc.auction.domain.auction.bid.BidNotificationPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionRedisSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            BidNotificationPayload payload = objectMapper.readValue(
                    message.getBody(), BidNotificationPayload.class);
            String destination = "/topic/auction/" + payload.getAuctionId();
            messagingTemplate.convertAndSend(destination, payload);

            log.info("WebSocket push → {} — price ${}",
                    destination, payload.getCurrentPrice());

        } catch (Exception e) {
            log.error("Failed to process Redis message: {}", e.getMessage());
        }
    }
}