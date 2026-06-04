package com.auction.app.domains.auction.auction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.auction.app.domains.auction.auction.dtos.AuctionFindingRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.auction.redis.AuctionRedisService;
import com.auction.app.domains.auction.auction.validator.AuctionValidatorService;
import com.auction.app.domains.auction.exceptions.*;
import com.auction.app.domains.notifications.NotificationService;
import com.auction.app.domains.products.exceptions.ProductNotFoundException;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.infrastructure.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.products.ProductRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final ProductRepository productRepository;
    private final AuctionValidatorService auctionValidatorService;
    private final AuctionRedisService cache;
    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    public Page<AuctionResponse> getMyAuctions(Pageable pageable) {

        log.info("[Auction Service - Get My Auctions] Creating the page for pagination");
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "startTime")
        );

        // TODO: Migrate the DB to Singapore for faster query
        log.info("[Auction Service - Get My Auctions] Fetching auction IDs for the current user from database");
        Page<Long> idPage = auctionRepository.findIdsBySellerIdOrderByStartTime(securityUtils.getCurrentUserId(), sortedPageable);
        List<Long> ids = idPage.getContent();
        if (ids.isEmpty()) return Page.empty(pageable);

        log.info("[Auction Service - Get My Auctions] Using MGET in Redis to avoid multiple network round-trips");
        List<AuctionResponse> cached = cache.getAuctionResponses(ids);

        log.info("[Auction Service - Get My Auctions] Handling cache missing, repopulating Redis and fetching response from DB");
        Map<Long, Integer> idToIndex = new HashMap<>();
        List<Long> missedIds = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            if (cached.get(i) == null) missedIds.add(ids.get(i));
            idToIndex.put(ids.get(i), i);
        }

        if (!missedIds.isEmpty()) {
            List<Auction> fetched = auctionRepository.findByIdsWithDetails(missedIds);

            Map<Long, AuctionResponse> toCache = new HashMap<>();
            for (Auction auction : fetched) {
                AuctionResponse response = AuctionResponse.from(auction);
                cached.set(idToIndex.get(auction.getId()), response);
                toCache.put(auction.getId(), response);
            }
            cache.cacheAuctionResponses(toCache);
        }

        log.info("[Auction Service - Get My Auctions] Returning the final paginated response");
        return new PageImpl<>(cached, pageable, idPage.getTotalElements());
    }

    @Transactional
    public AuctionResponse createAuction(AuctionRequest request) {

        User seller = securityUtils.getCurrentUser();
        log.info("[Auction Service - Create Auction] Initiating auction creation for seller ID: {}", seller.getId());

        auctionValidatorService.validateTime(request.getStartTime(), request.getEndTime());
        Product product = findProductByIdAndOwnerId(request.getProductId(), seller.getId());
        auctionValidatorService.validateQuantity(request.getQuantity(), product.getQuantity());
        log.info("[Auction Service - Create Auction] Validation successful for product ID: {}", request.getProductId());

        product.setQuantity(product.getQuantity() - request.getQuantity());
        productRepository.save(product);
        log.info("[Auction Service - Create Auction] Deducted {} units from stock. New stock balance: {}", request.getQuantity(), product.getQuantity());

        Auction auction = mapToEntity(request, product, seller);
        auctionRepository.save(auction);
        AuctionResponse response = AuctionResponse.from(auction);
        log.info("[Auction Service - Create Auction] Auction record successfully persisted in DB with ID: {}", auction.getId());

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        log.info("[Auction Service - Create Auction] Transaction committed successfully. Executing post-commit hooks for auction ID: {}", auction.getId());
                        cache.cacheAuctionResponse(auction.getId(), response);
                        log.info("[Auction Service - Create Auction] Auction ID: {} successfully synced to cache", auction.getId());
                        notificationService.notifyFollowersOfNewAuction(seller);
                        log.info("[Auction Service - Create Auction] Followers notified of new auction from seller ID: {}", seller.getId());
                    }
                }
        );

        return response;
    }

    @Transactional
    public AuctionResponse cancelAuction(Long auctionId) {

        User seller = securityUtils.getCurrentUser();
        Auction auction = findByIdWithDetails(auctionId);
        log.info("[Auction Service - Cancel Auction] First, we fetch the user and the wanted auction details for ID: {}", auctionId);

        auctionValidatorService.validateUser(auction.getSeller(), seller);
        auctionValidatorService.validateAuctionCancellation(auction);
        log.info("[Auction Service - Cancel Auction] Then, we validate user permission and status requirements");

        Product product = auction.getProduct();
        product.setQuantity(product.getQuantity() + auction.getAuctionedQuantity());
        productRepository.save(product);
        log.info("[Auction Service - Cancel Auction] Restored allocated quantity back into the product storage");

        auction.setStatus(AuctionStatus.CANCELLED);
        AuctionResponse response = AuctionResponse.from(auction);
        auctionRepository.save(auction);
        log.info("[Auction Service - Cancel Auction] Changed the status of the auction to CANCELLED for ID: {}", auctionId);

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        cache.cacheAuctionResponse(auctionId, response);
                        log.info("[Auction Service - Cancel Auction] Transaction committed, synchronized cancelled status to cache for ID: {}", auctionId);
                    }
                }
        );

        return response;
    }

    public AuctionResponse getAuction(Long auctionId) {

        try {
            AuctionResponse cached = cache.getAuctionResponse(auctionId);
            if (cached != null) {
                log.info("[Auction Service - Get Auction] Cache hit for auction #{}", auctionId);
                return cached;
            }
        } catch (Exception e) {
            log.error("[Auction Service - Get Auction] Failed to read cache for auction #{}, error: {}", auctionId, e.getMessage());
        }

        Auction auction = auctionRepository.findByIdWithDetails(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction not found"));

        AuctionResponse response = AuctionResponse.from(auction);
        log.info("[Auction Service - Get Auction] Cache miss, fallback to DB!");
        cache.cacheAuctionResponse(auctionId, response);
        return response;

    }

    public Page<AuctionResponse> getAuctionsBidOnByCurrentUser(Page<Long> idPage, Pageable pageable) {
        if (idPage.isEmpty()) return Page.empty(pageable);

        List<AuctionResponse> responses = auctionRepository.findByIdsWithDetails(idPage.getContent())
                .stream()
                .map(AuctionResponse::from)
                .toList();
                
        return new PageImpl<>(responses, pageable, idPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<AuctionResponse> getDiscoverableAuctions(AuctionFindingRequest request, Pageable pageable) {
        log.info("[Auction Service - Get Discoverable Auctions] Mapping tag enums to string values for native query execution");

        List<String> tagStrings = (request.getTags() != null)
                ? request.getTags().stream().map(Enum::name).toList()
                : List.of();

        boolean hasTags = !tagStrings.isEmpty();
        String statusString = (request.getStatus() != null) ? request.getStatus().name() : null;
        
        Page<Long> idPage = auctionRepository.findAuctionIds(
                request.getProductName(), tagStrings, hasTags,
                request.getStartTime(), request.getEndTime(),
                request.getMinStartingPrice(), statusString, pageable
        );

        List<Long> ids = idPage.getContent();
        if (ids.isEmpty()) return Page.empty(pageable);
        
        List<AuctionResponse> responses = auctionRepository.findByIdsWithDetails(ids)
                .stream()
                .map(AuctionResponse::from)
                .toList();

        return new PageImpl<>(responses, pageable, idPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuctionResponse> getAuctionsBySellerId(Long sellerId, Pageable pageable) {
        Page<Long> idPage = auctionRepository.findIdsBySellerIdOrderByStartTime(sellerId, pageable);
        List<Long> ids = idPage.getContent();
        if (ids.isEmpty()) return Page.empty(pageable);
        
        List<AuctionResponse> responses = auctionRepository.findByIdsWithDetails(ids)
                .stream()
                .map(AuctionResponse::from)
                .toList();

        return new PageImpl<>(responses, pageable, idPage.getTotalElements());
    }

    public List<AuctionResponse> getTop10ActiveAuctions() {
        return auctionRepository.findTopAuctionsByBidCount(AuctionStatus.ACTIVE, PageRequest.of(0, 10))
                .stream()
                .map(AuctionResponse::from)
                .toList();
    }

    private Auction findByIdWithDetails(Long auctionId) {
        return auctionRepository.findByIdWithDetails(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("Auction not found"));
    }

    private Product findProductByIdAndOwnerId(Long productId, Long userId) {
        return productRepository.findByIdAndOwnerUserId(productId, userId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found in your inventory"));
    }

    private Auction mapToEntity(AuctionRequest request, Product product, User seller) {
        BigDecimal startPrice = request.getStartingPrice();

        Auction auction = Auction.builder()
                .seller(seller)
                .product(product)
                .auctionedQuantity(request.getQuantity())
                .startingPrice(startPrice)
                .currentPrice(startPrice)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        auction.recalculateMinBidIncrement();
        return auction;
    }
}
