package com.auction.app.domains.auction.bids.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Jacksonized
public class BidFeedEvent implements Serializable {
    private String bidderLabel;
    private BigDecimal amount;
    private Instant placedAt;
}