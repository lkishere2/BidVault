package com.auction.app.domains.auction.bids;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BidRepository extends JpaRepository<Bid, Long> {

    @Query("SELECT b FROM Bid b JOIN FETCH b.bidder JOIN FETCH b.auction a WHERE a.id = :auctionId ORDER BY b.placedAt DESC")
    List<Bid> findByAuctionIdOrderByPlacedAtDesc(@Param("auctionId") Long auctionId);

    List<Bid> findByBidderUserIdAndStatus(Long userId, BidStatus status);

    // Used to find the current leader to mark them as REFUNDED
    Optional<Bid> findByAuctionIdAndStatus(Long auctionId, BidStatus status);

    @Query("SELECT DISTINCT b.auction.id FROM Bid b WHERE b.bidder.userId = :userId")
    List<Long> findDistinctAuctionIdsByBidderUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bid b WHERE b.bidder.id = :userId AND b.status = :status")
    BigDecimal sumAmountByBidderIdAndStatus(@Param("userId") Long userId, @Param("status") BidStatus status);
}