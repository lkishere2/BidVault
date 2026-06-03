package com.auction.app.domains.auction.bids;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.model.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BidRepository extends JpaRepository<Bid, Long> {

    @Query("SELECT b FROM Bid b JOIN FETCH b.bidder WHERE b.auction.id = :auctionId AND b.status = 'HELD' ORDER BY b.placedAt DESC")
    Slice<Bid> findByAuctionIdOrderByPlacedAtDesc(@Param("auctionId") Long auctionId, Pageable pageable);

    @Modifying
    @Query("UPDATE Bid b SET b.status = 'REFUNDED' WHERE b.auction.id = :auctionId AND b.status = 'HELD'")
    void refundPreviousHighest(@Param("auctionId") Long auctionId);

    // Find the current HELD bid for an auction (previous highest bidder)
    List<Bid> findByAuctionIdAndStatus(Long auctionId, BidStatus status);

    @Query(value = "SELECT DISTINCT b.auction.id FROM Bid b WHERE b.bidder.id = :userId", countQuery = "SELECT COUNT(DISTINCT b.auction.id) FROM Bid b WHERE b.bidder.id = :userId")
    Page<Long> findDistinctAuctionIdsByBidderId(@Param("userId") Long userId, Pageable pageable);

    // Sum all locked funds (PENDING + HELD) to calculate spendable balance
    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM Bid b WHERE b.bidder.id = :userId AND b.status IN :statuses")
    BigDecimal sumLockedAmountByBidderIdAndStatuses(@Param("userId") Long userId,
            @Param("statuses") List<BidStatus> statuses);

    // Find "dead bids" - bids that are the current highest but not in HELD status
    @Query("SELECT b FROM Bid b WHERE b.auction.id = :auctionId AND b.amount = :currentPrice AND b.status != 'HELD'")
    List<Bid> findDeadBids(@Param("auctionId") Long auctionId, @Param("currentPrice") BigDecimal currentPrice);

    // Delete dead bids in bulk
    @Modifying
    @Query("DELETE FROM Bid b WHERE b.auction.id = :auctionId AND b.amount = :currentPrice AND b.status != 'HELD'")
    int deleteDeadBids(@Param("auctionId") Long auctionId, @Param("currentPrice") BigDecimal currentPrice);
}