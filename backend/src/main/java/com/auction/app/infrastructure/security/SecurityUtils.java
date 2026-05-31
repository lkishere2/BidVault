package com.auction.app.infrastructure.security;

import com.auction.app.domains.users.users.model.User;
import com.auction.app.domains.users.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {

        Object principal = getPrinciple();

        if (principal instanceof CachedUserDetails cached) {
            return userRepository.findById(cached.getId())
                    .orElseThrow(() -> new BadCredentialsException("No authenticated user found"));
        }

        if (principal instanceof UserDetails details) {
            return userRepository.findByEmail(details.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("No authenticated user found"));
        }

        throw new BadCredentialsException("No authenticated user found");
    }

    public Long getCurrentUserId() {

        Object principal = getPrinciple();

        if (principal instanceof CachedUserDetails cached) {
            return cached.getId();
        }

        if (principal instanceof UserDetails details) {
            return userRepository.findByEmail(details.getUsername())
                    .orElseThrow(() -> new BadCredentialsException("No authenticated user found"))
                    .getId();
        }

        throw new BadCredentialsException("No authenticated user found");
    }

    private Object getPrinciple() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("No authenticated user found");
        }

        return authentication.getPrincipal();
    }
}
