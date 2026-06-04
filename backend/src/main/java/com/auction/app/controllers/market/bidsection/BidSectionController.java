package com.auction.app.controllers.market.bidsection;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import java.lang.reflect.Type;

@Component
@RequiredArgsConstructor
@Slf4j
public class BidSectionController {

    private final ApplicationContext applicationContext;

    public void open(AuctionResponse auction, AuctionStatus mode, Stage owner) {
        try {
            // --- Root frame ---
            FXMLLoader mainLoader = new FXMLLoader(getClass().getResource(
                    "/ui/views/market/bidsection/BidSectionView.fxml"));
            mainLoader.setControllerFactory(applicationContext::getBean);
            HBox root = mainLoader.load();
            BidSectionViewController rootController = mainLoader.getController();

            // --- BidInfoPanel ---
            BidInfoPanelController bidInfoPanel =
                    applicationContext.getBean(BidInfoPanelController.class);
            FXMLLoader infoLoader = new FXMLLoader(getClass().getResource(
                    "/ui/views/market/bidsection/BidInfoPanel.fxml"));
            infoLoader.setController(bidInfoPanel);
            VBox infoPanelNode = infoLoader.load();

            // --- BidFeedPanel ---
            BidFeedPanelController bidFeedPanel =
                    applicationContext.getBean(BidFeedPanelController.class);
            FXMLLoader feedLoader = new FXMLLoader(getClass().getResource(
                    "/ui/views/market/bidsection/BidFeedPanel.fxml"));
            feedLoader.setController(bidFeedPanel);
            VBox feedPanelNode = feedLoader.load();

            // --- Wire panels into frame ---
            rootController.getBidInfoPanelContainer().getChildren().setAll(infoPanelNode);
            rootController.getBidFeedPanelContainer().getChildren().setAll(feedPanelNode);

            // --- Initialize controllers ---
            bidInfoPanel.initialize(auction, mode);
            bidFeedPanel.initialize(auction, mode);

            // --- Build and show stage ---
            StompSessionHolder sessionHolder = new StompSessionHolder();
            Stage stage = new Stage();
            stage.initModality(Modality.WINDOW_MODAL);
            stage.initOwner(owner);
            stage.setTitle(auction.getProductName() + " — Auction #" + auction.getId());
            stage.setScene(new Scene(root));
            stage.setOnHidden(e -> disconnect(sessionHolder, auction.getId()));

            if (mode == AuctionStatus.ACTIVE) {
                connectStomp(auction.getId(), bidInfoPanel, bidFeedPanel, sessionHolder);
            }

            stage.show();

        } catch (Exception e) {
            log.error("Failed to build out real-time view structure: {}", e.getMessage(), e);
        }
    }

    // ------------------------------------------------------------------
    // STOMP
    // ------------------------------------------------------------------

    /**
     * Mirrors the ObjectMapper config from RedisConfig / AuctionSubscriber exactly.
     *
     * The server's Redis serializer uses activateDefaultTyping which wraps every
     * published object with a @class property:
     *
     *   { "@class": "...BidNotificationPayload", "currentPrice": 1300.00, ... }
     *
     * The default MappingJackson2MessageConverter uses a plain ObjectMapper with no
     * type info and no JavaTimeModule — it chokes on @class and produces an object
     * where every field is null. updateFromTicker() then silently no-ops because
     * String.format("%.2f", null) throws an NPE that the STOMP handler swallows.
     *
     * This converter reads the @class envelope, handles Instant (endTime, placedAt),
     * and parses BigDecimal price fields without floating-point precision loss.
     */
    private static MappingJackson2MessageConverter buildStompConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.configure(JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN, true);
        mapper.configure(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS, true);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(mapper);
        return converter;
    }

    private void connectStomp(Long auctionId,
                              BidInfoPanelController bidInfoPanel,
                              BidFeedPanelController bidFeedPanel,
                              StompSessionHolder sessionHolder) {

        WebSocketContainer container = ContainerProvider.getWebSocketContainer();
        container.setDefaultMaxTextMessageBufferSize(512 * 1024);

        WebSocketClient webSocketClient = new StandardWebSocketClient(container);
        WebSocketStompClient stompClient = new WebSocketStompClient(webSocketClient);
        stompClient.setMessageConverter(buildStompConverter());
        sessionHolder.stompClient = stompClient;

        stompClient.connectAsync("ws://localhost:8000/ws", new StompSessionHandlerAdapter() {

            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                sessionHolder.stompSession = session;
                log.info("STOMP connected for auction #{}", auctionId);
                Platform.runLater(() -> bidFeedPanel.setConnectionStatus(true));

                // Ticker: price / bid-count / end-time updates
                session.subscribe("/topic/auction/" + auctionId, new StompFrameHandler() {
                    @Override
                    public Type getPayloadType(StompHeaders headers) {
                        return BidNotificationPayload.class;
                    }

                    @Override
                    public void handleFrame(StompHeaders headers, Object payload) {
                        BidNotificationPayload ticker = (BidNotificationPayload) payload;
                        Platform.runLater(() -> {
                            bidInfoPanel.updateFromTicker(ticker);
                            if (ticker.isEnded()) {
                                bidInfoPanel.switchToEndedMode(ticker);
                                bidFeedPanel.setConnectionStatus(false);
                            }
                        });
                    }
                });

                // Live bid feed events
                session.subscribe("/topic/auction/" + auctionId + "/bids", new StompFrameHandler() {
                    @Override
                    public Type getPayloadType(StompHeaders headers) {
                        return BidFeedEvent.class;
                    }

                    @Override
                    public void handleFrame(StompHeaders headers, Object payload) {
                        BidFeedEvent event = (BidFeedEvent) payload;
                        log.debug("Bid event for #{}: bidder={} amount={}",
                                auctionId, event.getBidderLabel(), event.getAmount());
                        Platform.runLater(() -> {
                            bidFeedPanel.appendEvent(event);
                            bidInfoPanel.updateFromBidEvent(event);
                        });
                    }
                });
            }

            @Override
            public void handleTransportError(StompSession session, Throwable exception) {
                log.error("STOMP transport error for #{}: {}", auctionId, exception.getMessage());
                Platform.runLater(() -> bidFeedPanel.setConnectionStatus(false));
            }
        });
    }

    private void disconnect(StompSessionHolder sessionHolder, Long auctionId) {
        log.info("Disconnecting STOMP for auction #{}", auctionId);
        if (sessionHolder.stompSession != null && sessionHolder.stompSession.isConnected()) {
            sessionHolder.stompSession.disconnect();
        }
        if (sessionHolder.stompClient != null) {
            sessionHolder.stompClient.stop();
        }
    }

    private static class StompSessionHolder {
        WebSocketStompClient stompClient;
        StompSession         stompSession;
    }
}
