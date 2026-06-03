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
import com.auction.app.domains.auction.auction.redis.AuctionRedisService;

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
    private final AuctionRedisService auctionRedisService;
    private final com.auction.app.domains.auction.auction.AuctionRepository auctionRepository;
    private final com.auction.app.domains.auction.bids.BidRepository bidRepository;
    private final com.auction.app.domains.users.users.UserRepository userRepository;

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
        Long auctionId = payload.getAuctionId();

        // Check cached auction in Redis and persist DB changes if a new bid/version was observed
        try {
            com.auction.app.domains.auction.auction.dtos.AuctionResponse cached = auctionRedisService.getAuctionResponse(auctionId);
            if (cached != null) {
                auctionRepository.findById(auctionId).ifPresent(dbAuction -> {
                    Integer cachedCount = cached.getBidCount() == null ? 0 : cached.getBidCount();
                    Integer dbCount = dbAuction.getBidCount() == null ? 0 : dbAuction.getBidCount();
                    if (cachedCount > dbCount) {
                        // Persist a representative bid if none exists as HELD in DB
                        try {
                            java.util.List<com.auction.app.domains.auction.bids.model.Bid> held = bidRepository.findByAuctionIdAndStatus(auctionId, com.auction.app.domains.auction.bids.model.BidStatus.HELD);
                            if (held == null || held.isEmpty()) {
                                Long winnerId = cached.getWinnerId();
                                if (winnerId != null) {
                                    userRepository.findById(winnerId).ifPresent(winner -> {
                                        com.auction.app.domains.auction.bids.model.Bid newBid = com.auction.app.domains.auction.bids.model.Bid.builder()
                                                .auction(dbAuction)
                                                .bidder(winner)
                                                .amount(cached.getCurrentPrice())
                                                .status(com.auction.app.domains.auction.bids.model.BidStatus.HELD)
                                                .build();
                                        bidRepository.save(newBid);
                                        log.info("Persisted bid from Redis cache for auction #{} (bidCount {})", auctionId, cachedCount);
                                    });
                                }
                            }

                            // Persist auction-level fields
                            dbAuction.setCurrentPrice(cached.getCurrentPrice());
                            dbAuction.setMinBidIncrement(cached.getMinBidIncrement());
                            dbAuction.setBidCount(cachedCount);
                            if (cached.getWinnerId() != null) {
                                userRepository.findById(cached.getWinnerId()).ifPresent(dbAuction::setWinner);
                            }
                            auctionRepository.save(dbAuction);
                        } catch (Exception ex) {
                            log.error("Failed to persist bid/auction from cached update for auction #{}: {}", auctionId, ex.getMessage());
                        }
                    }
                });
            }
        } catch (Exception e) {
            log.error("Error while reconciling cached auction for auction #{}: {}", payload.getAuctionId(), e.getMessage());
        }

        String destination = "/topic/auction/" + auctionId;
        messagingTemplate.convertAndSend(destination, payload);
        log.info("WebSocket push → {} — price {}", destination, payload.getCurrentPrice());
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