package com.ltnc.auction.domain.auth;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(
    @NotBlank(message = "Refresh token must not be blank") String refreshToken,
    @NotBlank(message = "Access token must not be blank") String accessToken
) {
    
}
