package com.auction.app.domains.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String username;
    private String email;
}
