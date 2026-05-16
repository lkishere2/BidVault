package com.ltnc.auction.domain.refreshtoken;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ltnc.auction.domain.exceptions.InvalidSessionException;
import com.ltnc.auction.domain.exceptions.RefreshTokenExpiredException;
import com.ltnc.auction.domain.exceptions.RefreshTokenNotFoundException;
import com.ltnc.auction.domain.user.User;
import com.ltnc.auction.infrastructure.security.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService{
    private final JwtService jwtService;
    private final RedisRefreshTokenCacheAdapter refreshTokenCacheAdapter;

    public RefreshToken createRefreshToken(User user, HttpServletRequest request) {
        String existingTokenUuid = refreshTokenCacheAdapter.getActiveTokenIdForUser(user.getUserId());

        if (existingTokenUuid != null) {
            refreshTokenCacheAdapter.deleteRefreshTokenData(existingTokenUuid);
        }

        String newTokenUUID = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .token(newTokenUUID)
                .expiryDate(Instant.now().plus(Duration.ofDays(7)))
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader("User-Agent"))
                .build();

        refreshTokenCacheAdapter.storeRefreshToken(newTokenUUID, refreshToken, Duration.ofDays(7));
        refreshTokenCacheAdapter.mapUserToToken(user.getUserId(), newTokenUUID, Duration.ofDays(7));

        return refreshToken;
    }

    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenCacheAdapter.getRefreshToken(token);

        if (refreshToken == null) {
            throw new RefreshTokenNotFoundException("Refresh token not found");
        }
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new RefreshTokenExpiredException("Refresh token expired");
        }

        return refreshToken;
    }

    public void deleteRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenCacheAdapter.getRefreshToken(token);

        if (refreshToken != null) {
            refreshTokenCacheAdapter.removeUserTokenMapping(Long.valueOf(refreshToken.getId()));
        }

        refreshTokenCacheAdapter.deleteRefreshTokenData(token);
    }

    public void blackListAccessToken(String accessToken) {
        Instant expiration = jwtService.extractExpiration(accessToken);
        long ttl = expiration.toEpochMilli() - System.currentTimeMillis();

        if (ttl > 0) {
            refreshTokenCacheAdapter.blacklistToken(accessToken, Duration.ofMillis(ttl));
        }
    }

    public boolean isAccessTokenBlacklisted(String accessToken) {
        return refreshTokenCacheAdapter.isBlacklisted(accessToken);
    }

    public String getEmailFromToken(String token) {
        RefreshToken refreshToken = refreshTokenCacheAdapter.getRefreshToken(token);

        if (refreshToken == null) {
            throw new InvalidSessionException("Session invalid or expired");
        }

        return refreshToken.getEmail();
    }
}
