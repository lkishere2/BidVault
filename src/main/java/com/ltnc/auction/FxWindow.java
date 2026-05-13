package com.ltnc.auction;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class FxWindow {
    public void show() {
        try {
            // Load the design from the resources folder
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ui/components/main.fxml"));
            Parent root = loader.load();

            Stage stage = new Stage();
            stage.setTitle("Auction System");
            stage.setScene(new Scene(root, 600, 400));
            stage.show();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}