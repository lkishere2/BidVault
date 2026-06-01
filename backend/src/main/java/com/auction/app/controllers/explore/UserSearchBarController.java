package com.auction.app.controllers.explore;

import com.auction.app.domains.users.users.UserController;
import com.auction.app.domains.users.users.dtos.UserResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class UserSearchBarController {

    private final UserController userController;
    private final ApplicationContext springContext;
    private ExploreViewController exploreController;

    @FXML private TextField searchField;
    @FXML private VBox resultsContainer;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label pageLabel;

    private int currentPage = 0;
    private final int pageSize = 10;

    public void setExploreController(ExploreViewController exploreController) {
        this.exploreController = exploreController;
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
        if (query.isEmpty()) return;

        new Thread(() -> {
            try {
                ResponseEntity<Page<UserResponse>> response = userController.searchUsersByUsername(query, currentPage, pageSize);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Page<UserResponse> pageData = response.getBody();
                    Platform.runLater(() -> populateResults(pageData));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
    }

    private void populateResults(Page<UserResponse> pageData) {
        resultsContainer.getChildren().clear();

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
}