package com.auction.app.controllers.market.bidsection;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.layout.HBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;

@Component
@RequiredArgsConstructor
@Slf4j
public class BidSectionController {

    // Fix: inject ApplicationContext so we can supply a Spring controller factory to
    // each FXMLLoader, allowing the sub-panel fx:controller beans to be resolved by
    // Spring (honouring @Autowired / @RequiredArgsConstructor) rather than instantiated
    // via plain reflection by JavaFX (which would fail on required-arg constructors).
    private final ApplicationContext applicationContext;

    // ------------------------------------------------------------------
    // Public API — called by MarketViewController
    // ------------------------------------------------------------------

    /**
     * Opens a new modal Stage for the given auction.
     * Must be called from the JavaFX Application Thread.
     *
     * Fix (singleton-state / concurrency): this bean is a Spring singleton, so the
     * original design of storing auction/mode/stompSession as instance fields meant
     * that opening a second window would overwrite the first window's state and
     * disconnect its STOMP session.  All per-window state is now held in a local
     * WindowContext record and captured by lambdas, making each open() call
     * fully independent.
     */
    public void open(AuctionResponse auction, AuctionStatus mode, Stage owner) {
        try {
            FXMLLoader loader = new FXMLLoader(
                    getClass().getResource("/ui/views/market/bidsection/BidSectionView.fxml")
            );

            // Fix: supply a Spring-aware controller factory so that BidInfoPanelController
            // and BidFeedPanelController (which have @RequiredArgsConstructor final fields)
            // are resolved as Spring beans rather than being instantiated by JavaFX via
            // no-arg reflection — which would throw because Lombok does not generate a
            // no-arg constructor when required-arg fields are present.
            loader.setControllerFactory(applicationContext::getBean);

            HBox root = loader.load();

            // Retrieve the sub-panel controllers that JavaFX injected from the fx:include nodes.
            // The fx:id="bidInfoPanel" / fx:id="bidFeedPanel" includes cause JavaFX to inject
            // the nested controllers under the keys "bidInfoPanelController" / "bidFeedPanelController".
            BidInfoPanelController bidInfoPanel =
                    (BidInfoPanelController) loader.getNamespace().get("bidInfoPanelController");
            BidFeedPanelController bidFeedPanel =
                    (BidFeedPanelController) loader.getNamespace().get("bidFeedPanelController");

            bidInfoPanel.initialize(auction, mode);
            bidFeedPanel.initialize(auction, mode);

            // Per-window STOMP state — isolated from any other open window.
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
            log.error("Failed to open BidSectionView: {}", e.getMessage(), e);
        }
    }

    // ------------------------------------------------------------------
    // STOMP
    // ------------------------------------------------------------------

    private void connectStomp(Long auctionId,
                              BidInfoPanelController bidInfoPanel,
                              BidFeedPanelController bidFeedPanel,
                              StompSessionHolder sessionHolder) {

        WebSocketStompClient stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        sessionHolder.stompClient = stompClient;

        // Fix: was hardcoded to port 8080 — app runs on port 8000.
        stompClient.connectAsync("ws://localhost:8000/ws", new StompSessionHandlerAdapter() {

            @Override
            public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
                sessionHolder.stompSession = session;
                log.info("STOMP connected for auction #{}", auctionId);

                Platform.runLater(() -> bidFeedPanel.setConnectionStatus(true));

                // Price ticker
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
                                // Fix: pass the ticker so switchToEndedMode can read the winner
                                // label from the live payload instead of the stale open-time snapshot.
                                bidInfoPanel.switchToEndedMode(ticker);
                                bidFeedPanel.setConnectionStatus(false);
                            }
                        });
                    }
                });

                // Live bid feed
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
                log.error("STOMP transport error for auction #{}: {}", auctionId, exception.getMessage());
                Platform.runLater(() -> bidFeedPanel.setConnectionStatus(false));
            }
        });
    }

    private void disconnect(StompSessionHolder sessionHolder, Long auctionId) {
        if (sessionHolder.stompSession != null && sessionHolder.stompSession.isConnected()) {
            sessionHolder.stompSession.disconnect();
            log.info("STOMP disconnected for auction #{}", auctionId);
        }
        if (sessionHolder.stompClient != null) {
            sessionHolder.stompClient.stop();
        }
    }

    /** Mutable holder so lambdas can capture STOMP state per window without instance fields. */
    private static class StompSessionHolder {
        WebSocketStompClient stompClient;
        StompSession stompSession;
    }
}