package com.ltnc.auction.domain.auth;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(@NotBlank String username, @NotBlank String email, @NotBlank String password) {
}
