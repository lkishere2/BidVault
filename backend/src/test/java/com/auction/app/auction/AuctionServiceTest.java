package com.auction.app.auction;

import com.auction.app.domains.auction.auction.AuctionRepository;
import com.auction.app.domains.auction.auction.AuctionServiceImpl;
import com.auction.app.domains.auction.auction.dtos.AuctionRequest;
import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.redis.AuctionRedisService;
import com.auction.app.domains.auction.auction.validator.AuctionValidatorService;
import com.auction.app.domains.notifications.NotificationService;
import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.infrastructure.security.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuctionServiceTest {

    @Mock
    private AuctionRepository auctionRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private AuctionValidatorService auctionValidatorService;
    @Mock
    private AuctionRedisService cache;
    @Mock
    private NotificationService notificationService;
    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private AuctionServiceImpl auctionService;

    private User seller;
    private Product product;

    @BeforeEach
    void setUp() {
        TransactionSynchronizationManager.initSynchronization();

        seller = User.builder().id(1L).build();
        product = Product.builder().id(100L).quantity(10).owner(seller).build();
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    void createAuction_ShouldDeductStockAndSave() {
        AuctionRequest request = new AuctionRequest();
        request.setProductId(100L);
        request.setQuantity(2);
        request.setStartingPrice(new BigDecimal("100.00"));
        request.setStartTime(Instant.now());
        request.setEndTime(Instant.now().plusSeconds(3600));

        when(securityUtils.getCurrentUser()).thenReturn(seller);
        when(productRepository.findByIdAndOwnerUserId(100L, 1L)).thenReturn(Optional.of(product));

        AuctionResponse response = auctionService.createAuction(request);

        verify(auctionValidatorService).validateTime(request.getStartTime(), request.getEndTime());
        verify(auctionValidatorService).validateQuantity(2, 10);
        
        // Stock reduced
        verify(productRepository).save(argThat(p -> p.getQuantity() == 8));
        verify(auctionRepository).save(any(Auction.class));
        
        assertThat(response).isNotNull();
    }
}
