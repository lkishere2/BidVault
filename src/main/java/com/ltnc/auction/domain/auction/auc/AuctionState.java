package com.ltnc.auction.domain.auction.auc;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionState implements Serializable{
    private Long auctionId;
    private BigDecimal currentPrice;
    private BigDecimal minBidIncrement;
    private Instant endTime;
    private Integer bidCount;
    private Long winnerId;
    private String winnerLabel;
    private AuctionStatus status;
}