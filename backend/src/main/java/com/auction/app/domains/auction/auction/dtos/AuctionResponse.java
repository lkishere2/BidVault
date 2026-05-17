package com.auction.app.domains.auction.auction.dtos;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;

import com.auction.app.domains.auction.auction.Auction;
import com.auction.app.domains.auction.auction.AuctionStatus;
import com.auction.app.domains.products.Tag;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuctionResponse {

    private Long id;
    private String sellerLabel;
    private Long productId;
    private String productName;
    private Set<Tag> productTags;
    private Integer auctionedQuantity;
    private BigDecimal startingPrice;
    private BigDecimal currentPrice;
    private BigDecimal minBidIncrement;
    private Instant startTime;
    private Instant endTime;
    private AuctionStatus status;
    private String winnerLabel;
    private Integer bidCount;

    // Map from DB Entity to Response
    public static AuctionResponse from(Auction auction) {
        return AuctionResponse.builder()
                .id(auction.getId())
                .sellerLabel(auction.getSeller().getDisplayName() + " #" + auction.getSeller().getId())
                .productId(auction.getProduct().getId())
                .productName(auction.getProduct().getProductName())
                .productTags(auction.getProduct().getTags())
                .auctionedQuantity(auction.getAuctionedQuantity())
                .startingPrice(auction.getStartingPrice())
                .currentPrice(auction.getCurrentPrice())
                .minBidIncrement(auction.getMinBidIncrement())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .status(auction.getStatus())
                .winnerLabel(auction.getWinner() != null
                        ? auction.getWinner().getDisplayName() + " #" + auction.getWinner().getId()
                        : null)
                .bidCount(auction.getBidCount())
                .build();
    }

    // Map from Cache Entity to Response
    public static AuctionResponse fromWithState(Auction auction, AuctionState state) {
        return AuctionResponse.builder()
                .id(auction.getId())
                .sellerLabel(auction.getSeller().getDisplayName() + " #" + auction.getSeller().getId())
                .productId(auction.getProduct().getId())
                .productName(auction.getProduct().getProductName())
                .productTags(auction.getProduct().getTags())
                .auctionedQuantity(auction.getAuctionedQuantity())
                .startingPrice(auction.getStartingPrice())
                .currentPrice(state.getCurrentPrice())
                .minBidIncrement(state.getMinBidIncrement())
                .startTime(auction.getStartTime())
                .endTime(state.getEndTime())
                .status(state.getStatus())
                .winnerLabel(state.getWinnerLabel())
                .bidCount(state.getBidCount())
                .build();
    }
}