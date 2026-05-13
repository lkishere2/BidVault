package com.ltnc.auction.domain.auth;

import java.math.BigDecimal;

public record RegisterResponse(String username, String email, BigDecimal balance) {
}
