package com.ltnc.auction.domain.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ltnc.auction.domain.user.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody @Valid RegisterRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.handleRegistration(request, httpRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.handleLogin(request, httpRequest));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody @Valid RefreshRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.handleRefreshToken(request, httpRequest));
    }

    @GetMapping("/profile")
    public ResponseEntity<RegisterResponse> profile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new RegisterResponse(
                user.getDisplayUsername(),
                user.getEmail(),
                user.getBalance()));
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(@RequestBody @Valid LogoutRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.handleLogout(request, httpRequest));
    }
}
