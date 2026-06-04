package com.auction.app.connection;

import java.util.Map;
import java.util.function.Function;

import io.jsonwebtoken.Claims;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetails;

import com.auction.app.TestApplication;
import com.auction.app.infrastructure.config.WebSocketConfig;
import com.auction.app.infrastructure.security.CustomUserDetailsService;
import com.auction.app.infrastructure.security.JwtService;

@SpringBootTest(classes = TestApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import({WebSocketConfig.class, WebSocketConnectionTest.TestWebSocketBeans.class})
public class WebSocketConnectionTest {

    @LocalServerPort
    private int port;

    @Autowired
    private WebSocketConfig webSocketConfig;

    @TestConfiguration
    static class TestWebSocketBeans {
        @Bean
        JwtService jwtService() {
            return new JwtService() {
                @Override public String extractUsername(String token) { return null; }
                @Override public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) { return null; }
                @Override public String generateToken(UserDetails userDetails) { return null; }
                @Override public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) { return null; }
                @Override public long getExpirationTime() { return 0; }
                @Override public boolean isTokenValid(String token, UserDetails userDetails) { return false; }
                @Override public String extractJti(String token) { return null; }
                @Override public long getRemainingTtlMillis(String token) { return 0; }
                @Override public void invalidateToken(String token) {}
            };
        }

        @Bean
        CustomUserDetailsService customUserDetailsService() {
            return new CustomUserDetailsService(null, null);
        }
    }

    @Test
    void webSocketInfrastructureLoads() {
        assertNotNull(webSocketConfig);
        assertTrue(port > 0);
    }
}
