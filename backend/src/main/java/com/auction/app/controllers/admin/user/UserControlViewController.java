package com.auction.app.controllers.admin.user;

import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.User;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.TilePane;
import javafx.scene.layout.VBox;
import javafx.stage.Modality;
import javafx.stage.Stage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Component
public class UserControlViewController {

    @FXML private TilePane userGrid;
    @FXML private TextField searchField;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label pageLabel;
    @FXML private Label totalLabel;

    @Autowired private UserRepository userRepository;
    @Autowired private AuctionRepository auctionRepository;

    private static final int PAGE_SIZE = 9;
    private static final NumberFormat MONEY = NumberFormat.getCurrencyInstance(Locale.US);

    private int currentPage = 0;
    private int totalPages = 1;
    private String keyword = "";

    @FXML
    public void initialize() {
        loadPage();
    }

    @FXML
    private void handleSearch() {
        keyword = searchField.getText() == null ? "" : searchField.getText().trim();
        currentPage = 0;
        loadPage();
    }

    @FXML
    private void handleRefresh() {
        searchField.clear();
        keyword = "";
        currentPage = 0;
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
                PageRequest pageable = PageRequest.of(currentPage, PAGE_SIZE, Sort.by(Sort.Direction.ASC, "username"));
                Page<User> page = keyword.isBlank()
                        ? userRepository.findAll(pageable)
                        : userRepository.searchByUsername(keyword, pageable);
                Platform.runLater(() -> render(page));
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> showMessage("Could not load users."));
            }
        }, "admin-user-load").start();
    }

    private void render(Page<User> page) {
        totalPages = Math.max(1, page.getTotalPages());
        totalLabel.setText(page.getTotalElements() + " users");
        pageLabel.setText(String.format("Page %d of %d", currentPage + 1, totalPages));
        prevButton.setDisable(currentPage == 0);
        nextButton.setDisable(currentPage >= totalPages - 1);

        userGrid.getChildren().clear();
        if (page.isEmpty()) {
            showMessage("No users found.");
            return;
        }
        page.getContent().forEach(user -> userGrid.getChildren().add(createUserCard(user)));
    }

    private VBox createUserCard(User user) {
        VBox card = new VBox(10);
        card.setPrefWidth(260);
        card.setPadding(new Insets(14));
        card.setStyle("-fx-background-color: #171717; -fx-border-color: rgba(245,197,24,0.32); "
                + "-fx-border-radius: 10; -fx-background-radius: 10;");

        HBox header = new HBox(12);
        header.setAlignment(Pos.CENTER_LEFT);
        ImageView avatar = avatar(user.getProfileImageUrl(), 48);
        VBox names = new VBox(4);
        Label username = new Label(safe(user.getDisplayName()));
        username.setMaxWidth(170);
        username.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 14px; -fx-font-weight: bold;");
        Label email = new Label(safe(user.getUsername()));
        email.setMaxWidth(170);
        email.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 11px;");
        names.getChildren().addAll(username, email);
        header.getChildren().addAll(avatar, names);

        HBox details = new HBox(10);
        details.setAlignment(Pos.CENTER_LEFT);
        Label role = badge(user.getRole() == null ? "USER" : user.getRole().name());
        Label balance = new Label(money(user.getBalance()));
        balance.setStyle("-fx-text-fill: #22C55E; -fx-font-weight: bold;");
        details.getChildren().addAll(role, balance);

        HBox actions = new HBox(8);
        Button view = new Button("View");
        Button delete = new Button("Delete");
        view.setMaxWidth(Double.MAX_VALUE);
        HBox.setHgrow(view, Priority.ALWAYS);
        view.setOnAction(event -> openProfile(user));
        delete.setOnAction(event -> deleteUser(user));
        actions.getChildren().addAll(view, delete);

        card.getChildren().addAll(header, details, actions);
        return card;
    }

    private void openProfile(User user) {
        new Thread(() -> {
            List<Auction> auctions;
            try {
                auctions = auctionRepository.findBySellerIdWithDetails(user.getId());
            } catch (Exception e) {
                e.printStackTrace();
                auctions = List.of();
            }
            List<Auction> finalAuctions = auctions;
            Platform.runLater(() -> showProfileWindow(user, finalAuctions));
        }, "admin-user-profile").start();
    }

    private void showProfileWindow(User user, List<Auction> auctions) {
        Stage stage = new Stage();
        stage.initModality(Modality.WINDOW_MODAL);
        if (userGrid.getScene() != null) {
            stage.initOwner(userGrid.getScene().getWindow());
        }
        stage.setTitle(safe(user.getDisplayName()) + " - User Profile");

        VBox root = new VBox(16);
        root.setPadding(new Insets(24));
        root.setStyle("-fx-background-color: #0D0D0D;");

        HBox profile = new HBox(16);
        profile.setAlignment(Pos.CENTER_LEFT);
        profile.getChildren().add(avatar(user.getProfileImageUrl(), 72));
        VBox profileText = new VBox(6);
        Label name = new Label(safe(user.getDisplayName()));
        name.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 24px; -fx-font-weight: bold;");
        Label email = new Label(safe(user.getUsername()));
        email.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 13px;");
        Label meta = new Label("Role: " + (user.getRole() == null ? "USER" : user.getRole().name())
                + "   Balance: " + money(user.getBalance()));
        meta.setStyle("-fx-text-fill: #F5C518; -fx-font-weight: bold;");
        profileText.getChildren().addAll(name, email, meta);
        profile.getChildren().add(profileText);

        Label auctionTitle = new Label("Auctions");
        auctionTitle.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 18px; -fx-font-weight: bold;");
        VBox auctionBox = new VBox(8);
        if (auctions.isEmpty()) {
            auctionBox.getChildren().add(message("No auctions for this user."));
        } else {
            auctions.forEach(auction -> auctionBox.getChildren().add(profileAuctionRow(auction)));
        }

        Button delete = new Button("Delete User");
        delete.setOnAction(event -> {
            stage.close();
            deleteUser(user);
        });

        root.getChildren().addAll(profile, auctionTitle, auctionBox, delete);
        stage.setScene(new Scene(root, 760, 560));
        stage.show();
    }

    private HBox profileAuctionRow(Auction auction) {
        HBox row = new HBox(10);
        row.setAlignment(Pos.CENTER_LEFT);
        row.setPadding(new Insets(10));
        row.setStyle("-fx-background-color: #171717; -fx-background-radius: 8; "
                + "-fx-border-color: rgba(255,255,255,0.08); -fx-border-radius: 8;");
        row.getChildren().add(avatar(auction.getProduct().getProductImageUrl(), 48));

        VBox text = new VBox(4);
        Label name = new Label(safe(auction.getProduct().getProductName()) + " #" + auction.getId());
        name.setStyle("-fx-text-fill: #FFFFFF; -fx-font-weight: bold;");
        Label price = new Label("Current: " + money(auction.getCurrentPrice())
                + "   Bids: " + value(auction.getBidCount())
                + "   Status: " + auction.getStatus());
        price.setStyle("-fx-text-fill: #94A3B8;");
        text.getChildren().addAll(name, price);
        row.getChildren().add(text);
        return row;
    }

    private void deleteUser(User user) {
        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION,
                "Delete user " + safe(user.getDisplayName()) + "?", ButtonType.CANCEL, ButtonType.OK);
        confirm.setHeaderText("Delete user");
        confirm.showAndWait().filter(ButtonType.OK::equals).ifPresent(button -> new Thread(() -> {
            try {
                userRepository.deleteById(user.getId());
                Platform.runLater(loadAfterDelete());
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> alert("Could not delete user."));
            }
        }, "admin-user-delete").start());
    }

    private Runnable loadAfterDelete() {
        return () -> {
            if (currentPage > 0 && userGrid.getChildren().size() == 1) {
                currentPage--;
            }
            loadPage();
        };
    }

    private void showMessage(String text) {
        userGrid.getChildren().setAll(message(text));
    }

    private void alert(String text) {
        Alert alert = new Alert(Alert.AlertType.ERROR, text, ButtonType.OK);
        alert.showAndWait();
    }

    private ImageView avatar(String imageUrl, int size) {
        ImageView view = new ImageView();
        view.setFitWidth(size);
        view.setFitHeight(size);
        view.setPreserveRatio(true);
        if (imageUrl != null && !imageUrl.isBlank()) {
            view.setImage(new Image(imageUrl, size, size, true, true, true));
        }
        return view;
    }

    private Label badge(String text) {
        Label label = new Label(text);
        label.setPadding(new Insets(4, 8, 4, 8));
        label.setStyle("-fx-text-fill: #F5C518; -fx-background-color: rgba(245,197,24,0.12); "
                + "-fx-background-radius: 5; -fx-border-color: rgba(245,197,24,0.55); "
                + "-fx-border-radius: 5; -fx-font-size: 10px; -fx-font-weight: bold;");
        return label;
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
