package com.auction.app.domains.auth.auth;

import com.auction.app.domains.auth.email.VerifyRequest;
import com.auction.app.domains.users.User;
import com.auction.app.infrastructure.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @PostMapping(path = "/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest registerRequest) {
        User registeredUser = authService.register(registerRequest);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping(path = "/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        User authenticatedUser = authService.login(loginRequest);
        String token = jwtService.generateToken(authenticatedUser);
        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setExpiresIn(jwtService.getExpirationTime());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping(path = "/verify")
    public ResponseEntity<?> verifyUser(@RequestBody VerifyRequest verifyRequest) {
        try {
            authService.verifyUser(verifyRequest);
            return ResponseEntity.ok("Account verified successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(path = "/resend")
    public ResponseEntity<?> resendVerificationCode(@RequestParam String email) {
        try {
            authService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code resent");
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
