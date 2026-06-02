package com.auction.app.controllers.account;

import javafx.animation.KeyFrame;
import javafx.animation.KeyValue;
import javafx.animation.Timeline;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.scene.input.MouseEvent;
import javafx.util.Duration;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class DashboardViewController {

    @FXML private Label statBalanceLabel;
    @FXML private Label statAuctionsLabel;
    @FXML private Label statVaultLabel;
    @FXML private Label liveClockLabel;
    @FXML private Label traderQuoteLabel;
    @FXML private Label traderQuoteAuthorLabel;
    @FXML private VBox  quoteBubble;

    private static final String[][] QUOTES = {
            {"The stock market is a device for transferring money from the impatient to the patient.", "Warren Buffett"},
            {"In investing, what is comfortable is rarely profitable.", "Robert Arnott"},
            {"Risk comes from not knowing what you're doing.", "Warren Buffett"},
            {"The four most dangerous words in investing are: this time it's different.", "Sir John Templeton"},
            {"Behind every stock is a company. Find out what it's doing.", "Peter Lynch"},
            {"The market is a pendulum that forever swings between unsustainable optimism and unjustified pessimism.", "Benjamin Graham"},
    };

    private int quoteIndex = 0;
    private Timeline floatTimeline;
    private Timeline glowTimeline;

    @FXML
    public void initialize() {
        startLiveClock();
        startQuoteRotation();
        startBubbleFloat();
        loadUserStats();
        wireBubbleHover();
    }

    private void loadUserStats() {
        statBalanceLabel.setText("$0.00");
        statAuctionsLabel.setText("0");
        statVaultLabel.setText("0");
    }

    private void startLiveClock() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("HH:mm:ss");
        Timeline clock = new Timeline(new KeyFrame(Duration.seconds(1), e ->
                liveClockLabel.setText(LocalTime.now().format(fmt))
        ));
        clock.setCycleCount(Timeline.INDEFINITE);
        clock.play();
    }

    private void startQuoteRotation() {
        showQuote(quoteIndex);
        Timeline rotation = new Timeline(new KeyFrame(Duration.seconds(8), e -> {
            quoteIndex = (quoteIndex + 1) % QUOTES.length;
            showQuote(quoteIndex);
        }));
        rotation.setCycleCount(Timeline.INDEFINITE);
        rotation.play();
    }

    private void showQuote(int idx) {
        traderQuoteLabel.setText(QUOTES[idx][0]);
        traderQuoteAuthorLabel.setText("\u2014 " + QUOTES[idx][1]);
    }

    /** Gentle sine-wave float — moves the bubble up and down continuously */
    private void startBubbleFloat() {
        if (quoteBubble == null) return;
        floatTimeline = new Timeline(
                new KeyFrame(Duration.ZERO,
                        new KeyValue(quoteBubble.translateYProperty(), 0)),
                new KeyFrame(Duration.seconds(2.4),
                        new KeyValue(quoteBubble.translateYProperty(), -9,
                                javafx.animation.Interpolator.EASE_BOTH)),
                new KeyFrame(Duration.seconds(4.8),
                        new KeyValue(quoteBubble.translateYProperty(), 0,
                                javafx.animation.Interpolator.EASE_BOTH))
        );
        floatTimeline.setCycleCount(Timeline.INDEFINITE);
        floatTimeline.play();
    }

    /** On hover: pause float, scale up, brighten border via opacity */
    private void wireBubbleHover() {
        if (quoteBubble == null) return;

        quoteBubble.addEventHandler(MouseEvent.MOUSE_ENTERED, e -> {
            if (floatTimeline != null) floatTimeline.pause();
            quoteBubble.setScaleX(1.04);
            quoteBubble.setScaleY(1.04);
            quoteBubble.setStyle(quoteBubble.getStyle()
                    .replace("-fx-border-color: #F5C518", "-fx-border-color: #FFD700")
                    .replace("rgba(245,197,24,0.28)", "rgba(245,197,24,0.65)"));
        });

        quoteBubble.addEventHandler(MouseEvent.MOUSE_EXITED, e -> {
            quoteBubble.setScaleX(1.0);
            quoteBubble.setScaleY(1.0);
            quoteBubble.setStyle(quoteBubble.getStyle()
                    .replace("-fx-border-color: #FFD700", "-fx-border-color: #F5C518")
                    .replace("rgba(245,197,24,0.65)", "rgba(245,197,24,0.28)"));
            if (floatTimeline != null) floatTimeline.play();
        });
    }

    public void setStats(String balance, int auctions, int vaultItems) {
        statBalanceLabel.setText(balance);
        statAuctionsLabel.setText(String.valueOf(auctions));
        statVaultLabel.setText(String.valueOf(vaultItems));
    }
}
