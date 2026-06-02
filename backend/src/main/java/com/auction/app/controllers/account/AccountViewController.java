package com.auction.app.controllers.account;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.layout.StackPane;
import org.springframework.stereotype.Component;

@Component
public class AccountViewController {

    @FXML
    private StackPane accountContentCanvas;

    @FXML
    public void initialize() {
        System.out.println("AccountView Container shell layout successfully initialized.");
        try {
            Parent dashboard = FXMLLoader.load(
                    getClass().getResource("/ui/views/account/DashboardView.fxml")
            );
            accountContentCanvas.getChildren().setAll(dashboard);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public StackPane getAccountContentCanvas() {
        return accountContentCanvas;
    }

}