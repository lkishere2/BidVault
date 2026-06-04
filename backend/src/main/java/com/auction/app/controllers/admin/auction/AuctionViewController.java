package com.auction.app.controllers.admin.auction;

import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.model.Auction;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Component
public class AuctionViewController {

    @FXML private VBox auctionList;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label pageLabel;
    @FXML private Label totalLabel;

    @Autowired private AuctionRepository auctionRepository;

    private static final int PAGE_SIZE = 10;
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.systemDefault());
    private static final NumberFormat MONEY = NumberFormat.getCurrencyInstance(Locale.US);

    private int currentPage = 0;
    private int totalPages = 1;

    @FXML
    public void initialize() {
        loadPage();
    }

    @FXML
    private void handlePrevPage() {
        if (currentPage > 0) {
            currentPage--;
            loadPage();
        }
    }

    @FXML
    private void handleNextPage() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            loadPage();
        }
    }

    private void loadPage() {
        new Thread(() -> {
            try {
                Page<Long> ids = auctionRepository.findAll(
                                PageRequest.of(currentPage, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "id")))
                        .map(Auction::getId);
                List<Auction> auctions = ids.isEmpty()
                        ? List.of()
                        : new ArrayList<>(auctionRepository.findByIdsWithDetails(ids.getContent()));
                auctions.sort(Comparator.comparingInt(a -> ids.getContent().indexOf(a.getId())));

                Platform.runLater(() -> render(ids, auctions));
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> showMessage("Could not load auctions."));
            }
        }, "admin-auction-load").start();
    }

    private void render(Page<Long> page, List<Auction> auctions) {
        totalPages = Math.max(1, page.getTotalPages());
        totalLabel.setText(page.getTotalElements() + " auctions");
        pageLabel.setText(String.format("Page %d of %d", currentPage + 1, totalPages));
        prevButton.setDisable(currentPage == 0);
        nextButton.setDisable(currentPage >= totalPages - 1);

        auctionList.getChildren().clear();
        if (auctions.isEmpty()) {
            showMessage("No auctions found.");
            return;
        }
        auctions.forEach(auction -> auctionList.getChildren().add(createAuctionRow(auction)));
    }

    private HBox createAuctionRow(Auction auction) {
        HBox row = new HBox(16);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setPadding(new Insets(14));
        row.setStyle("-fx-background-color: #171717; -fx-border-color: rgba(255,255,255,0.08); "
                + "-fx-border-radius: 10; -fx-background-radius: 10;");

        ImageView image = new ImageView();
        image.setFitWidth(96);
        image.setFitHeight(72);
        image.setPreserveRatio(true);
        image.setStyle("-fx-background-color: #0B0B0B;");
        String imageUrl = auction.getProduct().getProductImageUrl();
        if (imageUrl != null && !imageUrl.isBlank()) {
            image.setImage(new Image(imageUrl, 96, 72, true, true, true));
        }

        VBox info = new VBox(6);
        info.setAlignment(Pos.CENTER_LEFT);
        HBox.setHgrow(info, javafx.scene.layout.Priority.ALWAYS);

        Label title = new Label(safe(auction.getProduct().getProductName()) + "  #" + auction.getId());
        title.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 16px; -fx-font-weight: bold;");

        Label seller = new Label("Seller: " + safe(auction.getSeller().getDisplayName())
                + "   Status: " + auction.getStatus());
        seller.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 12px;");

        Label price = new Label("Current: " + money(auction.getCurrentPrice())
                + "   Starting: " + money(auction.getStartingPrice())
                + "   Min increment: " + money(auction.getMinBidIncrement()));
        price.setStyle("-fx-text-fill: #F5C518; -fx-font-size: 13px; -fx-font-weight: bold;");

        Label stats = new Label("Bids: " + value(auction.getBidCount())
                + "   Quantity: " + value(auction.getAuctionedQuantity())
                + "   Start: " + DATE_FORMATTER.format(auction.getStartTime())
                + "   End: " + DATE_FORMATTER.format(auction.getEndTime()));
        stats.setStyle("-fx-text-fill: #CBD5E1; -fx-font-size: 12px;");

        info.getChildren().addAll(title, seller, price, stats);
        row.getChildren().addAll(image, info);
        return row;
    }

    private void showMessage(String text) {
        auctionList.getChildren().setAll(message(text));
    }

    private Label message(String text) {
        Label label = new Label(text);
        label.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 14px;");
        return label;
    }

    private String money(BigDecimal value) {
        return value == null ? "$0.00" : MONEY.format(value);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Unknown" : value;
    }

    private String value(Object value) {
        return value == null ? "0" : String.valueOf(value);
    }
}
