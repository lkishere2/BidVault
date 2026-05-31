package com.auction.app.domains.auction.bids;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.model.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BidRepository extends JpaRepository<Bid, Long> {

    @Query("SELECT b FROM Bid b JOIN FETCH b.bidder JOIN FETCH b.auction a WHERE a.id = :auctionId ORDER BY b.placedAt DESC")
    List<Bid> findByAuctionIdOrderByPlacedAtDesc(@Param("auctionId") Long auctionId);

    // Find the current HELD bid for an auction (previous highest bidder)
    // Fix #5: return List instead of Optional — there is no DB-level guarantee of uniqueness during concurrent writes,
    // so we must handle the case defensively. The @UniqueConstraint on Bid guards the happy path;
    // this guards against any data that slipped through before the constraint was added.
    List<Bid> findByAuctionIdAndStatus(Long auctionId, BidStatus status);

    // Find bidder's PENDING bid for a specific auction — to update it after dequeue
    Optional<Bid> findByAuctionIdAndBidderIdAndStatus(Long auctionId, Long bidderId, BidStatus status);

    @Query("SELECT DISTINCT b.auction.id FROM Bid b WHERE b.bidder.id = :userId")
    List<Long> findDistinctAuctionIdsByBidderId(@Param("userId") Long userId);

    // Sum all locked funds (PENDING + HELD) to calculate spendable balance
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bid b WHERE b.bidder.id = :userId AND b.status IN :statuses")
    BigDecimal sumLockedAmountByBidderIdAndStatuses(@Param("userId") Long userId, @Param("statuses") List<BidStatus> statuses);
}