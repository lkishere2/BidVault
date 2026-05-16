package com.ltnc.auction.ui;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class SceneManager {

    private static Stage primaryStage;

    public static void init(Stage stage) {
        primaryStage = stage;
    }

    public static void showAuth() {
        loadScene("/pages/authpage.fxml", 1000, 700, "BidVault");
    }

    public static void showDashboard() {
        loadScene("/pages/dashboard.fxml", 1100, 700, "BidVault — Dashboard");
    }

    private static void loadScene(String fxmlPath, int width, int height, String title) {
        try {
            FXMLLoader loader = new FXMLLoader(
                SceneManager.class.getResource(fxmlPath));
            Parent root = loader.load();
            primaryStage.setTitle(title);
            primaryStage.setScene(new Scene(root));
            primaryStage.setResizable(true);
            primaryStage.setFullScreen(true);
            primaryStage.show();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}