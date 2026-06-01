package com.auction.app.controllers.explore;

import com.auction.app.domains.users.users.dtos.UserResponse;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.layout.StackPane;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class ExploreViewController {

    private final ApplicationContext springContext;
    @FXML private StackPane exploreContentArea;

    @FXML
    public void initialize() {
        showSearchPane();
    }

    public void showSearchPane() {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ui/views/explore/UserSearchBar.fxml"));
            loader.setControllerFactory(springContext::getBean);
            Parent searchPane = loader.load();

            UserSearchBarController controller = loader.getController();
            controller.setExploreController(this);

            exploreContentArea.getChildren().setAll(searchPane);
        } catch (IOException e) {
            System.err.println("CRITICAL: Failed to parse UserSearchBar.fxml context -> " + e.getMessage());
        }
    }

    public void showUserProfile(UserResponse user) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ui/views/explore/UserProfile.fxml"));
            loader.setControllerFactory(springContext::getBean);
            Parent profilePane = loader.load();

            UserProfileController controller = loader.getController();
            controller.setExploreController(this);
            controller.loadProfileData(user);

            exploreContentArea.getChildren().setAll(profilePane);
        } catch (IOException e) {
            System.err.println("CRITICAL: Failed to parse UserProfile.fxml context -> " + e.getMessage());
        }
    }
}