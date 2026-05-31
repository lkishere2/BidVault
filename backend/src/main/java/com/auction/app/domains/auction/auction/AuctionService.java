package com.auction.app.domains.auction.auction;

import java.util.List;
import com.auction.app.domains.auction.auction.dtos.AuctionFindingRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuctionService {
    AuctionResponse createAuction(AuctionRequest request);
    AuctionResponse cancelAuction(Long auctionId);
    AuctionResponse getAuction(Long auctionId);
    List<AuctionResponse> getAuctionsBidOnByCurrentUser(List<Long> auctionIds);
    Page<AuctionResponse> getDiscoverableAuctions(AuctionFindingRequest request, Pageable pageable);
    // Fix #16: these two methods existed only on the impl — add them to the interface so they
    // are accessible polymorphically (tests, other services wired to AuctionService)
    Page<AuctionResponse> getMyAuctions(Pageable pageable);
}