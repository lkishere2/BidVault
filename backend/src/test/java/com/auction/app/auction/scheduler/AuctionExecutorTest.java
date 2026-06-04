package com.auction.app.auction.scheduler;

import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.auction.redis.AuctionRedisService;
import com.auction.app.domains.auction.auction.scheduler.AuctionExecutor;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.model.BidStatus;
import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuctionExecutorTest {

    @Mock
    private AuctionRepository auctionRepository;
    @Mock
    private BidRepository bidRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuctionRedisService cache;
    @Mock
    private AuctionPublisher publisher;

    @InjectMocks
    private AuctionExecutor auctionExecutor;

    private Auction auction;
    private User seller;
    private Product product;

    @BeforeEach
    void setUp() {
        TransactionSynchronizationManager.initSynchronization();

        seller = User.builder()
                .id(1L)
                .balance(new BigDecimal("100.00"))
                .build();

        product = Product.builder()
                .id(100L)
                .quantity(5)
                .owner(seller)
                .build();

        auction = Auction.builder()
                .id(10L)
                .seller(seller)
                .product(product)
                .auctionedQuantity(2)
                .currentPrice(new BigDecimal("50.00"))
                .status(AuctionStatus.ACTIVE)
                .bidCount(0)
                .build();
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    void processEndedAuctionById_WithNoBids_ShouldReturnItemToSeller() {
        // Arrange
        when(auctionRepository.findByIdWithDetails(auction.getId())).thenReturn(Optional.of(auction));
        when(cache.getAuctionResponse(auction.getId())).thenReturn(null);
        when(bidRepository.findByAuctionIdAndStatus(auction.getId(), BidStatus.HELD)).thenReturn(Collections.emptyList());

        // Act
        auctionExecutor.processEndedAuctionById(auction.getId());

        // Assert
        // Verify product quantity is restored to seller (5 + 2 = 7)
        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        assertThat(productCaptor.getValue().getQuantity()).isEqualTo(7);

        // Verify auction status is ended
        ArgumentCaptor<Auction> auctionCaptor = ArgumentCaptor.forClass(Auction.class);
        verify(auctionRepository).save(auctionCaptor.capture());
        assertThat(auctionCaptor.getValue().getStatus()).isEqualTo(AuctionStatus.ENDED);
    }

    @Test
    void processEndedAuctionById_WithWinner_ShouldTransferItemAndFunds() {
        // Arrange
        User winner = User.builder()
                .id(2L)
                .balance(new BigDecimal("200.00"))
                .build();

        Bid winningBid = Bid.builder()
                .id(1L)
                .bidder(winner)
                .amount(new BigDecimal("60.00"))
                .status(BidStatus.HELD)
                .build();

        when(auctionRepository.findByIdWithDetails(auction.getId())).thenReturn(Optional.of(auction));
        
        AuctionResponse cachedResponse = AuctionResponse.from(auction);
        cachedResponse.setCurrentPrice(new BigDecimal("60.00"));
        cachedResponse.setBidCount(1);
        when(cache.getAuctionResponse(auction.getId())).thenReturn(cachedResponse);
        
        when(bidRepository.findByAuctionIdAndStatus(auction.getId(), BidStatus.HELD)).thenReturn(List.of(winningBid));

        // Mock product not found for winner, so a new one is created
        when(productRepository.findByIdAndOwnerUserId(product.getId(), winner.getId())).thenReturn(Optional.empty());

        // Act
        auctionExecutor.processEndedAuctionById(auction.getId());

        // Assert
        // 1. Verify seller receives money: 100 + 60 = 160
        assertThat(seller.getBalance()).isEqualByComparingTo("160.00");
        
        // 2. Verify winner loses money: 200 - 60 = 140
        assertThat(winner.getBalance()).isEqualByComparingTo("140.00");
        
        verify(userRepository, times(2)).save(any(User.class));

        // 3. Verify winner receives the item (quantity 2)
        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        
        Product savedWinnerProduct = productCaptor.getValue();
        assertThat(savedWinnerProduct.getOwner().getId()).isEqualTo(winner.getId());
        assertThat(savedWinnerProduct.getQuantity()).isEqualTo(2);

        // 4. Verify bid status is WON
        ArgumentCaptor<Bid> bidCaptor = ArgumentCaptor.forClass(Bid.class);
        verify(bidRepository).save(bidCaptor.capture());
        assertThat(bidCaptor.getValue().getStatus()).isEqualTo(BidStatus.WON);

        // 5. Verify auction status is ENDED and winner is set
        ArgumentCaptor<Auction> auctionCaptor = ArgumentCaptor.forClass(Auction.class);
        verify(auctionRepository).save(auctionCaptor.capture());
        assertThat(auctionCaptor.getValue().getStatus()).isEqualTo(AuctionStatus.ENDED);
        assertThat(auctionCaptor.getValue().getWinner().getId()).isEqualTo(winner.getId());
        assertThat(auctionCaptor.getValue().getCurrentPrice()).isEqualByComparingTo("60.00");
        assertThat(auctionCaptor.getValue().getBidCount()).isEqualTo(1);
    }
}
