//package com.auction.app.connection;
//
//import com.auction.app.domains.auction.bids.dtos.BidRequest;
//import com.auction.app.domains.users.users.User;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.web.server.LocalServerPort;
//import org.springframework.messaging.converter.MappingJackson2MessageConverter;
//import org.springframework.messaging.simp.stomp.*;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.socket.client.standard.StandardWebSocketClient;
//import org.springframework.web.socket.messaging.WebSocketStompClient;
//
//import java.lang.reflect.Type;
//import java.math.BigDecimal;
//import java.util.List;
//import java.util.concurrent.CompletableFuture;
//import java.util.concurrent.TimeUnit;
//
//import static org.assertj.core.api.Assertions.assertThat;
//
//@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
//public class WebSocketConnectionTest {
//
//    @LocalServerPort
//    private int port;
//
//    private WebSocketStompClient stompClient;
//    private User mockUser;
//
//    @BeforeEach
//    void setup() {
//        stompClient = new WebSocketStompClient(new StandardWebSocketClient());
//        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
//
//        // Build a mock user and inject into SecurityContextHolder
//        mockUser = User.builder()
//                .id(1L)
//                .username("testuser")
//                .email("test@example.com")
//                .password("password")
//                .balance(BigDecimal.valueOf(10000))
//                .enabled(true)
//                .build();
//
//        UsernamePasswordAuthenticationToken auth =
//                new UsernamePasswordAuthenticationToken(mockUser, null, List.of());
//        SecurityContextHolder.getContext().setAuthentication(auth);
//    }
//
//    @Test
//    void shouldConnectToWebSocket() throws Exception {
//        CompletableFuture<Boolean> connected = new CompletableFuture<>();
//
//        stompClient.connectAsync(
//                "ws://localhost:" + port + "/ws",
//                new StompSessionHandlerAdapter() {
//                    @Override
//                    public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
//                        connected.complete(true);
//                    }
//
//                    @Override
//                    public void handleTransportError(StompSession session, Throwable exception) {
//                        connected.completeExceptionally(exception);
//                    }
//                });
//
//        assertThat(connected.get(5, TimeUnit.SECONDS)).isTrue();
//    }
//
//    @Test
//    void shouldSubscribeAndReceiveBidNotification() throws Exception {
//        CompletableFuture<Boolean> connected = new CompletableFuture<>();
//        CompletableFuture<Object> received = new CompletableFuture<>();
//
//        Long auctionId = 4L;
//
//        stompClient.connectAsync(
//                "ws://localhost:" + port + "/ws",
//                new StompSessionHandlerAdapter() {
//                    @Override
//                    public void afterConnected(StompSession session, StompHeaders connectedHeaders) {
//                        connected.complete(true);
//
//                        // Subscribe first
//                        session.subscribe("/topic/auction/" + auctionId + "/bid",
//                                new StompFrameHandler() {
//                                    @Override
//                                    public Type getPayloadType(StompHeaders headers) {
//                                        return Object.class;
//                                    }
//
//                                    @Override
//                                    public void handleFrame(StompHeaders headers, Object payload) {
//                                        received.complete(payload);
//                                    }
//                                });
//
//                        // Then send bid
//                        BidRequest bid = BidRequest.builder()
//                                .amount(BigDecimal.valueOf(150.50))
//                                .build();
//                        session.send("/app/auction/" + auctionId + "/bid", bid);
//                    }
//
//                    @Override
//                    public void handleTransportError(StompSession session, Throwable exception) {
//                        connected.completeExceptionally(exception);
//                        received.completeExceptionally(exception);
//                    }
//
//                    @Override
//                    public void handleException(StompSession session, StompCommand command,
//                                                StompHeaders headers, byte[] payload, Throwable exception) {
//                        received.completeExceptionally(exception);
//                    }
//                });
//
//        assertThat(connected.get(5, TimeUnit.SECONDS)).isTrue();
//        System.out.println("STOMP connected");
//
//        Object payload = received.get(5, TimeUnit.SECONDS);
//        assertThat(payload).isNotNull();
//        System.out.println("Received bid notification: " + payload);
//    }
//}