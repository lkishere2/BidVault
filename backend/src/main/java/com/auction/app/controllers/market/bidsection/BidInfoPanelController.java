package com.auction.app.controllers.market.bidsection;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.dtos.BidNotificationPayload;
import com.auction.app.domains.auction.bids.BidService;
import com.auction.app.domains.auction.bids.dtos.BidRequest;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.VBox;
import javafx.util.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
@Slf4j
// Fix: singleton scope meant all windows shared one instance — @FXML fields pointed to
// whichever window loaded last, so STOMP callbacks updated the wrong UI nodes and the
// WebSocket appeared broken. Prototype scope gives each window its own fresh instance
// with its own correctly-injected @FXML references.
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class BidInfoPanelController {

    @FXML private ImageView productImage;
    @FXML private Label     statusBadge;
    @FXML private Label     sellerLabel;
    @FXML private Label     productNameLabel;
    @FXML private Label     priceCaptionLabel;
    @FXML private Label     currentPriceLabel;
    @FXML private Label     minNextBidLabel;
    @FXML private Label     bidCountLabel;
    @FXML private Label     countdownLabel;
    @FXML private Label     winnerLabel;
    @FXML private VBox      bidFormBox;
    @FXML private TextField bidAmountField;
    @FXML private Button    placeBidButton;
    @FXML private Label     bidErrorLabel;

    private final BidService bidService;

    private AuctionResponse auction;
    private AuctionStatus   mode;
    private Instant         endTime;
    private Timeline        countdownTimeline;
    private BigDecimal      minNextBid;

    public void initialize(AuctionResponse auction, AuctionStatus mode) {
        this.auction = auction;
        this.mode    = mode;
        this.endTime = auction.getEndTime();
        this.minNextBid = auction.getCurrentPrice() != null && auction.getMinBidIncrement() != null
                ? auction.getCurrentPrice().add(auction.getMinBidIncrement())
                : BigDecimal.ZERO;

        populateStatic();
        applyMode(mode);

        if (mode == AuctionStatus.ACTIVE || mode == AuctionStatus.UPCOMING) {
            startCountdown();
        }
    }

    public void updateFromTicker(BidNotificationPayload ticker) {
        currentPriceLabel.setText("$" + String.format("%.2f", ticker.getCurrentPrice()));
        minNextBid = ticker.getMinNextBid();
        minNextBidLabel.setText("Min next bid: $" + String.format("%.2f", ticker.getMinNextBid()));
        bidCountLabel.setText(ticker.getBidCount() + " bids");
        endTime = ticker.getEndTime();

        if (ticker.isExtended()) {
            countdownLabel.setStyle(
                    "-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #FBBF24;"
            );
        }
    }

    public void switchToEndedMode(BidNotificationPayload ticker) {
        stopCountdown();
        applyMode(AuctionStatus.ENDED);

        String winner = ticker.getBidderLabel();
        if (winner != null && !winner.isBlank() && !"No winner".equals(winner)) {
            winnerLabel.setText("🏆 Winner: " + winner);
        } else {
            winnerLabel.setText("No winner — auction ended with no bids.");
        }
        winnerLabel.setVisible(true);
        winnerLabel.setManaged(true);
    }

    @FXML
    private void handlePlaceBid() {
        hideBidError();
        String raw = bidAmountField.getText().trim();
        if (raw.isEmpty()) {
            showBidError("Please enter a bid amount.");
            return;
        }

        BigDecimal amount;
        try {
            amount = new BigDecimal(raw);
        } catch (NumberFormatException e) {
            showBidError("Invalid amount. Enter a number like 150.00");
            return;
        }

        if (amount.compareTo(minNextBid) < 0) {
            showBidError("Bid must be at least $" + String.format("%.2f", minNextBid));
            return;
        }

        placeBidButton.setDisable(true);
        placeBidButton.setText("...");

        Runnable secureTask = new DelegatingSecurityContextRunnable(() -> {
            try {
                bidService.placeBid(auction.getId(), new BidRequest(amount));
                javafx.application.Platform.runLater(() -> {
                    bidAmountField.clear();
                    placeBidButton.setDisable(false);
                    placeBidButton.setText("BID");
                });
            } catch (Exception e) {
                javafx.application.Platform.runLater(() -> {
                    showBidError(e.getMessage() != null ? e.getMessage() : "Failed to place bid.");
                    placeBidButton.setDisable(false);
                    placeBidButton.setText("BID");
                });
            }
        });

        Thread worker = new Thread(secureTask);
        worker.setDaemon(true);
        worker.start();
    }

    private void populateStatic() {
        productNameLabel.setText(auction.getProductName() != null ? auction.getProductName() : "Unnamed Product");
        sellerLabel.setText("by " + (auction.getSellerLabel() != null ? auction.getSellerLabel() : "Unknown"));

        BigDecimal price = auction.getCurrentPrice() != null
                ? auction.getCurrentPrice() : auction.getStartingPrice();
        currentPriceLabel.setText("$" + String.format("%.2f", price != null ? price : BigDecimal.ZERO));

        if (minNextBid.compareTo(BigDecimal.ZERO) > 0) {
            minNextBidLabel.setText("Min next bid: $" + String.format("%.2f", minNextBid));
        }
        bidCountLabel.setText((auction.getBidCount() != null ? auction.getBidCount() : 0) + " bids");

        String imgUrl = auction.getProductImageUrl();
        if (imgUrl != null && !imgUrl.isBlank()) {
            try {
                productImage.setImage(new Image(imgUrl, true));
            } catch (Exception e) {
                log.warn("Could not load product image: {}", imgUrl);
            }
        }
    }

    private void applyMode(AuctionStatus status) {
        switch (status) {
            case UPCOMING -> {
                statusBadge.setText("UPCOMING");
                statusBadge.setStyle("-fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 4 10 4 10; " +
                        "-fx-background-radius: 20px; -fx-background-color: #1C1800; -fx-text-fill: #FCD34D;");
                priceCaptionLabel.setText("STARTING PRICE");
                currentPriceLabel.setText("$" + String.format("%.2f",
                        auction.getStartingPrice() != null ? auction.getStartingPrice() : BigDecimal.ZERO));
                bidFormBox.setVisible(false);
                bidFormBox.setManaged(false);
            }
            case ACTIVE -> {
                statusBadge.setText("LIVE");
                statusBadge.setStyle("-fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 4 10 4 10; " +
                        "-fx-background-radius: 20px; -fx-background-color: #1A3A2A; -fx-text-fill: #4ADE80;");
                priceCaptionLabel.setText("CURRENT PRICE");
                bidFormBox.setVisible(true);
                bidFormBox.setManaged(true);
            }
            case ENDED -> {
                statusBadge.setText("ENDED");
                statusBadge.setStyle("-fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 4 10 4 10; " +
                        "-fx-background-radius: 20px; -fx-background-color: #1A1A2E; -fx-text-fill: #6B7280;");
                priceCaptionLabel.setText("FINAL PRICE");
                bidFormBox.setVisible(false);
                bidFormBox.setManaged(false);
                countdownLabel.setText("Auction ended");
            }
        }
    }

    private void startCountdown() {
        countdownTimeline = new Timeline(new KeyFrame(Duration.seconds(1), e -> {
            if (endTime == null) return;
            long seconds = Instant.now().until(endTime, ChronoUnit.SECONDS);
            if (seconds <= 0) {
                countdownLabel.setText("Ending...");
                stopCountdown();
            } else {
                countdownLabel.setText(formatCountdown(seconds));
            }
        }));
        countdownTimeline.setCycleCount(Timeline.INDEFINITE);
        countdownTimeline.play();
    }

    private void stopCountdown() {
        if (countdownTimeline != null) countdownTimeline.stop();
    }

    private String formatCountdown(long totalSeconds) {
        long days  = totalSeconds / 86400;
        long hours = (totalSeconds % 86400) / 3600;
        long mins  = (totalSeconds % 3600) / 60;
        long secs  = totalSeconds % 60;
        if (days > 0)  return String.format("%dd %02dh %02dm", days, hours, mins);
        if (hours > 0) return String.format("%dh %02dm %02ds", hours, mins, secs);
        return String.format("%dm %02ds", mins, secs);
    }

    private void showBidError(String msg) {
        bidErrorLabel.setText(msg);
        bidErrorLabel.setVisible(true);
        bidErrorLabel.setManaged(true);
    }

    private void hideBidError() {
        bidErrorLabel.setVisible(false);
        bidErrorLabel.setManaged(false);
    }
}