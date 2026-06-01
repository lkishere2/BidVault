package com.auction.app.controllers.explore;

import com.auction.app.domains.users.connection.ConnectionController;
import com.auction.app.domains.users.connection.dtos.UserStats;
import com.auction.app.domains.users.users.dtos.UserResponse;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserProfileController {

    private final ConnectionController connectionController;
    private ExploreViewController exploreController;
    private UserResponse currentTargetUser;
    private boolean isFollowing = false;

    @FXML private ImageView profileAvatarView;
    @FXML private Label profileUsername;
    @FXML private Label followersCountLabel;
    @FXML private Label followingCountLabel;
    @FXML private Button followButton;

    public void setExploreController(ExploreViewController exploreController) {
        this.exploreController = exploreController;
    }

    public void loadProfileData(UserResponse user) {
        this.currentTargetUser = user;
        this.isFollowing = false; // Initial baseline reset status pass
        profileUsername.setText(user.getUsername());

        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isBlank()) {
            try {
                profileAvatarView.setImage(new Image(user.getProfileImageUrl(), true));
            } catch (Exception e) {
                setDefaultAvatar();
            }
        } else {
            setDefaultAvatar();
        }

        // Updates styles back to original follow configuration
        updateButtonUI();
        fetchUserStats();
    }

    private void fetchUserStats() {
        long targetUserId = currentTargetUser.getId();

        Runnable fetchTask = () -> {
            try {
                ResponseEntity<UserStats> response = connectionController.getStats(targetUserId);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    UserStats stats = response.getBody();
                    Platform.runLater(() -> {
                        followersCountLabel.setText(String.valueOf(stats.getFollowersCount()));
                        followingCountLabel.setText(String.valueOf(stats.getFollowingCount()));
                    });
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch user connection statistics: " + e.getMessage());
            }
        };

        DelegatingSecurityContextRunnable secureTask = new DelegatingSecurityContextRunnable(fetchTask, SecurityContextHolder.getContext());
        new Thread(secureTask).start();
    }

    @FXML
    private void handleToggleFollow() {
        long targetUserId = currentTargetUser.getId();

        Runnable followTask = () -> {
            try {
                ResponseEntity<Void> response = connectionController.follow(targetUserId);
                if (response.getStatusCode().is2xxSuccessful()) {
                    // Locally toggle state safely without waiting for asynchronous background check overrides
                    isFollowing = !isFollowing;
                    Platform.runLater(() -> {
                        updateButtonUI();
                        fetchUserStats(); // Safely pulls updated count fields without wiping button state strings
                    });
                }
            } catch (Exception e) {
                System.err.println("Connection controller state transition mutation rejected: " + e.getMessage());
            }
        };

        DelegatingSecurityContextRunnable secureTask = new DelegatingSecurityContextRunnable(followTask, SecurityContextHolder.getContext());
        new Thread(secureTask).start();
    }

    private void updateButtonUI() {
        if (isFollowing) {
            followButton.setText("Unfollow");
            followButton.setStyle("-fx-background-color: #E2E8F0; -fx-text-fill: #1E293B; -fx-background-radius: 8; -fx-padding: 10 24; -fx-font-weight: bold; -fx-cursor: hand;");
        } else {
            followButton.setText("Follow");
            followButton.setStyle("-fx-background-color: #3B82F6; -fx-text-fill: white; -fx-background-radius: 8; -fx-padding: 10 24; -fx-font-weight: bold; -fx-cursor: hand;");
        }
    }

    @FXML
    private void handleBackToSearch() {
        if (exploreController != null) {
            exploreController.showSearchPane();
        }
    }

    private void setDefaultAvatar() {
        profileAvatarView.setImage(new Image("https://api.dicebear.com/7.x/bottts/png?seed=placeholder", true));
    }
}