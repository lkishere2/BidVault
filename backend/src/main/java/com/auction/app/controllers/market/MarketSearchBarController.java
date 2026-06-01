package com.auction.app.controllers.market;

import com.auction.app.domains.auction.auction.dtos.AuctionFindingRequest;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.products.model.Tag;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.ComboBox;
import javafx.scene.control.DatePicker;
import javafx.scene.control.TextField;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class MarketSearchBarController {

    private static final List<AuctionStatus> DISCOVERABLE_STATUSES = List.of(
            AuctionStatus.UPCOMING,
            AuctionStatus.ACTIVE,
            AuctionStatus.ENDED
    );

    @FXML private TextField searchField;
    @FXML private TextField tagsField;
    @FXML private TextField minPriceField;
    @FXML private ComboBox<AuctionStatus> statusComboBox;
    @FXML private DatePicker startTimePicker;
    @FXML private DatePicker endTimePicker;

    private Runnable onSearchTriggered;

    @FXML
    public void initialize() {
        statusComboBox.setItems(FXCollections.observableArrayList(DISCOVERABLE_STATUSES));
        statusComboBox.setValue(AuctionStatus.ACTIVE);

        minPriceField.textProperty().addListener((obs, oldVal, newVal) -> {
            if (!newVal.matches("\\d*(\\.\\d*)?")) {
                minPriceField.setText(oldVal);
            }
        });

        searchField.setOnAction(e -> handleSearchAction());
        tagsField.setOnAction(e -> handleSearchAction());
        minPriceField.setOnAction(e -> handleSearchAction());
    }

    public void setOnSearchTriggered(Runnable callback) {
        this.onSearchTriggered = callback;
    }

    @FXML
    private void handleSearchAction() {
        if (onSearchTriggered != null) {
            onSearchTriggered.run();
        }
    }

    public AuctionFindingRequest buildRequest() {
        AuctionFindingRequest request = new AuctionFindingRequest();

        String query = searchField.getText().trim();
        request.setProductName(query.isEmpty() ? null : query);

        String tagsText = tagsField.getText().trim();
        if (!tagsText.isEmpty()) {
            try {
                Set<Tag> tagsSet = Arrays.stream(tagsText.split(","))
                        .map(String::trim)
                        .filter(tag -> !tag.isEmpty())
                        .map(tag -> Tag.valueOf(tag.toUpperCase()))
                        .collect(Collectors.toSet());
                request.setTags(tagsSet.isEmpty() ? null : tagsSet);
            } catch (IllegalArgumentException e) {
                request.setTags(null);
            }
        } else {
            request.setTags(null);
        }

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

        if (startTimePicker.getValue() != null) {
            Instant startInstant = startTimePicker.getValue()
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant();
            request.setStartTime(startInstant);
        } else {
            request.setStartTime(null);
        }

        if (endTimePicker.getValue() != null) {
            Instant endInstant = endTimePicker.getValue()
                    .atTime(23, 59, 59)
                    .atZone(ZoneId.systemDefault())
                    .toInstant();
            request.setEndTime(endInstant);
        } else {
            request.setEndTime(null);
        }

        return request;
    }
}