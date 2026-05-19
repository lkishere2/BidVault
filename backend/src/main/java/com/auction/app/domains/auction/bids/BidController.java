package com.auction.app.domains.auction.bids;

import java.util.List;

import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.AuctionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
@Tag(name = "Bid")
public class BidController {

    private final BidService bidService;
    private final AuctionService auctionService;

    @PostMapping("/{auctionId}/bid")
    public ResponseEntity<Void> placeBid(@PathVariable Long auctionId, @RequestBody @Valid BidRequest request) {
        bidService.placeBid(auctionId, request);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/{auctionId}/bids")
    public ResponseEntity<List<BidResponse>> getBidHistory(@PathVariable Long auctionId) {
        return ResponseEntity.ok(bidService.getBidHistory(auctionId));
    }

    @GetMapping("/bids/me")
    public ResponseEntity<List<AuctionResponse>> getAuctionsBidOn() {
        List<Long> auctionIds = bidService.getAuctionsBiddenByCurrentUser();
        return ResponseEntity.ok(auctionService.getAuctionsBidOnByCurrentUser(auctionIds));
    }
}