package com.ltnc.auction.ui.http;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.util.Duration;

public class TokenManager {

    private static final TokenManager INSTANCE = new TokenManager();
    public static TokenManager getInstance() { return INSTANCE; }
    private TokenManager() {}

    private String accessToken;
    private String refreshToken;
    private Timeline refreshTimeline;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─────────────────────────────────────────
    // Called after successful login
    // ─────────────────────────────────────────
    public void onLoginSuccess(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        startRefreshTimer();
    }

    // ─────────────────────────────────────────
    // Auto refresh every 15 minutes
    // ─────────────────────────────────────────
    private void startRefreshTimer() {
        if (refreshTimeline != null) refreshTimeline.stop();

        refreshTimeline = new Timeline(
            new KeyFrame(Duration.minutes(15), event -> refreshTokens())
        );
        refreshTimeline.setCycleCount(Timeline.INDEFINITE);
        refreshTimeline.play();
    }

    private void refreshTokens() {
        if (refreshToken == null) return;

        ApiClient.refresh(refreshToken).thenAccept(response -> {
            if (response.isSuccess()) {
                try {
                    JsonNode json = objectMapper.readTree(response.body());
                    this.accessToken = json.get("accessToken").asText();
                    this.refreshToken = json.get("refreshToken").asText();
                } catch (Exception e) {
                    e.printStackTrace();
                    forceLogout();
                }
            } else {
                forceLogout();
            }
        });
    }

    // ─────────────────────────────────────────
    // Clear on logout
    // ─────────────────────────────────────────
    public void logout() {
        stopRefreshTimer();
        this.accessToken = null;
        this.refreshToken = null;
    }

    private void forceLogout() {
        logout();
        // TODO: navigate back to login screen via SceneManager
    }

    public void stopRefreshTimer() {
        if (refreshTimeline != null) refreshTimeline.stop();
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public boolean isLoggedIn() { return accessToken != null; }
}