package com.auction.app.bids;

import com.auction.app.TestApplication;
import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.model.BidStatus;
import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.test.context.ContextConfiguration;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@ContextConfiguration(classes = TestApplication.class)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
public class BidRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private User seller;
    private User bidder;
    private Auction auction;
    private Product product;
    private Bid bid1;
    private Bid bid2;

    @BeforeEach
    void setUp() {
        seller = userRepository.save(User.builder().email("seller@test.com").password("pass").username("seller").build());
        bidder = userRepository.save(User.builder().email("bidder@test.com").password("pass").username("bidder").build());
        
        product = productRepository.save(Product.builder().productName("Product").description("Desc").owner(seller).quantity(10).build());

        auction = auctionRepository.save(Auction.builder()
                .seller(seller)
                .product(product)
                .auctionedQuantity(1)
                .startingPrice(new BigDecimal("10.00"))
                .currentPrice(new BigDecimal("10.00"))
                .minBidIncrement(new BigDecimal("1.00"))
                .startTime(Instant.now())
                .endTime(Instant.now().plusSeconds(3600))
                .status(AuctionStatus.ACTIVE)
                .build());

        bid1 = bidRepository.save(Bid.builder().auction(auction).bidder(bidder).amount(new BigDecimal("15.00")).status(BidStatus.REFUNDED).placedAt(Instant.now().minusSeconds(10)).build());
        bid2 = bidRepository.save(Bid.builder().auction(auction).bidder(bidder).amount(new BigDecimal("20.00")).status(BidStatus.HELD).placedAt(Instant.now()).build());
    }

    @Test
    void findByAuctionIdOrderByPlacedAtDesc_ShouldReturnBidsInOrder() {
        Slice<Bid> bids = bidRepository.findByAuctionIdOrderByPlacedAtDesc(auction.getId(), PageRequest.of(0, 10));
        assertThat(bids.getContent()).hasSize(2);
        assertThat(bids.getContent().get(0).getId()).isEqualTo(bid2.getId()); // bid2 was placed later
        assertThat(bids.getContent().get(1).getId()).isEqualTo(bid1.getId());
    }

    @Test
    void refundPreviousHighest_ShouldSetHeldBidToRefunded() {
        bidRepository.refundPreviousHighest(auction.getId());
        entityManager.clear();
        
        Bid updatedBid2 = bidRepository.findById(bid2.getId()).orElseThrow();
        assertThat(updatedBid2.getStatus()).isEqualTo(BidStatus.REFUNDED);
    }

    @Test
    void findByAuctionIdAndStatus_ShouldReturnHeldBids() {
        List<Bid> heldBids = bidRepository.findByAuctionIdAndStatus(auction.getId(), BidStatus.HELD);
        assertThat(heldBids).hasSize(1);
        assertThat(heldBids.get(0).getId()).isEqualTo(bid2.getId());
    }

    @Test
    void findDistinctAuctionIdsByBidderId_ShouldReturnDistinctIds() {
        Page<Long> auctionIds = bidRepository.findDistinctAuctionIdsByBidderId(bidder.getId(), PageRequest.of(0, 10));
        assertThat(auctionIds.getContent()).hasSize(1);
        assertThat(auctionIds.getContent().get(0)).isEqualTo(auction.getId());
    }

    @Test
    void sumLockedAmountByBidderIdAndStatuses_ShouldSumHeldAndPending() {
        BigDecimal sum = bidRepository.sumLockedAmountByBidderIdAndStatuses(bidder.getId(), List.of(BidStatus.HELD, BidStatus.PENDING));
        assertThat(sum).isEqualByComparingTo("20.00");
    }
}
