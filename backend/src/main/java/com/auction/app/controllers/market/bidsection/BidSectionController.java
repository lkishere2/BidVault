package com.auction.app.controllers.market.bidsection;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;
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
            FXMLLoader mainLoader = new FXMLLoader(getClass().getResource("/ui/views/market/bidsection/BidSectionView.fxml"));
            mainLoader.setControllerFactory(applicationContext::getBean);
            HBox root = mainLoader.load();
            BidSectionViewController rootController = mainLoader.getController();

            // 2. Load Bid Info Panel explicitly
            FXMLLoader infoLoader = new FXMLLoader(getClass().getResource("/ui/views/market/bidsection/BidInfoPanel.fxml"));
            infoLoader.setControllerFactory(applicationContext::getBean);
            VBox infoPanelNode = infoLoader.load();
            BidInfoPanelController bidInfoPanel = infoLoader.getController();

            // 3. Load Bid Feed Panel explicitly
            FXMLLoader feedLoader = new FXMLLoader(getClass().getResource("/ui/views/market/bidsection/BidFeedPanel.fxml"));
            feedLoader.setControllerFactory(applicationContext::getBean);
            VBox feedPanelNode = feedLoader.load();
            BidFeedPanelController bidFeedPanel = feedLoader.getController();

            // 4. Inject visual panels directly into the frame container
            rootController.getBidInfoPanelContainer().getChildren().setAll(infoPanelNode);
            rootController.getBidFeedPanelContainer().getChildren().setAll(feedPanelNode);

            // 5. Run Initializations
            bidInfoPanel.initialize(auction, mode);
            bidFeedPanel.initialize(auction, mode);

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

    private void connectStomp(Long auctionId,
                              BidInfoPanelController bidInfoPanel,
                              BidFeedPanelController bidFeedPanel,
                              StompSessionHolder sessionHolder) {

        WebSocketContainer container = ContainerProvider.getWebSocketContainer();
        container.setDefaultMaxTextMessageBufferSize(512 * 1024);

        WebSocketClient webSocketClient = new StandardWebSocketClient(container);
        WebSocketStompClient stompClient = new WebSocketStompClient(webSocketClient);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        sessionHolder.stompClient = stompClient;

        stompClient.connectAsync("ws://localhost:8000/ws", new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                sessionHolder.stompSession = session;
                log.info("STOMP connection fully operational for auction #{}", auctionId);

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
                        Platform.runLater(() -> bidFeedPanel.appendEvent(event));
                    }
                });
            }

            @Override
            public void handleTransportError(StompSession session, Throwable exception) {
                log.error("STOMP broker mapping disconnected: {}", exception.getMessage());
                Platform.runLater(() -> bidFeedPanel.setConnectionStatus(false));
            }
        });
    }

    private void disconnect(StompSessionHolder sessionHolder, Long auctionId) {
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