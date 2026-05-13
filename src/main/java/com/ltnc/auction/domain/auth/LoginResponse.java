package com.ltnc.auction.domain.auth;

public record LoginResponse(String email, String accessToken, String refreshToken) {
    
}
