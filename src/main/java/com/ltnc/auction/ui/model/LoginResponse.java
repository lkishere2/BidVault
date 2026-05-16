package com.ltnc.auction.ui.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LoginResponse(
    String email,
    String accessToken,
    String refreshToken
) {}