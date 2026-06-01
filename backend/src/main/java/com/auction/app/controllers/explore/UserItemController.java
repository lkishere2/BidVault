package com.auction.app.controllers.explore;

import com.auction.app.domains.users.users.dtos.UserResponse;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class UserItemController {

    @FXML private HBox itemRoot;
    @FXML private ImageView avatarView;
    @FXML private Label usernameLabel;

    public void setData(UserResponse user, ExploreViewController exploreController) {
        usernameLabel.setText(user.getUsername());

        if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isBlank()) {
            try {
                avatarView.setImage(new Image(user.getProfileImageUrl(), true));
            } catch (Exception e) {
                setDefaultAvatar();
            }
        } else {
            setDefaultAvatar();
        }

        itemRoot.setOnMouseClicked(event -> {
            if (exploreController != null) {
                exploreController.showUserProfile(user);
            }
        });
    }

    private void setDefaultAvatar() {
        avatarView.setImage(new Image("https://api.dicebear.com/7.x/bottts/png?seed=placeholder", true));
    }
}