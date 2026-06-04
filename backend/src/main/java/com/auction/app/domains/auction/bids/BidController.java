package com.auction.app.domains.auction.bids;

import java.security.Principal;

import com.auction.app.domains.auction.auction.AuctionService;
import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.dtos.BidResponse;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;
    private final AuctionService auctionService;
    private final UserRepository userRepository;

    @MessageMapping("/auction/{auctionId}/bid")
    public void placeBid(
            @DestinationVariable Long auctionId,
            @Valid @Payload BidRequest request,
            Principal principal) {
        User bidder = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        bidService.placeBid(auctionId, request, bidder);
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Exception exception) {
        return "{\"message\": \"" + exception.getMessage().replace("\"", "\\\"") + "\"}";
    }

    @GetMapping("/{auctionId}/bids")
    public ResponseEntity<Slice<BidResponse>> getBidHistory(
            @PathVariable Long auctionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(bidService.getBidHistory(auctionId, pageable));
    }

    @GetMapping("/me/auctions-bid-on")
    public ResponseEntity<Page<AuctionResponse>> getAuctionsBidOn(Pageable pageable) {
        Page<Long> idPage = bidService.getAuctionsBiddenByCurrentUser(pageable);
        return ResponseEntity.ok(auctionService.getAuctionsBidOnByCurrentUser(idPage, pageable));
    }

}