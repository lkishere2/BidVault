package com.auction.app.bids;

import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.model.AuctionStatus;
import com.auction.app.domains.auction.auction.notification.AuctionPublisher;
import com.auction.app.domains.auction.auction.redis.AuctionRedisService;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.BidServiceImpl;
import com.auction.app.domains.auction.bids.dtos.BidRequest;
import com.auction.app.domains.auction.bids.model.Bid;
import com.auction.app.domains.auction.bids.validator.BidValidatorService;
import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.infrastructure.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BidServiceTest {

    @Mock
    private AuctionRepository auctionRepository;
    @Mock
    private BidRepository bidRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuctionRedisService cache;
    @Mock
    private AuctionPublisher publisher;
    @Mock
    private SecurityUtils securityUtils;
    @Mock
    private BidValidatorService bidValidatorService;
    @Mock
    private BidServiceImpl self; // self-injected for async calls

    @InjectMocks
    private BidServiceImpl bidService;

    private User bidder;
    private Auction auction;
    private AuctionResponse auctionResponse;

    @BeforeEach
    void setUp() {
        bidder = User.builder().id(2L).balance(new BigDecimal("100.00")).username("bidder").build();

        auction = Auction.builder()
                .id(1L)
                .seller(User.builder().id(1L).build())
                .product(Product.builder().id(100L).build())
                .status(AuctionStatus.ACTIVE)
                .build();

        auctionResponse = AuctionResponse.from(auction);
    }

    @Test
    void placeBid_ShouldQueueBidAndCallProcessNext() {
        BidRequest request = new BidRequest();
        request.setAmount(new BigDecimal("50.00"));

        when(auctionRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(auction));
        when(cache.getAuctionResponse(1L)).thenReturn(auctionResponse);

        // Act
        bidService.placeBid(1L, request, bidder);

        // Assert
        verify(bidValidatorService).validateUser(2L, 1L);
        verify(bidValidatorService).validateBidAmount(request.getAmount(), auctionResponse);
        verify(bidValidatorService).validateSpendableBalance(bidder, request.getAmount());
        
        verify(bidRepository).save(any(Bid.class));
        verify(cache).enqueueBid(eq(1L), any());
        verify(self).processNextBid(1L);
    }
}
