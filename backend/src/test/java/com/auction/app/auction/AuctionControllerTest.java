package com.auction.app.auction;

import com.auction.app.domains.auction.auction.AuctionController;
import com.auction.app.domains.auction.auction.AuctionService;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.infrastructure.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.test.context.ContextConfiguration;
import com.auction.app.AuctionApplication;

@WebMvcTest(AuctionController.class)
@ContextConfiguration(classes = {AuctionApplication.class, AuctionController.class})
@AutoConfigureMockMvc(addFilters = false)
public class AuctionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuctionService auctionService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService;

    @Test
    @WithMockUser
    void getMyAuctions_ShouldReturnPageOfAuctions() throws Exception {
        when(auctionService.getMyAuctions(any())).thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/v1/auctions/me"))
                .andExpect(status().isOk());
    }
}
