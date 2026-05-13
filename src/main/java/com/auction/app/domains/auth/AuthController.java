package com.auction.app.domains.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping(path = "/api/register")
    public AuthResponse register(RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }

    @PostMapping(path = "/api/login")
    public AuthResponse login(LoginRequest loginRequest) {
        return authService.login(loginRequest);
    }
}
