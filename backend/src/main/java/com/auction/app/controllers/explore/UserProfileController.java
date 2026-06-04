package com.auction.app.controllers.explore;

import com.auction.app.domains.users.connection.ConnectionController;
import com.auction.app.domains.users.connection.dtos.UserStats;
import com.auction.app.domains.auction.auction.AuctionController;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.users.users.dtos.UserResponse;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.TilePane;
import javafx.scene.layout.VBox;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.auction.app.infrastructure.security.SecurityUtils;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class UserProfileController {

    private final ConnectionController connectionController;
    private final AuctionController auctionController;
    private final ApplicationContext springContext;
    private final SecurityUtils securityUtils;
    private ExploreViewController exploreController;
    private UserResponse currentTargetUser;
    private boolean isFollowing = false;

    @FXML private ImageView profileAvatarView;
    @FXML private Label profileUsername;
    @FXML private Label followersCountLabel;
    @FXML private Label followingCountLabel;
    @FXML private Button followButton;
    @FXML private TilePane auctionGrid;
    @FXML private Label auctionsStatusLabel;

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

        configureFollowButtonForCurrentUser();
        // Check DB state on load so button correctly shows Follow or Unfollow
        checkFollowRelationshipState();
        loadUserStats();
        loadSellerAuctions();
    }

    private void configureFollowButtonForCurrentUser() {
        try {
            boolean isCurrentUser = currentTargetUser.getId() != null
                    && currentTargetUser.getId().equals(securityUtils.getCurrentUserId());
            followButton.setVisible(!isCurrentUser);
            followButton.setManaged(!isCurrentUser);
        } catch (Exception e) {
            followButton.setVisible(true);
            followButton.setManaged(true);
        }
    }

    private void loadUserStats() {
        long targetUserId = currentTargetUser.getId();

        Runnable statsTask = () -> {
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
                System.err.println("Failed to fetch user stats from server: " + e.getMessage());
            }
        };

        DelegatingSecurityContextRunnable secureTask = new DelegatingSecurityContextRunnable(statsTask, SecurityContextHolder.getContext());
        new Thread(secureTask).start();
    }

    private void loadSellerAuctions() {
        long targetUserId = currentTargetUser.getId();
        auctionsStatusLabel.setText("Loading auctions...");
        auctionGrid.getChildren().clear();

        Runnable auctionsTask = () -> {
            try {
                ResponseEntity<Page<AuctionResponse>> response = auctionController.getAuctionsBySellerId(targetUserId, 0, 12);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Page<AuctionResponse> page = response.getBody();
                    Platform.runLater(() -> renderAuctions(page));
                }
            } catch (Exception e) {
                System.err.println("Failed to load seller auctions: " + e.getMessage());
                Platform.runLater(() -> auctionsStatusLabel.setText("Could not load auctions."));
            }
        };

        DelegatingSecurityContextRunnable secureTask = new DelegatingSecurityContextRunnable(auctionsTask, SecurityContextHolder.getContext());
        new Thread(secureTask).start();
    }

    private void renderAuctions(Page<AuctionResponse> page) {
        auctionGrid.getChildren().clear();
        if (page.getContent().isEmpty()) {
            auctionsStatusLabel.setText("No active auctions yet.");
            return;
        }

        auctionsStatusLabel.setText("");
        for (AuctionResponse auction : page.getContent()) {
            auctionGrid.getChildren().add(createAuctionCard(auction));
        }
    }

    private Parent createAuctionCard(AuctionResponse auction) {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ui/views/explore/UserAuctionItem.fxml"));
            loader.setControllerFactory(springContext::getBean);
            Parent itemRoot = loader.load();

            UserAuctionItemController controller = loader.getController();
            controller.setAuctionData(auction);
            return itemRoot;
        } catch (IOException e) {
            Label fallback = new Label(auction.getProductName());
            fallback.setStyle("-fx-text-fill: #FFFFFF; -fx-background-color: #1A1A1A; -fx-padding: 16;");
            return new VBox(fallback);
        }
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
            followButton.setStyle("-fx-background-color: #F5C518; -fx-text-fill: #0D0D0D; -fx-background-radius: 8; -fx-padding: 10 24; -fx-font-weight: bold; -fx-cursor: hand;");
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
