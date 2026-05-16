package com.auction.app.domains.auction.auction;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.app.domains.products.Product;
import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.users.users.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;
    private final AuctionCacheAdapter auctionCacheAdapter;

    @Transactional
    public AuctionResponse createAuction(AuctionRequest request) {
        // Validate the time
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Validate the product
        User currentSeller = getCurrentUser();
        Product product = productRepository.findByIdAndOwnerUserId(request.getProductId(), currentSeller.getId())
                .orElseThrow(() -> new RuntimeException("Product not found in your inventory"));

        // Validate the quantity
        if (request.getQuantity() > product.getQuantity()) {
            throw new RuntimeException(
                    "Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + product.getQuantity() + ")"
            );
        }

        // Update new quantity in the storage
        product.setQuantity(product.getQuantity() - request.getQuantity());
        productRepository.save(product);

        // Create new entity and save to DB
        Auction auction = mapToEntity(request, currentSeller, product);
        Auction saved = auctionRepository.save(auction);

        // Cache the lightweight version to the cache (AuctionState)
        cacheAuctionState(saved);

        // Return the response
        return AuctionResponse.from(saved);
    }

    @Transactional
    public AuctionResponse cancelAuction(Long auctionId) {
        // Find the entity from DB
        Auction auction = auctionRepository.findByIdWithDetails(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Check authority
        User currentSeller = getCurrentUser();
        if (!auction.getSeller().getId().equals(currentSeller.getId())) {
            throw new RuntimeException("You are not the seller of this auction");
        }

        // We can only cancle UPCOMING auction only
        if (auction.getStatus() != AuctionStatus.UPCOMING) {
            throw new RuntimeException("Only UPCOMING auctions can be cancelled");
        }

        // Update quantity to product
        Product product = auction.getProduct();
        product.setQuantity(product.getQuantity() + auction.getAuctionedQuantity());
        productRepository.save(product);

        // Set new status for auction
        auction.setStatus(AuctionStatus.CANCELLED);
        Auction saved = auctionRepository.save(auction);

        // Clear the cache
        auctionCacheAdapter.clearAuctionCache(auctionId);

        // Return the response
        return AuctionResponse.from(saved);
    }

    public AuctionResponse getAuction(Long auctionId) {
        // Fetch the data from DB first
        Auction auction = auctionRepository.findByIdWithDetails(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Check the cache for real-time state (bids, current price)
        AuctionState state = auctionCacheAdapter.getAuctionState(auctionId);

        // If cache is active, enrich the DB entity data with the real-time cache state
        if (state != null && state.getStatus() == AuctionStatus.ACTIVE) {
            return AuctionResponse.fromWithState(auction, state);
        }

        // Fallback if cache is missing, expired, or inactive (uses DB state)
        return AuctionResponse.from(auction);
    }

    public List<AuctionResponse> getActiveAuctions() {
        return auctionRepository.findByStatusWithDetails(AuctionStatus.ACTIVE)
                .stream()
                .map(auction -> {
                    AuctionState state = auctionCacheAdapter.getAuctionState(auction.getId());
                    return state != null
                            ? AuctionResponse.fromWithState(auction, state)
                            : AuctionResponse.from(auction);
                })
                .toList();
    }

    public List<AuctionResponse> getUpcomingAuctions() {
        return auctionRepository.findByStatusWithDetails(AuctionStatus.UPCOMING)
                .stream()
                .map(auction -> {
                    AuctionState state = auctionCacheAdapter.getAuctionState(auction.getId());
                    return state != null
                            ? AuctionResponse.fromWithState(auction, state)
                            : AuctionResponse.from(auction);
                })
                .toList();
    }

    public List<AuctionResponse> getMyAuctions() {
        User currentSeller = getCurrentUser();
        return auctionRepository.findBySellerUserIdWithDetails(currentSeller.getId())
                .stream()
                .map(auction -> {
                    AuctionState state = auctionCacheAdapter.getAuctionState(auction.getId());
                    return state != null
                            ? AuctionResponse.fromWithState(auction, state)
                            : AuctionResponse.from(auction);
                })
                .toList();
    }

    public void cacheAuctionState(Auction auction) {
        AuctionState state = AuctionState.builder()
                .auctionId(auction.getId())
                .currentPrice(auction.getCurrentPrice())
                .minBidIncrement(auction.getMinBidIncrement())
                .endTime(auction.getEndTime())
                .bidCount(auction.getBidCount())
                .winnerId(null)
                .winnerLabel(null)
                .status(auction.getStatus())
                .build();
        auctionCacheAdapter.cacheAuctionState(auction.getId(), state);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    private Auction mapToEntity(AuctionRequest request, User currentSeller, Product product) {
        Auction auction = Auction.builder()
                .seller(currentSeller)
                .product(product)
                .auctionedQuantity(request.getQuantity())
                .startingPrice(request.getStartingPrice())
                .currentPrice(request.getStartingPrice())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        auction.recalculateMinBidIncrement();
        return auction;
    }
}