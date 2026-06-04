package com.auction.app.auction.validator;

import com.auction.app.domains.auction.auction.model.Auction;
import com.auction.app.domains.auction.auction.validator.AuctionValidatorServiceImpl;
import com.auction.app.domains.users.users.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThatCode;

@ExtendWith(MockitoExtension.class)
public class AuctionValidatorServiceTest {

    @InjectMocks
    private AuctionValidatorServiceImpl auctionValidatorService;

    @Test
    void validateTime_ShouldNotThrowException_WhenValid() {
        Instant start = Instant.now().plusSeconds(60);
        Instant end = Instant.now().plusSeconds(3600);
        
        assertThatCode(() -> auctionValidatorService.validateTime(start, end))
            .doesNotThrowAnyException();
    }

    @Test
    void validateQuantity_ShouldNotThrowException_WhenValid() {
        assertThatCode(() -> auctionValidatorService.validateQuantity(5, 10))
            .doesNotThrowAnyException();
    }
    
    @Test
    void validateUser_ShouldNotThrowException_WhenSameUser() {
        User seller = User.builder().id(1L).build();
        User current = User.builder().id(1L).build();
        
        assertThatCode(() -> auctionValidatorService.validateUser(seller, current))
            .doesNotThrowAnyException();
    }
}
