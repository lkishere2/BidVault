package com.ltnc.auction.domain.auth;

import java.math.BigDecimal;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ltnc.auction.domain.exceptions.UserNotFoundException;
import com.ltnc.auction.domain.refreshtoken.RefreshToken;
import com.ltnc.auction.domain.refreshtoken.RefreshTokenService;
import com.ltnc.auction.domain.user.User;
import com.ltnc.auction.domain.user.UserRepository;
import com.ltnc.auction.infrastructure.security.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public RegisterResponse handleRegistration(RegisterRequest request, HttpServletRequest httpRequest) {
        User user = new User();
            user.setUsername(request.username());
            user.setEmail(request.email());
            user.setPassword(passwordEncoder.encode(request.password()));
            user.setBalance(BigDecimal.ZERO);
            userRepository.save(user);
        return new RegisterResponse(user.getDisplayUsername(), user.getEmail(), user.getBalance());
    }

    @Transactional
    public LoginResponse handleLogin(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        User user = (User) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user, httpRequest);
        return new LoginResponse(user.getEmail(), jwtToken, refreshToken.getToken());
    }

    @Transactional
    public LoginResponse handleRefreshToken(RefreshRequest request, HttpServletRequest httpRequest) {
    RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.refreshToken());
    User user = userRepository.findByEmail(refreshToken.getEmail())
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    String newJwt = jwtService.generateToken(user);
    RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user, httpRequest);
    return new LoginResponse(user.getEmail(), newJwt, newRefreshToken.getToken());
    }

    @Transactional
    public LogoutResponse handleLogout(LogoutRequest request, HttpServletRequest httpRequest) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.refreshToken());
        User user = userRepository.findByEmail(refreshToken.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        refreshTokenService.deleteRefreshToken(request.refreshToken());
        if (request.accessToken() != null) {
            refreshTokenService.blackListAccessToken(request.accessToken());
        }
        return new LogoutResponse(user.getDisplayUsername(), user.getEmail());
    }
}
