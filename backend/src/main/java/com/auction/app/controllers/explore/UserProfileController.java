package com.auction.app.controllers.explore;

import com.auction.app.domains.users.connection.ConnectionController;
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

        followersCountLabel.setText(String.valueOf(user.getFollowersCount() != null ? user.getFollowersCount() : 0));
        followingCountLabel.setText(String.valueOf(user.getFollowingCount() != null ? user.getFollowingCount() : 0));

        // Check DB state on load so button correctly shows Follow or Unfollow
        checkFollowRelationshipState();
    }

    private void checkFollowRelationshipState() {
        long targetUserId = currentTargetUser.getId();

        Runnable checkTask = () -> {
            try {
                ResponseEntity<Boolean> response = connectionController.checkFollowStatus(targetUserId);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    this.isFollowing = response.getBody();
                    Platform.runLater(this::updateButtonUI);
                }
            } catch (Exception e) {
                System.err.println("Failed to fetch initial follow status from server: " + e.getMessage());
            }
        };

        DelegatingSecurityContextRunnable secureTask = new DelegatingSecurityContextRunnable(checkTask, SecurityContextHolder.getContext());
        new Thread(secureTask).start();
    }


    @FXML
    private void handleToggleFollow() {
        long targetUserId = currentTargetUser.getId();

        Runnable followTask = () -> {
            try {
                ResponseEntity<Void> response = connectionController.follow(targetUserId);
                if (response.getStatusCode().is2xxSuccessful()) {
                    isFollowing = !isFollowing;
                    Platform.runLater(() -> {
                        updateButtonUI();
                        // Update local count
                        int currentCount = currentTargetUser.getFollowersCount() != null ? currentTargetUser.getFollowersCount() : 0;
                        int newCount = isFollowing ? currentCount + 1 : currentCount - 1;
                        currentTargetUser.setFollowersCount(newCount);
                        followersCountLabel.setText(String.valueOf(newCount));
                    });
                }
            } catch (Exception e) {
                System.err.println("Toggle follow action failed: " + e.getMessage());
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