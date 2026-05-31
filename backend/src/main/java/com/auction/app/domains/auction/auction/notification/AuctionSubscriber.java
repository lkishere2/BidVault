package com.auction.app.domains.auction.auction.notification;

import org.jspecify.annotations.NonNull;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private static final String NOTIFY_PREFIX = "auction:notify:";
    private static final String BIDS_SUFFIX = ":bids";

    @Override
    public void onMessage(@NonNull Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel());

            if (channel.endsWith(BIDS_SUFFIX)) {
                subscribeToBidFeedChannel(message, channel);
            } else {
                subscribeToAuctionChannel(message, channel);
            }
        } catch (Exception e) {
            log.error("Failed to process Redis pub/sub message: {}", e.getMessage());
        }
    }

    private void subscribeToAuctionChannel(Message message, String channel) throws IOException {
        BidNotificationPayload payload = objectMapper.readValue(message.getBody(), BidNotificationPayload.class);
        String destination = "/topic/auction/" + payload.getAuctionId();
        messagingTemplate.convertAndSend(destination, payload);
        log.info("WebSocket push → {} — price ${}", destination, payload.getCurrentPrice());
    }

    // Now handles a single BidFeedEvent — appended to the live feed on the client
    private void subscribeToBidFeedChannel(Message message, String channel) throws IOException {
        BidFeedEvent event = objectMapper.readValue(message.getBody(), BidFeedEvent.class);
        Long auctionId = extractAuctionId(channel);
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/bids", event);
        log.info("WebSocket push → /topic/auction/{}/bids — {} bid ${}", auctionId, event.getBidderLabel(), event.getAmount());
    }

    private Long extractAuctionId(String channel) {
        String withoutPrefix = channel.substring(NOTIFY_PREFIX.length());
        String idPart = withoutPrefix.endsWith(BIDS_SUFFIX)
                ? withoutPrefix.substring(0, withoutPrefix.length() - BIDS_SUFFIX.length())
                : withoutPrefix;
        return Long.valueOf(idPart);
    }
}