package com.auction.app.controllers.market.bidsection;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.BidService;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BidFeedPanelController {

    @FXML private ListView<BidFeedEvent> feedListView;
    @FXML private Label                  connectionStatusLabel;
    @FXML private Label                  emptyLabel;

    private final BidService bidService;

    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());

    // ------------------------------------------------------------------
    // Setup
    // ------------------------------------------------------------------

    public void initialize(AuctionResponse auction, AuctionStatus mode) {
        feedListView.setCellFactory(lv -> new BidFeedCell());

        // Load history from REST on a background thread
        Thread worker = new Thread(() -> {
            try {
                List<BidResponse> history = bidService.getBidHistory(auction.getId());
                javafx.application.Platform.runLater(() -> {
                    if (history.isEmpty()) {
                        showEmpty(true);
                    } else {
                        showEmpty(false);
                        // History comes DESC from server — add oldest-first so newest is at bottom
                        for (int i = history.size() - 1; i >= 0; i--) {
                            BidResponse h = history.get(i);
                            feedListView.getItems().add(BidFeedEvent.builder()
                                    .bidderLabel(h.getBidderLabel())
                                    .amount(h.getAmount())
                                    .placedAt(h.getPlacedAt())
                                    .build());
                        }
                        scrollToBottom();
                    }
                });
            } catch (Exception e) {
                log.error("Failed to load bid history for auction #{}: {}", auction.getId(), e.getMessage());
            }
        });
        worker.setDaemon(true);
        worker.start();

        if (mode != AuctionStatus.ACTIVE) {
            connectionStatusLabel.setText("Read-only");
        }
    }

    // ------------------------------------------------------------------
    // Live updates
    // ------------------------------------------------------------------

    /** Called by BidSectionController when a BidFeedEvent arrives via STOMP. */
    public void appendEvent(BidFeedEvent event) {
        showEmpty(false);
        feedListView.getItems().add(event);
        scrollToBottom();
    }

    public void setConnectionStatus(boolean connected) {
        if (connected) {
            connectionStatusLabel.setText("● Live");
            connectionStatusLabel.setStyle("-fx-font-size: 11px; -fx-text-fill: #4ADE80;");
        } else {
            connectionStatusLabel.setText("○ Disconnected");
            connectionStatusLabel.setStyle("-fx-font-size: 11px; -fx-text-fill: #6B7280;");
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private void scrollToBottom() {
        int size = feedListView.getItems().size();
        if (size > 0) feedListView.scrollTo(size - 1);
    }

    private void showEmpty(boolean show) {
        emptyLabel.setVisible(show);
        emptyLabel.setManaged(show);
    }

    // ------------------------------------------------------------------
    // Cell renderer
    // ------------------------------------------------------------------

    private class BidFeedCell extends ListCell<BidFeedEvent> {

        private final HBox  root       = new HBox(12);
        private final VBox  textBox    = new VBox(2);
        private final Label nameLabel  = new Label();
        private final Label amountLabel = new Label();
        private final Label timeLabel  = new Label();

        BidFeedCell() {
            root.setAlignment(Pos.CENTER_LEFT);
            root.setPadding(new Insets(10, 16, 10, 16));
            root.setStyle("-fx-background-color: transparent;");

            nameLabel.setStyle("-fx-font-size: 13px; -fx-font-weight: bold; -fx-text-fill: #E2E8F0;");
            amountLabel.setStyle("-fx-font-size: 15px; -fx-font-weight: bold; -fx-text-fill: #FBBF24; -fx-font-family: 'Georgia';");
            timeLabel.setStyle("-fx-font-size: 10px; -fx-text-fill: #4B5563;");

            textBox.getChildren().addAll(nameLabel, amountLabel);
            root.getChildren().addAll(textBox, timeLabel);
            HBox.setHgrow(textBox, javafx.scene.layout.Priority.ALWAYS);

            setStyle("-fx-background-color: transparent; -fx-padding: 0;");
            setGraphic(root);
        }

        @Override
        protected void updateItem(BidFeedEvent event, boolean empty) {
            super.updateItem(event, empty);
            if (empty || event == null) {
                setGraphic(null);
                return;
            }

            nameLabel.setText(event.getBidderLabel() != null ? event.getBidderLabel() : "Anonymous");
            amountLabel.setText("$" + String.format("%.2f",
                    event.getAmount() != null ? event.getAmount() : BigDecimal.ZERO));
            timeLabel.setText(event.getPlacedAt() != null
                    ? TIME_FMT.format(event.getPlacedAt())
                    : TIME_FMT.format(Instant.now()));

            // Highlight the most recent entry
            if (getIndex() == getListView().getItems().size() - 1) {
                root.setStyle("-fx-background-color: #1A1F2E; -fx-background-radius: 8px;");
            } else {
                root.setStyle("-fx-background-color: transparent;");
            }

            setGraphic(root);
        }
    }
}