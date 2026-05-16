package com.ltnc.auction.ui.http;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;

public class ApiClient {

    private static final String BASE_URL = "http://localhost:8000";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // ─────────────────────────────────────────
    // Register
    // ─────────────────────────────────────────
    public static CompletableFuture<ApiResponse> register(
            String username, String email, String password) {

        String body = toJson(new RegisterRequest(username, email, password));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> new ApiResponse(
                        response.statusCode(),
                        response.body()
                ));
    }

    // ─────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────
    public static CompletableFuture<ApiResponse> login(String email, String password) {

        String body = toJson(new LoginRequest(email, password));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> new ApiResponse(
                        response.statusCode(),
                        response.body()
                ));
    }

    // ─────────────────────────────────────────
    // Refresh token
    // ─────────────────────────────────────────
    public static CompletableFuture<ApiResponse> refresh(String refreshToken) {

        String body = toJson(new RefreshRequest(refreshToken));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/refresh"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return sendAsync(request);
    }

    // ─────────────────────────────────────────
    // Authenticated request helper
    // ─────────────────────────────────────────
    public static HttpRequest.Builder authenticatedRequest(String endpoint) {
        return HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + TokenManager.getInstance().getAccessToken());
    }

    public static CompletableFuture<ApiResponse> getActiveAuctions() {
        return get("/api/auctions/active");
    }

    public static CompletableFuture<ApiResponse> getMyBids() {
        return get("/api/auctions/bids/me");
    }

    public static CompletableFuture<ApiResponse> getMyAuctions() {
        return get("/api/auctions/my");
    }

    public static CompletableFuture<ApiResponse> getInventory() {
        return get("/api/inventory/all");
    }

    public static CompletableFuture<ApiResponse> getProfile() {
        return get("/api/auth/profile");
    }

    public static CompletableFuture<ApiResponse> getAvailableItems() {
        return get("/api/inventory/available");
    }

    public static CompletableFuture<ApiResponse> createAuction(
            Long itemId, BigDecimal startingPrice, Instant startTime, Instant endTime) {
        String body = toJson(new AuctionCreateRequest(itemId, startingPrice, startTime, endTime));

        HttpRequest request = authenticatedRequest("/api/auctions")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return sendAsync(request);
    }

    public static CompletableFuture<ApiResponse> placeBid(Long auctionId, BigDecimal amount) {
        String body = toJson(new BidRequest(amount));

        HttpRequest request = authenticatedRequest("/api/auctions/" + auctionId + "/bid")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return sendAsync(request);
    }

    public static CompletableFuture<ApiResponse> logout(String refreshToken, String accessToken) {
        String body = toJson(new LogoutRequest(refreshToken, accessToken));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/logout"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        return sendAsync(request);
    }

    private static CompletableFuture<ApiResponse> get(String endpoint) {
        HttpRequest request = authenticatedRequest(endpoint)
                .GET()
                .build();
        return sendAsync(request);
    }

    private static CompletableFuture<ApiResponse> sendAsync(HttpRequest request) {
        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> new ApiResponse(
                        response.statusCode(),
                        response.body()
                ));
    }

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────
    private static String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize request", e);
        }
    }

    public static <T> T parseResponse(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse response", e);
        }
    }

    public static <T> T parseResponse(String json, TypeReference<T> typeReference) {
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse response", e);
        }
    }

    // ─────────────────────────────────────────
    // Request records
    // ─────────────────────────────────────────
    record LoginRequest(String email, String password) {}
    record RegisterRequest(String username, String email, String password) {}
    record RefreshRequest(String refreshToken) {}
    record LogoutRequest(String refreshToken, String accessToken) {}
    record AuctionCreateRequest(Long itemId, BigDecimal startingPrice, Instant startTime, Instant endTime) {}
    record BidRequest(BigDecimal amount) {}

    // ─────────────────────────────────────────
    // Response wrapper
    // ─────────────────────────────────────────
    public record ApiResponse(int statusCode, String body) {
        public boolean isSuccess() { return statusCode >= 200 && statusCode < 300; }
    }
}