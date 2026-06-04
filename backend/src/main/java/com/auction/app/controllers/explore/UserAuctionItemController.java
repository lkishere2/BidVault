package com.auction.app.controllers.explore;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.StackPane;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class UserAuctionItemController {

    @FXML private StackPane imagePlaceholder;
    @FXML private ImageView auctionImageView;
    @FXML private Label titleLabel;
    @FXML private Label priceLabel;
    @FXML private Label statusLabel;
    @FXML private Label bidsLabel;

    public void setAuctionData(AuctionResponse auction) {
        titleLabel.setText(nullToFallback(auction.getProductName(), "Untitled auction"));
        priceLabel.setText("$" + formatPrice(auction.getCurrentPrice()));
        statusLabel.setText(auction.getStatus() != null ? auction.getStatus().name() : "UNKNOWN");
        bidsLabel.setText((auction.getBidCount() != null ? auction.getBidCount() : 0) + " bids");

        String imageUrl = auction.getProductImageUrl();
        if (imageUrl != null && !imageUrl.isBlank()) {
            auctionImageView.setImage(new Image(imageUrl, true));
            auctionImageView.setVisible(true);
            imagePlaceholder.setVisible(false);
        } else {
            auctionImageView.setVisible(false);
            imagePlaceholder.setVisible(true);
        }
    }

    private String formatPrice(BigDecimal price) {
        return price != null ? price.stripTrailingZeros().toPlainString() : "0";
    }

    private String nullToFallback(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
