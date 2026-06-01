package com.auction.app.controllers.market;

import com.auction.app.domains.auction.auction.dtos.AuctionFindingRequest;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.TextField;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controller for the search/filter bar embedded via {@code <fx:include>} in MarketView.fxml.
 *
 * <p>Must be a Spring {@code @Component} so the Spring-aware FXML controller factory can
 * inject it as a nested controller into {@link MarketViewController} via the
 * {@code @FXML private MarketSearchBarController searchBarController} field.
 *
 * <p>Only the three publicly-discoverable statuses are offered:
 * {@code UPCOMING}, {@code ACTIVE}, and {@code ENDED}. {@code CANCELLED} auctions
 * are never shown on the market.
 */
@Component
public class MarketSearchBarController {

    /** Discoverable statuses — CANCELLED is intentionally excluded. */
    private static final List<AuctionStatus> DISCOVERABLE_STATUSES = List.of(
            AuctionStatus.UPCOMING,
            AuctionStatus.ACTIVE,
            AuctionStatus.ENDED
    );

    @FXML private TextField  searchField;
    @FXML private TextField  minPriceField;
    @FXML private ComboBox<AuctionStatus> statusComboBox;
    @FXML private Button     searchButton;

    private Runnable onSearchTriggered;

    @FXML
    public void initialize() {
        statusComboBox.setItems(FXCollections.observableArrayList(DISCOVERABLE_STATUSES));
        statusComboBox.setValue(AuctionStatus.ACTIVE);

        // Numeric-only guard for the price field
        minPriceField.textProperty().addListener((obs, oldVal, newVal) -> {
            if (!newVal.matches("\\d*(\\.\\d*)?")) {
                minPriceField.setText(oldVal);
            }
        });

        // Also trigger search on Enter inside the text field
        searchField.setOnAction(e -> handleSearchAction());
    }

    /** Called by {@link MarketViewController} after include injection is complete. */
    public void setOnSearchTriggered(Runnable callback) {
        this.onSearchTriggered = callback;
    }

    @FXML
    private void handleSearchAction() {
        if (onSearchTriggered != null) {
            onSearchTriggered.run();
        }
    }

    /**
     * Builds a query request from the current field values.
     * Empty strings become {@code null}; empty price becomes {@code BigDecimal.ZERO}.
     */
    public AuctionFindingRequest buildRequest() {
        AuctionFindingRequest request = new AuctionFindingRequest();

        String query = searchField.getText().trim();
        request.setProductName(query.isEmpty() ? null : query);

        String priceText = minPriceField.getText().trim();
        if (!priceText.isEmpty()) {
            try {
                request.setMinStartingPrice(new BigDecimal(priceText));
            } catch (NumberFormatException ignored) {
                request.setMinStartingPrice(BigDecimal.ZERO);
            }
        } else {
            request.setMinStartingPrice(BigDecimal.ZERO);
        }

        request.setStatus(statusComboBox.getValue());
        return request;
    }
}