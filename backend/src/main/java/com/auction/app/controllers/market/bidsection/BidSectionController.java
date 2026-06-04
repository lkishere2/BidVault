package com.auction.app.controllers.market.bidsection;

import com.auction.app.domains.auction.auction.AuctionController;
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
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.WebSocketContainer;
import javafx.animation.PauseTransition;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.util.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;

@Component
@RequiredArgsConstructor
@Slf4j
public class BidSectionController {

    private final ApplicationContext applicationContext;
    private final AuctionController auctionController;

    public void open(AuctionResponse auction, AuctionStatus mode, Stage owner) {
        try {
            AuctionResponse latestAuction = fetchLatestAuction(auction);
            AuctionStatus latestMode = latestAuction.getStatus() != null ? latestAuction.getStatus() : mode;

            FXMLLoader mainLoader = new FXMLLoader(getClass().getResource(
                    "/ui/views/market/bidsection/BidSectionView.fxml"));
            mainLoader.setControllerFactory(applicationContext::getBean);
            HBox root = mainLoader.load();
            BidSectionViewController rootController = mainLoader.getController();

            BidInfoPanelController bidInfoPanel = applicationContext.getBean(BidInfoPanelController.class);
            FXMLLoader infoLoader = new FXMLLoader(getClass().getResource(
                    "/ui/views/market/bidsection/BidInfoPanel.fxml"));
            infoLoader.setController(bidInfoPanel);
            VBox infoPanelNode = infoLoader.load();

            BidFeedPanelController bidFeedPanel = applicationContext.getBean(BidFeedPanelController.class);
            FXMLLoader feedLoader = new FXMLLoader(getClass().getResource(
                    "/ui/views/market/bidsection/BidFeedPanel.fxml"));
            feedLoader.setController(bidFeedPanel);
            VBox feedPanelNode = feedLoader.load();

            rootController.getBidInfoPanelContainer().getChildren().setAll(infoPanelNode);
            rootController.getBidFeedPanelContainer().getChildren().setAll(feedPanelNode);

            bidInfoPanel.initialize(latestAuction, latestMode);
            bidFeedPanel.initialize(latestAuction, latestMode);
            bidInfoPanel.setAfterBidPlaced(() -> schedulePostBidRefresh(
                    latestAuction.getId(),
                    bidInfoPanel,
                    bidFeedPanel
            ));

            StompSessionHolder sessionHolder = new StompSessionHolder();
            Stage stage = new Stage();
            stage.initModality(Modality.WINDOW_MODAL);
            stage.initOwner(owner);
            stage.setTitle(latestAuction.getProductName() + " - Auction #" + latestAuction.getId());
            stage.setScene(new Scene(root));
            stage.setOnHidden(e -> disconnect(sessionHolder, latestAuction.getId()));

            if (latestMode == AuctionStatus.ACTIVE) {
                connectStomp(latestAuction.getId(), bidInfoPanel, bidFeedPanel, sessionHolder);
            }

            stage.show();
        } catch (Exception e) {
            log.error("Failed to build out real-time view structure: {}", e.getMessage(), e);
        }
    }

    private AuctionResponse fetchLatestAuction(AuctionResponse fallback) {
        try {
            ResponseEntity<AuctionResponse> response = auctionController.getAuction(fallback.getId());
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            log.warn("Could not refresh auction #{} before opening bid popup: {}", fallback.getId(), e.getMessage());
        }
        return fallback;
    }

    private void schedulePostBidRefresh(Long auctionId,
                                        BidInfoPanelController bidInfoPanel,
                                        BidFeedPanelController bidFeedPanel) {
        refreshSnapshot(auctionId, bidInfoPanel, bidFeedPanel);
        scheduleDelayedRefresh(auctionId, bidInfoPanel, bidFeedPanel, 250);
        scheduleDelayedRefresh(auctionId, bidInfoPanel, bidFeedPanel, 800);
    }

    private void scheduleDelayedRefresh(Long auctionId,
                                        BidInfoPanelController bidInfoPanel,
                                        BidFeedPanelController bidFeedPanel,
                                        double millis) {
        PauseTransition delay = new PauseTransition(Duration.millis(millis));
        delay.setOnFinished(event -> refreshSnapshot(auctionId, bidInfoPanel, bidFeedPanel));
        delay.play();
    }

    private void refreshSnapshot(Long auctionId,
                                 BidInfoPanelController bidInfoPanel,
                                 BidFeedPanelController bidFeedPanel) {
        Thread worker = new Thread(() -> {
            try {
                ResponseEntity<AuctionResponse> response = auctionController.getAuction(auctionId);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    AuctionResponse latest = response.getBody();
                    Platform.runLater(() -> {
                        bidInfoPanel.updateFromSnapshot(latest);
                        bidFeedPanel.refreshHistory(latest);
                    });
                }
            } catch (Exception e) {
                log.warn("Could not refresh auction #{} after bid: {}", auctionId, e.getMessage());
            }
        });
        worker.setDaemon(true);
        worker.start();
    }

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
        StompSession stompSession;
    }
}
