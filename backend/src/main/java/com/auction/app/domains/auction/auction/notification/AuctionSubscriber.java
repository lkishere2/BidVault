package com.auction.app.domains.auction.auction.notification;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.jspecify.annotations.NonNull;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionSubscriber implements MessageListener {

    private final SimpMessagingTemplate messagingTemplate;

    // Matches the mapper used by redisTemplate — NOT the global Spring ObjectMapper
    private final ObjectMapper objectMapper = buildRedisObjectMapper();

    private static ObjectMapper buildRedisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN, true);
        mapper.configure(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, true);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

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