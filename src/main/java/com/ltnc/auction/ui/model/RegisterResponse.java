package com.ltnc.auction.ui.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RegisterResponse(
    String username,
    String email,
    BigDecimal balance
) {}