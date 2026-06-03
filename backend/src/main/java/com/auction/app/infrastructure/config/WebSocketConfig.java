package com.auction.app.infrastructure.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import com.auction.app.infrastructure.security.JwtService;
import com.auction.app.infrastructure.security.CustomUserDetailsService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;


@Configuration
@EnableWebSocketMessageBroker
@Slf4j
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String tokenHeader = accessor.getFirstNativeHeader("Authorization");
                    if (tokenHeader == null) {
                        log.info("STOMP CONNECT received no Authorization header from client");
                    } else {
                        String preview = tokenHeader.length() > 20 ? tokenHeader.substring(0, 20) + "..." : tokenHeader;
                        log.info("STOMP CONNECT received Authorization header (preview='{}', startsWithBearer={})",
                                preview, tokenHeader.startsWith("Bearer "));

                        if (tokenHeader.startsWith("Bearer ")) {
                            String jwt = tokenHeader.substring(7);
                            try {
                                String username = jwtService.extractUsername(jwt);
                                if (username != null) {
                                    var userDetails = userDetailsService.loadUserByUsername(username);
                                    if (jwtService.isTokenValid(jwt, userDetails)) {
                                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                                userDetails, null, userDetails.getAuthorities());
                                        accessor.setUser(auth);
                                        log.info("STOMP CONNECT authentication successful for user={}", username);
                                    } else {
                                        log.warn("STOMP CONNECT token invalid for username={}", username);
                                    }
                                }
                            } catch (Exception e) {
                                log.warn("Failed to authenticate STOMP CONNECT token: {}", e.getMessage());
                            }
                        }
                    }
                }
                return message;
            }
        });
    }
    /*
        This method configures how messages are routed between clients and server.
        What it does? Overrides the default broker config to establish custom prefixes
        for incoming and outgoing data.
    */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        /*
            This one configures an in-memory message broker.
            Any destination prefix starts with /topic or /queue should be handled by this broker
            to send data back to clients.
        */
        config.enableSimpleBroker("/topic", "/queue");
        /*

        */
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}

/*
    Conventional:
    /topic is used for Pub/Sub broadcasting while /queue is used for point-to-point private message
*/