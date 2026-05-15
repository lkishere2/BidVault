package com.ltnc.auction.ui.controller;

import com.ltnc.auction.ui.SceneManager;
import com.ltnc.auction.ui.http.ApiClient;
import com.ltnc.auction.ui.http.TokenManager;
import com.ltnc.auction.ui.model.LoginResponse;
import javafx.animation.FadeTransition;
import javafx.animation.ParallelTransition;
import javafx.animation.TranslateTransition;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.util.Duration;

import java.net.URL;
import java.util.ResourceBundle;

public class AuthController implements Initializable {

    // ── root ──────────────────────────────────────
    @FXML private StackPane authBox;
    @FXML private AnchorPane introLayer;

    // ── login ─────────────────────────────────────
    @FXML private VBox loginContainer;
    @FXML private TextField loginEmailField;
    @FXML private PasswordField loginPasswordField;
    @FXML private Label loginErrorLabel;
    @FXML private Button loginButton;

    // ── register ──────────────────────────────────
    @FXML private VBox registerContainer;
    @FXML private TextField registerUsernameField;
    @FXML private TextField registerEmailField;
    @FXML private PasswordField registerPasswordField;
    @FXML private Label registerErrorLabel;
    @FXML private Button registerButton;

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        playEntranceAnimation();
    }

    // ─────────────────────────────────────────────
    // Entrance animation
    // ─────────────────────────────────────────────
    private void playEntranceAnimation() {
        FadeTransition fade = new FadeTransition(Duration.millis(600), authBox);
        fade.setFromValue(0);
        fade.setToValue(1);

        TranslateTransition slide = new TranslateTransition(Duration.millis(600), authBox);
        slide.setFromY(50);
        slide.setToY(0);

        FadeTransition introFade = new FadeTransition(Duration.millis(400), introLayer);
        introFade.setFromValue(1);
        introFade.setToValue(0);
        introFade.setDelay(Duration.millis(300));
        introFade.setOnFinished(e -> introLayer.setVisible(false));

        new ParallelTransition(fade, slide).play();
        introFade.play();
    }

    // ─────────────────────────────────────────────
    // Toggle login ↔ register
    // ─────────────────────────────────────────────
    @FXML
    private void goToRegister() {
        fadeOut(loginContainer, () -> fadeIn(registerContainer));
        clearErrors();
    }

    @FXML
    private void goToLogin() {
        fadeOut(registerContainer, () -> fadeIn(loginContainer));
        clearErrors();
    }

    private void fadeOut(VBox target, Runnable onFinished) {
        FadeTransition fade = new FadeTransition(Duration.millis(200), target);
        fade.setFromValue(1);
        fade.setToValue(0);
        fade.setOnFinished(e -> {
            target.setVisible(false);
            target.setManaged(false);
            onFinished.run();
        });
        fade.play();
    }

    private void fadeIn(VBox target) {
        target.setVisible(true);
        target.setManaged(true);
        target.setOpacity(0);
        FadeTransition fade = new FadeTransition(Duration.millis(200), target);
        fade.setFromValue(0);
        fade.setToValue(1);
        fade.play();
    }

    // ─────────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────────
    @FXML
    private void handleLogin() {
        String email = loginEmailField.getText().trim();
        String password = loginPasswordField.getText();

        if (email.isEmpty() || password.isEmpty()) {
            showError(loginErrorLabel, "Please fill in all fields");
            return;
        }

        // disable button while request is in flight
        loginButton.setDisable(true);
        loginButton.setText("Signing in...");

        ApiClient.login(email, password).thenAccept(response -> {
            Platform.runLater(() -> {
                loginButton.setDisable(false);
                loginButton.setText("Sign In");

                if (response.isSuccess()) {
                    LoginResponse loginResponse = ApiClient.parseResponse(
                            response.body(), LoginResponse.class);
                    TokenManager.getInstance().onLoginSuccess(
                            loginResponse.accessToken(),
                            loginResponse.refreshToken());

                    SceneManager.showDashboard();

                } else {
                    showError(loginErrorLabel, "Invalid email or password");
                }
            });
        }).exceptionally(e -> {
            Platform.runLater(() -> {
                loginButton.setDisable(false);
                loginButton.setText("Sign In");
                showError(loginErrorLabel, "Cannot connect to server");
            });
            return null;
        });
    }

    // ─────────────────────────────────────────────
    // Register
    // ─────────────────────────────────────────────
    @FXML
    private void handleRegister() {
        String username = registerUsernameField.getText().trim();
        String email = registerEmailField.getText().trim();
        String password = registerPasswordField.getText();

        if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
            showError(registerErrorLabel, "Please fill in all fields");
            return;
        }

        if (password.length() < 6) {
            showError(registerErrorLabel, "Password must be at least 6 characters");
            return;
        }

        registerButton.setDisable(true);
        registerButton.setText("Creating account...");

        ApiClient.register(username, email, password).thenAccept(response -> {
            Platform.runLater(() -> {
                registerButton.setDisable(false);
                registerButton.setText("Sign Up");

                if (response.isSuccess()) {
                    // auto switch to login after successful register
                    goToLogin();
                    showError(loginErrorLabel, "Account created — please sign in");
                    loginErrorLabel.setStyle("-fx-text-fill: #22C55E;"); // green
                } else {
                    showError(registerErrorLabel, "Email already in use");
                }
            });
        }).exceptionally(e -> {
            Platform.runLater(() -> {
                registerButton.setDisable(false);
                registerButton.setText("Sign Up");
                showError(registerErrorLabel, "Cannot connect to server");
            });
            return null;
        });
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────
    private void showError(Label label, String message) {
        label.setText(message);
        label.setVisible(true);
        label.setManaged(true);
    }

    private void clearErrors() {
        loginErrorLabel.setVisible(false);
        loginErrorLabel.setManaged(false);
        loginErrorLabel.setStyle(""); // reset color
        registerErrorLabel.setVisible(false);
        registerErrorLabel.setManaged(false);
        loginEmailField.clear();
        loginPasswordField.clear();
        registerUsernameField.clear();
        registerEmailField.clear();
        registerPasswordField.clear();
    }
}