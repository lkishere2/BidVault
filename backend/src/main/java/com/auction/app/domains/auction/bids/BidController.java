package com.auction.app.domains.auction.bids;

import java.util.List;

import com.auction.app.domains.auction.auction.AuctionService;
import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;
    private final AuctionService auctionService;

    @MessageMapping("/auction/{auctionId}/bid")
    public void placeBid(@DestinationVariable Long auctionId, @Valid @Payload BidRequest request) {
        bidService.placeBid(auctionId, request);
    }

    @GetMapping("/bids/{auctionId}")
    public ResponseEntity<List<BidResponse>> getBidHistory(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getBidHistory(auctionId));
    }

    @GetMapping("/me/auctions-bid-on")
    public ResponseEntity<List<AuctionResponse>> getAuctionsBidOn() {
        List<Long> auctionIds = bidService.getAuctionsBiddenByCurrentUser();
        return ResponseEntity.ok(auctionService.getAuctionsBidOnByCurrentUser(auctionIds));
    }

}