package com.auction.app.domains.auction.auction;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    List<Auction> findByStatusAndStartTimeBefore(AuctionStatus status, Instant now);

    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, Instant now);

    @Query("SELECT a FROM Auction a JOIN FETCH a.seller JOIN FETCH a.product WHERE a.id = :id")
    Optional<Auction> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT a FROM Auction a JOIN FETCH a.seller JOIN FETCH a.product WHERE a.status = :status")
    List<Auction> findByStatusWithDetails(@Param("status") AuctionStatus status);

    @Query("SELECT a FROM Auction a JOIN FETCH a.seller JOIN FETCH a.product WHERE a.seller.id = :sellerId")
    List<Auction> findBySellerIdWithDetails(@Param("sellerId") Long sellerId);

    boolean existsByProduct_IdAndStatusIn(Long productId, List<AuctionStatus> statuses);

    // Lightweight — only IDs, no joins, used by BidQueueProcessor
    @Query("SELECT a.id FROM Auction a WHERE a.status = :status")
    List<Long> findIdsByStatus(@Param("status") AuctionStatus status);

    @Query("SELECT a FROM Auction a JOIN FETCH a.seller JOIN FETCH a.product WHERE a.status = :status AND a.startTime < :now")
    List<Auction> findUpcomingToActivate(@Param("status") AuctionStatus status, @Param("now") Instant now);

    @Query("SELECT a FROM Auction a JOIN FETCH a.seller JOIN FETCH a.product WHERE a.status = :status AND a.endTime < :now")
    List<Auction> findActiveToEnd(@Param("status") AuctionStatus status, @Param("now") Instant now);
}