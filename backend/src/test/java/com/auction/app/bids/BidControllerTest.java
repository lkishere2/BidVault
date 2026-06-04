package com.auction.app.bids;

import com.auction.app.domains.auction.auction.AuctionService;
import com.auction.app.domains.auction.bids.BidController;
import com.auction.app.domains.auction.bids.BidService;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.infrastructure.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.SliceImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.ContextConfiguration;
import com.auction.app.AuctionApplication;

@WebMvcTest(BidController.class)
@ContextConfiguration(classes = {AuctionApplication.class, BidController.class})
@AutoConfigureMockMvc(addFilters = false)
public class BidControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BidService bidService;

    @MockBean
    private AuctionService auctionService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService;

    @Test
    @WithMockUser
    void getBidHistory_ShouldReturnSliceOfBids() throws Exception {
        when(bidService.getBidHistory(eq(1L), any())).thenReturn(new SliceImpl<>(List.of()));

        mockMvc.perform(get("/api/v1/auctions/1/bids"))
                .andExpect(status().isOk());
    }
}
