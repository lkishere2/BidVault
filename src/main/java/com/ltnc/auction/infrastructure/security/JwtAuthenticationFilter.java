package com.ltnc.auction.infrastructure.security;

import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ltnc.auction.domain.refreshtoken.RefreshTokenService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final RefreshTokenService refreshTokenServiceImpl;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain
    ) throws ServletException, IOException {

        final String jwt;
        final String authHeader = request.getHeader("Authorization");

        // Exit early if no token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the token
        jwt = authHeader.substring(7).trim();

        // Check if the token is blacklisted
        if(refreshTokenServiceImpl.isAccessTokenBlacklisted(jwt)){
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            final String userEmail = jwtService.extractUsername(jwt);
            if (userEmail != null && jwtService.isTokenValid(jwt, userEmail)) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            // We do NOT stop the chain here; we just don't set the Authentication
        }

        // This is the ONLY place doFilter is called if a token was present
        filterChain.doFilter(request, response);
    }
}
