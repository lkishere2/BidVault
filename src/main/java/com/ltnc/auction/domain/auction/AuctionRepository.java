package com.ltnc.auction.domain.auction;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByStatusAndStartTimeBefore(AuctionStatus status, Instant now);

    List<Auction> findByStatusAndEndTimeBefore(AuctionStatus status, Instant now);

    List<Auction> findBySellerUserId(Long sellerId);

    List<Auction> findByStatus(AuctionStatus status);
    
    @Query("SELECT a FROM Auction a JOIN FETCH a.seller JOIN FETCH a.item WHERE a.id = :id")
    Optional<Auction> findByIdWithDetails(@Param("id") Long id);
}