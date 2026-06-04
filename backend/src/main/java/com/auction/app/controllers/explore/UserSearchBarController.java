package com.auction.app.controllers.explore;

import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.dtos.UserResponse;
import com.auction.app.domains.users.users.model.User;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class UserSearchBarController {

    private final UserRepository userRepository;
    private final ApplicationContext springContext;
    private ExploreViewController exploreController;

    @FXML private TextField searchField;
    @FXML private VBox resultsContainer;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label pageLabel;

    private int currentPage = 0;
    private final int pageSize = 10;

    @FXML
    public void initialize() {
        searchField.setOnAction(event -> handleSearch());
    }

    public void setExploreController(ExploreViewController exploreController) {
        this.exploreController = exploreController;
    }

    public void loadInitialUsers() {
        currentPage = 0;
        executeSearchQuery();
    }

    @FXML
    private void handleSearch() {
        currentPage = 0;
        executeSearchQuery();
    }

    @FXML
    private void handlePrevPage() {
        if (currentPage > 0) {
            currentPage--;
            executeSearchQuery();
        }
    }

    @FXML
    private void handleNextPage() {
        currentPage++;
        executeSearchQuery();
    }

    private void executeSearchQuery() {
        String query = searchField.getText().trim();
        resultsContainer.getChildren().setAll(createStatusLabel("Loading community..."));
        prevButton.setDisable(true);
        nextButton.setDisable(true);

        Thread searchThread = new Thread(() -> {
            try {
                Page<UserResponse> pageData = userRepository.searchByUsername(query, PageRequest.of(currentPage, pageSize))
                        .map(this::toSearchResult);
                Platform.runLater(() -> populateResults(pageData));
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> resultsContainer.getChildren().setAll(createStatusLabel("Could not load users.")));
            }
        });
        searchThread.setDaemon(true);
        searchThread.start();
    }

    private void populateResults(Page<UserResponse> pageData) {
        resultsContainer.getChildren().clear();

        if (pageData.getContent().isEmpty()) {
            resultsContainer.getChildren().add(createStatusLabel("No users found."));
        }

        for (UserResponse user : pageData.getContent()) {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/ui/views/explore/UserItem.fxml"));
                loader.setControllerFactory(springContext::getBean);
                Parent itemRoot = loader.load();

                UserItemController itemController = loader.getController();
                itemController.setData(user, exploreController);

                resultsContainer.getChildren().add(itemRoot);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        pageLabel.setText(String.format("Page %d of %d", currentPage + 1, Math.max(1, pageData.getTotalPages())));
        prevButton.setDisable(!pageData.hasPrevious());
        nextButton.setDisable(!pageData.hasNext());
    }

    private UserResponse toSearchResult(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getDisplayName())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .build();
    }

    private Label createStatusLabel(String text) {
        Label label = new Label(text);
        label.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 14;");
        return label;
    }
}
