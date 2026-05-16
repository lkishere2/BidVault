package com.ltnc.auction.domain.refreshtoken;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken{
    private Long id;
    private String email;
    private String token;
    private Instant expiryDate;
    private String ipAddress;
    private String userAgent;
}
