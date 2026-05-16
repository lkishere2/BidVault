package com.ltnc.auction.ui.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.ltnc.auction.domain.auction.auc.AuctionResponse;
import com.ltnc.auction.domain.inventory.InventoryItemResponse;
import com.ltnc.auction.ui.SceneManager;
import com.ltnc.auction.ui.http.ApiClient;
import com.ltnc.auction.ui.http.TokenManager;
import com.ltnc.auction.ui.model.RegisterResponse;
import javafx.animation.FadeTransition;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.util.Duration;

import java.math.BigDecimal;
import java.net.URL;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.ResourceBundle;
import java.util.stream.Collectors;

public class DashboardController implements Initializable {

    // ── Navbar ────────────────────────────────────
    @FXML private Label navUserLabel;
    @FXML private Label navBalanceLabel;
    @FXML private Label navTimeLabel;

    // ── Sidebar buttons ───────────────────────────
    @FXML private Button sidebarAuctions;
    @FXML private Button sidebarInventory;
    @FXML private Button sidebarCreate;
    @FXML private Button sidebarProfile;
    @FXML private Button sidebarBids;

    // ── Content ───────────────────────────────────
    @FXML private Button backButton;
    @FXML private StackPane contentStack;

    // ── Pages ─────────────────────────────────────
    @FXML private VBox auctionsPage;
    @FXML private VBox auctionsList;

    @FXML private VBox inventoryPage;
    @FXML private VBox inventoryList;

    @FXML private VBox createAuctionPage;
    @FXML private ComboBox<ItemOption> itemComboBox;
    @FXML private TextField startingPriceField;
    @FXML private DatePicker startDatePicker;
    @FXML private TextField startTimeInput;
    @FXML private DatePicker endDatePicker;
    @FXML private TextField endTimeInput;
    @FXML private Label createAuctionError;

    @FXML private VBox profilePage;
    @FXML private Label profileBalance;
    @FXML private Label profileUsername;
    @FXML private Label profileEmail;

    @FXML private VBox myBidsPage;
    @FXML private VBox myBidsList;

    @FXML private VBox auctionDetailPage;
    @FXML private Label auctionDetailTitle;
    @FXML private Label detailItemName;
    @FXML private Label detailItemCategory;
    @FXML private Label detailSeller;
    @FXML private Label detailCurrentPrice;
    @FXML private Label detailStartTime;
    @FXML private Label detailEndTime;
    @FXML private Label detailStatus;
    @FXML private TextField bidAmountField;
    @FXML private Label bidError;

    // ── State ─────────────────────────────────────
    private VBox currentPage;
    private Button currentSidebarItem;
    private AuctionResponse currentAuction;

    // ─────────────────────────────────────────────
    // Init
    // ─────────────────────────────────────────────
    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        currentPage = auctionsPage;
        currentSidebarItem = sidebarAuctions;

        itemComboBox.setCellFactory(listView -> new ListCell<>() {
            @Override
            protected void updateItem(ItemOption item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.displayText());
            }
        });
        itemComboBox.setButtonCell(new ListCell<>() {
            @Override
            protected void updateItem(ItemOption item, boolean empty) {
                super.updateItem(item, empty);
                setText(empty || item == null ? null : item.displayText());
            }
        });
        itemComboBox.setPromptText("Select item from inventory");

        // Update time label every second
        Timeline timeline = new Timeline(new KeyFrame(Duration.seconds(1), event -> {
            LocalDateTime now = LocalDateTime.now(ZoneOffset.ofHours(7));
            navTimeLabel.setText(now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);
        timeline.play();

        loadUserProfile();
        loadActiveAuctions();
    }

    private void loadUserProfile() {
        if (!TokenManager.getInstance().isLoggedIn()) {
            return;
        }

        ApiClient.getProfile().thenAccept(response -> {
            Platform.runLater(() -> {
                if (response.isSuccess()) {
                    RegisterResponse profile = ApiClient.parseResponse(
                            response.body(), RegisterResponse.class);
                    navUserLabel.setText(profile.username());
                    profileUsername.setText(profile.username());
                    profileEmail.setText(profile.email());
                    profileBalance.setText("$" + profile.balance());
                } else {
                    showProfileError();
                }
            });
        }).exceptionally(e -> {
            Platform.runLater(this::showProfileError);
            return null;
        });
    }

    private void showProfileError() {
        profileUsername.setText("—");
        profileEmail.setText("—");
        profileBalance.setText("$0.00");
        System.err.println("Unable to load profile from server");
    }

    private void loadActiveAuctions() {
        auctionsList.getChildren().clear();
        ApiClient.getActiveAuctions().thenAccept(response -> {
            Platform.runLater(() -> {
                if (response.isSuccess()) {
                    List<AuctionResponse> auctions = ApiClient.parseResponse(
                            response.body(), new TypeReference<List<AuctionResponse>>() {});
                    if (auctions.isEmpty()) {
                        auctionsList.getChildren().add(createInfoLabel("No active auctions available."));
                        return;
                    }
                    auctions.forEach(auction -> auctionsList.getChildren().add(createAuctionCard(auction)));
                } else {
                    auctionsList.getChildren().add(createInfoLabel("Failed to load active auctions."));
                }
            });
        }).exceptionally(e -> {
            Platform.runLater(() -> auctionsList.getChildren().add(createInfoLabel("Cannot connect to server.")));
            return null;
        });
    }

    private void loadInventory() {
        inventoryList.getChildren().clear();
        ApiClient.getInventory().thenAccept(response -> {
            Platform.runLater(() -> {
                if (response.isSuccess()) {
                    List<InventoryItemResponse> inventory = ApiClient.parseResponse(
                            response.body(), new TypeReference<List<InventoryItemResponse>>() {});
                    if (inventory.isEmpty()) {
                        inventoryList.getChildren().add(createInfoLabel("No inventory items found."));
                        return;
                    }
                    inventory.forEach(item -> inventoryList.getChildren().add(createInventoryCard(item)));
                } else {
                    inventoryList.getChildren().add(createInfoLabel("Failed to load inventory."));
                }
            });
        }).exceptionally(e -> {
            Platform.runLater(() -> inventoryList.getChildren().add(createInfoLabel("Cannot connect to server.")));
            return null;
        });
    }

    private void loadAvailableItems() {
        itemComboBox.getItems().clear();
        ApiClient.getAvailableItems().thenAccept(response -> {
            Platform.runLater(() -> {
                if (response.isSuccess()) {
                    List<InventoryItemResponse> items = ApiClient.parseResponse(
                            response.body(), new TypeReference<List<InventoryItemResponse>>() {});
                    if (items.isEmpty()) {
                        itemComboBox.setPromptText("No available items");
                        return;
                    }
                    itemComboBox.getItems().setAll(items.stream()
                            .map(item -> new ItemOption(item.id(), item.name()))
                            .collect(Collectors.toList()));
                } else {
                    itemComboBox.setPromptText("Unable to load items");
                }
            });
        }).exceptionally(e -> {
            Platform.runLater(() -> itemComboBox.setPromptText("Cannot connect to server"));
            return null;
        });
    }

    private void loadMyBids() {
        myBidsList.getChildren().clear();
        ApiClient.getMyBids().thenAccept(response -> {
            Platform.runLater(() -> {
                if (response.isSuccess()) {
                    List<AuctionResponse> auctions = ApiClient.parseResponse(
                            response.body(), new TypeReference<List<AuctionResponse>>() {});
                    if (auctions.isEmpty()) {
                        myBidsList.getChildren().add(createInfoLabel("You have not placed any bids yet."));
                        return;
                    }
                    auctions.forEach(auction -> myBidsList.getChildren().add(createAuctionCard(auction)));
                } else {
                    myBidsList.getChildren().add(createInfoLabel("Failed to load your bid history."));
                }
            });
        }).exceptionally(e -> {
            Platform.runLater(() -> myBidsList.getChildren().add(createInfoLabel("Cannot connect to server.")));
            return null;
        });
    }

    private void clearCreateAuctionForm() {
        itemComboBox.getSelectionModel().clearSelection();
        startingPriceField.clear();
        startDatePicker.setValue(null);
        startTimeInput.clear();
        endDatePicker.setValue(null);
        endTimeInput.clear();
        clearError(createAuctionError);
    }

    @FXML
    private void handleResetAuctions() {
        loadActiveAuctions();
    }

    @FXML
    private void handleResetInventory() {
        loadInventory();
    }

    @FXML
    private void handleResetCreateAuction() {
        clearCreateAuctionForm();
        loadAvailableItems();
    }

    @FXML
    private void handleResetProfile() {
        loadUserProfile();
    }

    @FXML
    private void handleResetMyBids() {
        loadMyBids();
    }

    @FXML
    private void handleResetAuctionDetail() {
        if (currentAuction != null) {
            showAuctionDetail(currentAuction);
        }
    }

    private VBox createAuctionCard(AuctionResponse auction) {
        VBox card = new VBox(6);
        card.getStyleClass().add("inventory-card");
        Label title = new Label(auction.itemName() + " — " + auction.itemCategory());
        title.getStyleClass().add("content-title");

        Label seller = new Label("Seller: " + auction.sellerLabel());
        Label price = new Label("Current price: $" + auction.currentPrice());
        Label startEnd = new Label("Starts: " + auction.startTime() + "  •  Ends: " + auction.endTime());
        Label status = new Label("Status: " + auction.status());

        Button viewButton = new Button("View Auction");
        viewButton.getStyleClass().add("dash-secondary-button");
        viewButton.setOnAction(e -> showAuctionDetail(auction));

        card.getChildren().addAll(title, seller, price, startEnd, status, viewButton);
        return card;
    }

    private VBox createInventoryCard(InventoryItemResponse item) {
        VBox card = new VBox(6);
        card.getStyleClass().add("inventory-card");
        card.setMaxWidth(Double.MAX_VALUE);

        Label title = new Label(item.name());
        title.getStyleClass().add("content-title");
        Label owner = new Label("Owner: " + item.ownerUsername());
        Label category = new Label("Category: " + item.category());
        Label status = new Label("Status: " + item.status());
        Label createdAt = new Label("Added: " + item.createdAt());

        card.getChildren().addAll(title, owner, category, status, createdAt);
        return card;
    }

    private Label createInfoLabel(String message) {
        Label label = new Label(message);
        label.getStyleClass().add("content-subtitle");
        return label;
    }

    private void showError(Label label, String message) {
        label.setText(message);
        label.setStyle("-fx-text-fill: #EF4444;");
        label.setVisible(true);
        label.setManaged(true);
    }

    private void clearError(Label label) {
        label.setText("");
        label.setStyle("");
        label.setVisible(false);
        label.setManaged(false);
    }

    private record ItemOption(Long itemId, String displayText) {}

    // ─────────────────────────────────────────────
    // Sidebar navigation
    // ─────────────────────────────────────────────
    @FXML private void showAuctions() {
        switchPage(auctionsPage, sidebarAuctions, false);
        loadActiveAuctions();
    }

    @FXML private void showInventory() {
        switchPage(inventoryPage, sidebarInventory, true);
        loadInventory();
    }

    @FXML private void showCreateAuction() {
        switchPage(createAuctionPage, sidebarCreate, true);
        clearCreateAuctionForm();
        loadAvailableItems();
    }

    @FXML private void showProfile() {
        switchPage(profilePage, sidebarProfile, true);
        loadUserProfile();
    }

    @FXML private void showMyBids() {
        switchPage(myBidsPage, sidebarBids, true);
        loadMyBids();
    }

    private void showAuctionDetail(AuctionResponse auction) {
        currentAuction = auction;
        auctionDetailTitle.setText("Auction: " + auction.itemName());
        detailItemName.setText(auction.itemName());
        detailItemCategory.setText(auction.itemCategory().toString());
        detailSeller.setText(auction.sellerLabel());
        detailCurrentPrice.setText("$" + auction.currentPrice());
        detailStartTime.setText(auction.startTime().toString());
        detailEndTime.setText(auction.endTime().toString());
        detailStatus.setText(auction.status().toString());
        bidAmountField.clear();
        clearError(bidError);
        switchPage(auctionDetailPage, null, true); // No sidebar button, so pass null
    }

    @FXML private void goBack() {
        switchPage(auctionsPage, sidebarAuctions, false);
    }

    // ─────────────────────────────────────────────
    // Smooth page switch with fade
    // ─────────────────────────────────────────────
    private void switchPage(VBox targetPage, Button targetSidebar, boolean showBack) {
        if (currentPage == targetPage) return;

        VBox from = currentPage;
        currentPage = targetPage;

        // update sidebar highlight
        if (currentSidebarItem != null) {
            currentSidebarItem.getStyleClass().remove("sidebar-item-active");
        }
        if (targetSidebar != null) {
            targetSidebar.getStyleClass().add("sidebar-item-active");
            currentSidebarItem = targetSidebar;
        }

        // back button visibility
        backButton.setVisible(showBack);
        backButton.setManaged(showBack);

        // fade out current
        FadeTransition fadeOut = new FadeTransition(Duration.millis(150), from);
        fadeOut.setFromValue(1);
        fadeOut.setToValue(0);
        fadeOut.setOnFinished(e -> {
            from.setVisible(false);
            from.setManaged(false);

            // fade in target
            targetPage.setOpacity(0);
            targetPage.setVisible(true);
            targetPage.setManaged(true);

            FadeTransition fadeIn = new FadeTransition(Duration.millis(200), targetPage);
            fadeIn.setFromValue(0);
            fadeIn.setToValue(1);
            fadeIn.play();
        });
        fadeOut.play();
    }

    // ─────────────────────────────────────────────
    // Logout
    // ─────────────────────────────────────────────
    @FXML
    private void handleLogout() {
        String accessToken = TokenManager.getInstance().getAccessToken();
        String refreshToken = TokenManager.getInstance().getRefreshToken();

        TokenManager.getInstance().logout();

        if (accessToken != null && refreshToken != null) {
            ApiClient.logout(refreshToken, accessToken)
                    .exceptionally(e -> {
                        System.err.println("Logout request failed: " + e.getMessage());
                        return null;
                    });
        }

        SceneManager.showAuth();
    }

    // ─────────────────────────────────────────────
    // Create Auction
    // ─────────────────────────────────────────────
    @FXML
    private void handleCreateAuction() {
        clearError(createAuctionError);
        ItemOption selectedItem = itemComboBox.getValue();
        String startingPriceText = startingPriceField.getText().trim();
        LocalDate startDate = startDatePicker.getValue();
        String startTimeText = startTimeInput.getText().trim();
        LocalDate endDate = endDatePicker.getValue();
        String endTimeText = endTimeInput.getText().trim();

        if (selectedItem == null || startingPriceText.isEmpty() || startDate == null || startTimeText.isEmpty() || endDate == null || endTimeText.isEmpty()) {
            showError(createAuctionError, "Please fill in all fields.");
            return;
        }

        BigDecimal startingPrice;
        try {
            startingPrice = new BigDecimal(startingPriceText);
            if (startingPrice.compareTo(BigDecimal.valueOf(0.01)) < 0) {
                showError(createAuctionError, "Starting price must be at least $0.01.");
                return;
            }
        } catch (NumberFormatException e) {
            showError(createAuctionError, "Starting price must be a valid number.");
            return;
        }

        Instant startTime;
        Instant endTime;
        try {
            LocalTime startLocalTime = LocalTime.parse(startTimeText, DateTimeFormatter.ofPattern("HH:mm"));
            LocalDateTime startDateTime = LocalDateTime.of(startDate, startLocalTime);
            startTime = startDateTime.toInstant(ZoneOffset.ofHours(7));

            LocalTime endLocalTime = LocalTime.parse(endTimeText, DateTimeFormatter.ofPattern("HH:mm"));
            LocalDateTime endDateTime = LocalDateTime.of(endDate, endLocalTime);
            endTime = endDateTime.toInstant(ZoneOffset.ofHours(7));
        } catch (Exception e) {
            showError(createAuctionError, "Invalid date or time format. Use HH:MM for time.");
            return;
        }

        if (!endTime.isAfter(startTime)) {
            showError(createAuctionError, "End time must be after start time.");
            return;
        }

        ApiClient.createAuction(selectedItem.itemId(), startingPrice, startTime, endTime)
                .thenAccept(response -> Platform.runLater(() -> {
                    if (response.isSuccess()) {
                        clearError(createAuctionError);
                        createAuctionError.setText("Auction created successfully.");
                        createAuctionError.setStyle("-fx-text-fill: #22C55E;");
                        createAuctionError.setVisible(true);
                        createAuctionError.setManaged(true);
                        startingPriceField.clear();
                        startDatePicker.setValue(null);
                        startTimeInput.clear();
                        endDatePicker.setValue(null);
                        endTimeInput.clear();
                        itemComboBox.getSelectionModel().clearSelection();
                        loadActiveAuctions();
                    } else {
                        showError(createAuctionError, "Failed to create auction.");
                    }
                }))
                .exceptionally(e -> {
                    Platform.runLater(() -> showError(createAuctionError, "Cannot connect to server."));
                    return null;
                });
    }

    // ─────────────────────────────────────────────
    // Place Bid
    // ─────────────────────────────────────────────
    @FXML
    private void handlePlaceBid() {
        if (currentAuction == null) {
            showError(bidError, "No auction selected.");
            return;
        }

        String bidAmountText = bidAmountField.getText().trim();
        if (bidAmountText.isEmpty()) {
            showError(bidError, "Please enter a bid amount.");
            return;
        }

        BigDecimal bidAmount;
        try {
            bidAmount = new BigDecimal(bidAmountText);
            if (bidAmount.compareTo(BigDecimal.valueOf(0.01)) < 0) {
                showError(bidError, "Bid amount must be at least $0.01.");
                return;
            }
        } catch (NumberFormatException e) {
            showError(bidError, "Bid amount must be a valid number.");
            return;
        }

        ApiClient.placeBid(currentAuction.id(), bidAmount)
                .thenAccept(response -> Platform.runLater(() -> {
                    if (response.isSuccess()) {
                        clearError(bidError);
                        bidError.setText("Bid placed successfully.");
                        bidError.setStyle("-fx-text-fill: #22C55E;");
                        bidError.setVisible(true);
                        bidError.setManaged(true);
                        bidAmountField.clear();
                        // Refresh the auction detail
                        handleResetAuctionDetail();
                        // Also refresh auctions list
                        loadActiveAuctions();
                    } else {
                        showError(bidError, "Failed to place bid.");
                    }
                }))
                .exceptionally(e -> {
                    Platform.runLater(() -> showError(bidError, "Cannot connect to server."));
                    return null;
                });
    }
}