package com.auction.app.controllers.market;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.VBox;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.function.Consumer;

@Slf4j
public class MarketAuctionItemController {

    @FXML private VBox      cardRoot;
    @FXML private ImageView productImage;
    @FXML private Label     statusTag;
    @FXML private Label     titleLabel;
    @FXML private Label     priceCaptionLabel;
    @FXML private Label     priceLabel;
    @FXML private Label     contextHintLabel;

    private AuctionResponse          currentAuction;
    private Consumer<AuctionResponse> onItemClicked;

    public void populate(AuctionResponse auction, Consumer<AuctionResponse> clickHandler) {
        this.currentAuction = auction;
        this.onItemClicked  = clickHandler;

        titleLabel.setText(
                auction.getProductName() != null ? auction.getProductName() : "Unnamed Product"
        );

        loadImage(auction.getProductImageUrl());

        AuctionStatus status = auction.getStatus();
        applyStatusStyle(status);
        applyPrice(auction, status);
        applyContextHint(auction, status);
    }

    @FXML
    private void handleCardClick() {
        if (onItemClicked != null && currentAuction != null) {
            onItemClicked.accept(currentAuction);
        }
    }

    private void loadImage(String url) {
        if (url != null && !url.isBlank()) {
            try {
                Image image = new Image(url, 220, 130, false, true, true);
                productImage.setImage(image);
            } catch (Exception e) {
                log.warn("Could not load product image: {}", url);
                applyImagePlaceholder();
            }
        } else {
            applyImagePlaceholder();
        }
    }

    private void applyImagePlaceholder() {
        productImage.setStyle("-fx-background-color: #F1F5F9;");
    }

    private void applyStatusStyle(AuctionStatus status) {
        if (status == null) {
            statusTag.setText("UNKNOWN");
            statusTag.setStyle(baseBadgeStyle() + "-fx-background-color: #F1F5F9; -fx-text-fill: #64748B;");
            return;
        }
        switch (status) {
            case UPCOMING -> {
                statusTag.setText("UPCOMING");
                statusTag.setStyle(baseBadgeStyle() + "-fx-background-color: #FFF7ED; -fx-text-fill: #C2410C;");
            }
            case ACTIVE -> {
                statusTag.setText("ACTIVE");
                statusTag.setStyle(baseBadgeStyle() + "-fx-background-color: #F0FDF4; -fx-text-fill: #16A34A;");
            }
            case ENDED -> {
                statusTag.setText("ENDED");
                statusTag.setStyle(baseBadgeStyle() + "-fx-background-color: #F1F5F9; -fx-text-fill: #64748B;");
                cardRoot.setOpacity(0.80);
            }
            default -> {
                statusTag.setText(status.name());
                statusTag.setStyle(baseBadgeStyle() + "-fx-background-color: #F1F5F9; -fx-text-fill: #64748B;");
            }
        }
    }

    private String baseBadgeStyle() {
        return "-fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 3 8 3 8; -fx-background-radius: 20px; ";
    }

    private void applyPrice(AuctionResponse auction, AuctionStatus status) {
        BigDecimal price;
        if (status == AuctionStatus.UPCOMING) {
            price = auction.getStartingPrice();
            priceCaptionLabel.setText("Starting price");
        } else if (status == AuctionStatus.ENDED) {
            price = auction.getCurrentPrice() != null ? auction.getCurrentPrice() : auction.getStartingPrice();
            priceCaptionLabel.setText("Final price");
        } else {
            price = auction.getCurrentPrice() != null ? auction.getCurrentPrice() : auction.getStartingPrice();
            priceCaptionLabel.setText("Current price");
        }
        if (price == null) price = BigDecimal.ZERO;
        priceLabel.setText("$" + String.format("%.2f", price));
    }

    private void applyContextHint(AuctionResponse auction, AuctionStatus status) {
        if (status == null) { contextHintLabel.setText(""); return; }
        Instant now = Instant.now();
        switch (status) {
            case UPCOMING -> {
                Instant start = auction.getStartTime();
                contextHintLabel.setText(start != null
                        ? "Starts in " + humanDuration(Duration.between(now, start))
                        : "Starting soon");
            }
            case ACTIVE -> {
                Instant end = auction.getEndTime();
                contextHintLabel.setText(end != null
                        ? "Ends in " + humanDuration(Duration.between(now, end))
                        : "Live now");
            }
            case ENDED  -> contextHintLabel.setText("Auction ended");
            default     -> contextHintLabel.setText("");
        }
    }

    private static String humanDuration(Duration d) {
        if (d.isNegative()) return "now";
        long days    = d.toDays();
        long hours   = d.toHoursPart();
        long minutes = d.toMinutesPart();
        if (days > 0)    return days + " d";
        if (hours > 0)   return hours + " h";
        if (minutes > 0) return minutes + " m";
        return "< 1 m";
    }
}