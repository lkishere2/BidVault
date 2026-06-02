package com.auction.app.infrastructure.security;

import java.io.IOException;

import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.auction.app.domains.auth.refreshToken.RefreshTokenService;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.Provider;
import com.auction.app.domains.users.users.model.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${callback.url}")
    private String callbackUrl;

    @Override
    public void onAuthenticationSuccess(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        OAuth2User googleUser = (OAuth2User) authentication.getPrincipal();
        String email = googleUser.getAttribute("email");
        String name = googleUser.getAttribute("name");
        String pfp = googleUser.getAttribute("picture");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .username(name)
                            .profileImageUrl(pfp)
                            .provider(Provider.GOOGLE)
                            .enabled(true)
                            .build();
                    return userRepository.save(newUser);
                });
        String accessToken = jwtService.generateToken(user);
        var refreshToken = refreshTokenService.generateRefreshToken(user, request);
        String targetUrl = String.format(
                callbackUrl,
                accessToken,
                refreshToken
        );
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
