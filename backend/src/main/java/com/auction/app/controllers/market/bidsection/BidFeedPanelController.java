package com.auction.app.controllers.market.bidsection;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.dtos.BidFeedEvent;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import com.auction.app.domains.auction.bids.model.Bid;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.chart.LineChart;
import javafx.scene.chart.NumberAxis;
import javafx.scene.chart.XYChart;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class BidFeedPanelController {

    @FXML private ListView<BidFeedEvent> feedListView;
    @FXML private Label connectionStatusLabel;
    @FXML private Label emptyLabel;
    @FXML private LineChart<Number, Number> bidPriceChart;
    @FXML private NumberAxis chartXAxis;
    @FXML private NumberAxis chartYAxis;

    private final BidRepository bidRepository;
    private final XYChart.Series<Number, Number> priceSeries = new XYChart.Series<>();
    private static final Map<Long, List<BidFeedEvent>> ACTIVE_HISTORY_CACHE = new ConcurrentHashMap<>();

    private Long auctionId;
    private Instant firstChartPointAt;

    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm:ss").withZone(ZoneId.systemDefault());

    public void initialize(AuctionResponse auction, AuctionStatus mode) {
        this.auctionId = auction.getId();
        feedListView.setCellFactory(lv -> new BidFeedCell());
        configureChart();
        refreshHistory(auction);

        if (mode != AuctionStatus.ACTIVE) {
            connectionStatusLabel.setText("Read-only");
        }
    }

    public void refreshHistory(AuctionResponse auction) {
        Thread worker = new Thread(() -> {
            try {
                List<BidResponse> history = loadAllBidHistory(auction.getId());
                javafx.application.Platform.runLater(() -> renderHistory(auction, history));
            } catch (Exception e) {
                log.error("Failed to load bid history for auction #{}: {}", auction.getId(), e.getMessage());
            }
        });
        worker.setDaemon(true);
        worker.start();
    }

    public void appendEvent(BidFeedEvent event) {
        if (event == null) return;
        cacheEvent(event);
        if (event.getBidId() != null && feedListView.getItems().stream()
                .anyMatch(existing -> Objects.equals(existing.getBidId(), event.getBidId()))) {
            return;
        }

        showEmpty(false);
        feedListView.getItems().add(event);
        addChartPoint(event);
        scrollToBottom();
    }

    public void setConnectionStatus(boolean connected) {
        if (connected) {
            connectionStatusLabel.setText("Live");
            connectionStatusLabel.setStyle("-fx-font-size: 11px; -fx-text-fill: #4ADE80;");
        } else {
            connectionStatusLabel.setText("Disconnected");
            connectionStatusLabel.setStyle("-fx-font-size: 11px; -fx-text-fill: #6B7280;");
        }
    }

    private void renderHistory(AuctionResponse auction, List<BidResponse> history) {
        feedListView.getItems().clear();
        priceSeries.getData().clear();
        firstChartPointAt = null;

        List<BidFeedEvent> mergedHistory = mergeHistory(auction, history);
        for (BidFeedEvent event : mergedHistory) {
            feedListView.getItems().add(event);
            addChartPoint(event);
        }

        appendCurrentSnapshotIfMissing(auction);
        showEmpty(feedListView.getItems().isEmpty());
        scrollToBottom();
    }

    private void appendCurrentSnapshotIfMissing(AuctionResponse auction) {
        if (auction == null || auction.getBidCount() == null || auction.getBidCount() <= 0) return;
        BigDecimal currentPrice = auction.getCurrentPrice();
        if (currentPrice == null) return;

        boolean alreadyShown = feedListView.getItems().stream()
                .anyMatch(event -> event.getAmount() != null && event.getAmount().compareTo(currentPrice) == 0);
        if (alreadyShown) return;

        BidFeedEvent snapshotEvent = BidFeedEvent.builder()
                .auctionId(auction.getId())
                .bidderId(auction.getWinnerId())
                .bidderLabel(auction.getWinnerLabel() != null ? auction.getWinnerLabel() : "Current top bidder")
                .amount(currentPrice)
                .placedAt(Instant.now())
                .build();
        feedListView.getItems().add(snapshotEvent);
        addChartPoint(snapshotEvent);
        cacheEvent(snapshotEvent);
    }

    private void configureChart() {
        priceSeries.setName("Current price");
        bidPriceChart.getData().setAll(priceSeries);
        bidPriceChart.setLegendVisible(false);
        bidPriceChart.setAnimated(false);
        bidPriceChart.setCreateSymbols(true);
        chartXAxis.setLabel("Time");
        chartYAxis.setLabel("Price");
        chartXAxis.setForceZeroInRange(false);
        chartYAxis.setForceZeroInRange(false);
    }

    private List<BidResponse> loadAllBidHistory(Long auctionId) {
        List<BidResponse> all = new ArrayList<>();
        int page = 0;
        Slice<Bid> slice;
        do {
            slice = bidRepository.findByAuctionIdOrderByPlacedAtDesc(auctionId, PageRequest.of(page, 200));
            all.addAll(slice.getContent().stream().map(BidResponse::from).toList());
            page++;
        } while (slice.hasNext());
        return all;
    }

    private List<BidFeedEvent> mergeHistory(AuctionResponse auction, List<BidResponse> history) {
        Map<String, BidFeedEvent> merged = new LinkedHashMap<>();

        for (BidResponse h : history) {
            BidFeedEvent event = BidFeedEvent.builder()
                    .bidId(h.getBidId())
                    .auctionId(h.getAuctionId())
                    .bidderLabel(h.getBidderLabel())
                    .amount(h.getAmount())
                    .placedAt(h.getPlacedAt())
                    .build();
            merged.put(historyKey(event), event);
        }

        ACTIVE_HISTORY_CACHE.getOrDefault(auction.getId(), List.of())
                .forEach(event -> merged.putIfAbsent(historyKey(event), event));

        List<BidFeedEvent> events = new ArrayList<>(merged.values());
        events.sort(Comparator.comparing(
                event -> event.getPlacedAt() != null ? event.getPlacedAt() : Instant.EPOCH
        ));

        ACTIVE_HISTORY_CACHE.put(auction.getId(), new ArrayList<>(events));
        return events;
    }

    private void cacheEvent(BidFeedEvent event) {
        Long id = event.getAuctionId() != null ? event.getAuctionId() : auctionId;
        if (id == null) return;
        ACTIVE_HISTORY_CACHE.compute(id, (key, current) -> {
            List<BidFeedEvent> updated = current == null ? new ArrayList<>() : new ArrayList<>(current);
            boolean exists = updated.stream().anyMatch(existing -> historyKey(existing).equals(historyKey(event)));
            if (!exists) {
                updated.add(event);
                updated.sort(Comparator.comparing(
                        item -> item.getPlacedAt() != null ? item.getPlacedAt() : Instant.EPOCH
                ));
            }
            return updated;
        });
    }

    private String historyKey(BidFeedEvent event) {
        if (event.getBidId() != null) {
            return "bid:" + event.getBidId();
        }
        String amount = event.getAmount() != null ? event.getAmount().stripTrailingZeros().toPlainString() : "0";
        String placedAt = event.getPlacedAt() != null ? event.getPlacedAt().toString() : "unknown-time";
        String bidder = event.getBidderLabel() != null ? event.getBidderLabel() : "unknown-bidder";
        return "fallback:" + event.getAuctionId() + ":" + bidder + ":" + amount + ":" + placedAt;
    }

    private void addChartPoint(BidFeedEvent event) {
        if (event == null || event.getAmount() == null) return;
        Instant placedAt = event.getPlacedAt() != null ? event.getPlacedAt() : Instant.now();
        if (firstChartPointAt == null) {
            firstChartPointAt = placedAt;
        }

        long secondsFromStart = Math.max(0, java.time.Duration.between(firstChartPointAt, placedAt).getSeconds());
        priceSeries.getData().add(new XYChart.Data<>(secondsFromStart, event.getAmount()));
        if (priceSeries.getData().size() > 120) {
            priceSeries.getData().remove(0);
        }
    }

    private void scrollToBottom() {
        int size = feedListView.getItems().size();
        if (size > 0) feedListView.scrollTo(size - 1);
    }

    private void showEmpty(boolean show) {
        emptyLabel.setVisible(show);
        emptyLabel.setManaged(show);
    }

    private class BidFeedCell extends ListCell<BidFeedEvent> {

        private final HBox root = new HBox(12);
        private final VBox textBox = new VBox(2);
        private final Label nameLabel = new Label();
        private final Label amountLabel = new Label();
        private final Label timeLabel = new Label();

        BidFeedCell() {
            root.setAlignment(Pos.CENTER_LEFT);
            root.setPadding(new Insets(10, 16, 10, 16));

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

            if (getIndex() == getListView().getItems().size() - 1) {
                root.setStyle("-fx-background-color: #1A1F2E; -fx-background-radius: 8px;");
            } else {
                root.setStyle("-fx-background-color: transparent;");
            }

            setGraphic(root);
        }
    }
}
