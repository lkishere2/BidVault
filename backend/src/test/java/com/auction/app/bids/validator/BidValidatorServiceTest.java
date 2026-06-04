package com.auction.app.bids.validator;

import com.auction.app.domains.auction.auction.dtos.AuctionResponse;
import com.auction.app.domains.auction.bids.BidRepository;
import com.auction.app.domains.auction.bids.validator.BidValidatorServiceImpl;
import com.auction.app.domains.users.users.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BidValidatorServiceTest {

    @Mock
    private BidRepository bidRepository;

    @InjectMocks
    private BidValidatorServiceImpl bidValidatorService;

    @Test
    void validateUser_ShouldNotThrowException_WhenBidderIsNotSeller() {
        assertThatCode(() -> bidValidatorService.validateUser(2L, 1L))
            .doesNotThrowAnyException();
    }

    @Test
    void validateBidAmount_ShouldNotThrowException_WhenAmountIsSufficient() {
        AuctionResponse response = new AuctionResponse();
        response.setCurrentPrice(new BigDecimal("100.00"));
        response.setMinBidIncrement(new BigDecimal("5.00"));
        
        assertThatCode(() -> bidValidatorService.validateBidAmount(new BigDecimal("110.00"), response))
            .doesNotThrowAnyException();
    }
    
    @Test
    void isBidEligible_ShouldReturnTrue_WhenAmountIsSufficient() {
        AuctionResponse response = new AuctionResponse();
        response.setStatus(com.auction.app.domains.auction.auction.model.AuctionStatus.ACTIVE);
        response.setCurrentPrice(new BigDecimal("100.00"));
        response.setMinBidIncrement(new BigDecimal("5.00"));
        
        boolean eligible = bidValidatorService.isBidEligible(response, new BigDecimal("106.00"));
        assertThat(eligible).isTrue();
    }
}
