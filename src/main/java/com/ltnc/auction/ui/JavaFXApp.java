package com.ltnc.auction.ui;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/**
 * Test JavaFX Application to verify JavaFX is working with Spring Boot
 */
public class JavaFXApp extends Application {

    @Override
    public void start(Stage primaryStage) {
        // Create the root layout
        VBox root = new VBox();
        root.setPadding(new Insets(20));
        root.setSpacing(15);
        root.setAlignment(Pos.CENTER);

        // Create UI components
        Label titleLabel = new Label("JavaFX + Spring Boot Integration Test");
        titleLabel.setStyle("-fx-font-size: 18; -fx-font-weight: bold;");

        Label statusLabel = new Label("✓ JavaFX is working!");
        statusLabel.setStyle("-fx-font-size: 14; -fx-text-fill: green;");

        Label infoLabel = new Label("This confirms JavaFX can run alongside Spring Boot");
        infoLabel.setStyle("-fx-font-size: 12;");

        Button exitButton = new Button("Exit");
        exitButton.setPrefWidth(100);
        exitButton.setOnAction(e -> primaryStage.close());

        // Add components to root
        root.getChildren().addAll(titleLabel, statusLabel, infoLabel, exitButton);

        // Create scene
        Scene scene = new Scene(root, 400, 300);

        // Set stage properties
        primaryStage.setTitle("Auction - JavaFX Test");
        primaryStage.setScene(scene);
        primaryStage.show();

        System.out.println("JavaFX Application Started Successfully!");
    }

    public static void main(String[] args) {
        launch(args);
    }
}
