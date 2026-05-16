package com.ltnc.auction.domain.refreshtoken;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisRefreshTokenCacheAdapter{
    private final RedisTemplate<String, Object> redisTemplate;
    
    @Value("${redis.prefix:rt:}")
    private String redisPrefix;

    @Value("${redis.user-prefix:user_rt:}")
    private String userRtPrefix;

    @Value("${redis.blacklist-prefix:bl:}")
    private String blacklistPrefix;

    public RedisRefreshTokenCacheAdapter(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String getActiveTokenIdForUser(Long UserId) {
        Object existingUuidObj = redisTemplate.opsForValue().get(userRtPrefix + UserId);
        return existingUuidObj != null ? existingUuidObj.toString() : null;
    }

    public void deleteRefreshTokenData(String tokenId) {
        redisTemplate.delete(redisPrefix + tokenId);
    }

    public void storeRefreshToken(String tokenId, RefreshToken refreshToken, Duration ttl) {
        redisTemplate.opsForValue().set(redisPrefix + tokenId, refreshToken, ttl);
    }

    public void mapUserToToken(Long UserId, String tokenId, Duration ttl) {
        redisTemplate.opsForValue().set(userRtPrefix + UserId, tokenId, ttl);
    }

    public RefreshToken getRefreshToken(String tokenId) {
        return (RefreshToken) redisTemplate.opsForValue().get(redisPrefix + tokenId);
    }

    public void removeUserTokenMapping(Long UserId) {
        redisTemplate.delete(userRtPrefix + UserId);
    }

    public void blacklistToken(String accessToken, Duration ttl) {
        redisTemplate.opsForValue().set(blacklistPrefix + accessToken, "logout", ttl);
    }

    public boolean isBlacklisted(String accessToken) {
        return redisTemplate.hasKey(blacklistPrefix + accessToken);
    }
}
