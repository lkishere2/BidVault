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
    Page<AuctionResponse> getAuctionsBidOnByCurrentUser(Page<Long> auctionIdPage, Pageable pageable);
    Page<AuctionResponse> getDiscoverableAuctions(AuctionFindingRequest request, Pageable pageable);
    Page<AuctionResponse> getAuctionsBySellerId(Long sellerId, Pageable pageable);
    Page<AuctionResponse> getMyAuctions(Pageable pageable);
    List<AuctionResponse> getTop10ActiveAuctions();
}