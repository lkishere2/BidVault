package com.auction.app.domains.auction.auction;

import com.auction.app.domains.auction.auction.dtos.AuctionFindingRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.products.model.Tag;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
public class AuctionController {
    private final AuctionService auctionService;

    @GetMapping("/me")
    public ResponseEntity<Page<AuctionResponse>> getMyAuctions(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, "startTime"));
        return ResponseEntity.ok(auctionService.getMyAuctions(pageable));
    }

    @PostMapping("/create")
    public ResponseEntity<AuctionResponse> createAuction(@RequestBody @Valid AuctionRequest request) {
        return ResponseEntity.ok(auctionService.createAuction(request));
    }

    @DeleteMapping("/cancel/{auctionId}")
    public ResponseEntity<AuctionResponse> cancelAuction(@PathVariable Long auctionId) {
        return ResponseEntity.ok(auctionService.cancelAuction(auctionId));
    }

    @GetMapping("/get/{auctionId}")
    public ResponseEntity<AuctionResponse> getAuction(@PathVariable Long auctionId) {
        return ResponseEntity.ok(auctionService.getAuction(auctionId));
    }

    @GetMapping("/discover")
    public ResponseEntity<Page<AuctionResponse>> getDiscoverableAuctions(
            @RequestParam(required = false) @Size(max = 100, message = "Product name search query must not exceed 100 characters") String productName,
            @RequestParam(required = false) Set<Tag> tags,
            @RequestParam(required = false) Instant startTime,
            @RequestParam(required = false) Instant endTime,
            @RequestParam(required = false) @DecimalMin(value = "0.0", message = "Minimum starting price cannot be negative") BigDecimal minStartingPrice,
            @RequestParam(required = false) AuctionStatus status,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "page must be >= 0") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "size must be >= 1") int size) {

        AuctionFindingRequest request = new AuctionFindingRequest(productName, tags, startTime, endTime, minStartingPrice, status);
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auctionService.getDiscoverableAuctions(request, pageable));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<Page<AuctionResponse>> getAuctionsBySellerId(
            @PathVariable Long sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"));
        return ResponseEntity.ok(auctionService.getAuctionsBySellerId(sellerId, pageable));
    }

    @GetMapping("/top")
    public ResponseEntity<List<AuctionResponse>> getTopAuctions() {
        return ResponseEntity.ok(auctionService.getTop10ActiveAuctions());
    }

}