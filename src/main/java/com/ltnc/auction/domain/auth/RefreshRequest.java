package com.ltnc.auction.domain.auth;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(@NotBlank(message = "Refresh token must not be blank") String refreshToken) {
    
}
