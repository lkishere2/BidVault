package com.auction.app.domains.auction.bids.model;

import java.math.BigDecimal;
import java.time.Instant;

import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.users.users.model.User;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "bids",
        // Fix #7: enforce at the DB level that only one HELD bid can exist per auction at a time
        uniqueConstraints = @UniqueConstraint(name = "uq_auction_held_bid", columnNames = {"auction_id", "status"})
)
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bidder_id", nullable = false)
    private User bidder;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BidStatus status = BidStatus.PENDING;

    @Column(nullable = false)
    // Fix #12: set placedAt at persist time, not at object construction time
    private Instant placedAt;

    @PrePersist
    private void prePersist() {
        if (placedAt == null) {
            placedAt = Instant.now();
        }
    }
}