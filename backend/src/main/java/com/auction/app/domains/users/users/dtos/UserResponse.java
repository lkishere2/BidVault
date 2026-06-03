package com.auction.app.domains.users.users.dtos;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private BigDecimal balance;
    private String profileImageUrl;
    private String role;
    private Integer followersCount;
    private Integer followingCount;
}