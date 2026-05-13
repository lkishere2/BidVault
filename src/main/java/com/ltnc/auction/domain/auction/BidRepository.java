package com.ltnc.auction.domain.auction;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuctionIdOrderByPlacedAtDesc(Long auctionId);

    Optional<Bid> findTopByAuctionIdOrderByAmountDesc(Long auctionId);

    List<Bid> findByBidderUserId(Long userId);

    boolean existsByAuctionIdAndBidderUserId(Long auctionId, Long userId);
}