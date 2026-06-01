package com.auction.app.domains.users.users;

import com.auction.app.domains.users.exceptions.InvalidPasswordException;
import com.auction.app.domains.users.exceptions.UserUpdateException;
import com.auction.app.domains.users.users.dtos.*;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.infrastructure.security.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils securityUtils;

    @Override
    public UserResponse getCurrentUserInfo() {
        return mapToResponse(securityUtils.getCurrentUser());
    }

    @Override
    public Page<UserResponse> searchUsersByUsername(String username, int page, int size) {
        return userRepository.searchByUsername(username, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void updateUsername(UsernameRequest usernameRequest) {
        userRepository.updateUsername(securityUtils.getCurrentUserId(), usernameRequest.getUsername());
    }

    @Override
    @Transactional
    public void updateEmail(EmailRequest emailRequest) {

        String newEmail = emailRequest.getEmail();
        User user = securityUtils.getCurrentUser();

        // Valid check
        if (newEmail.equals(user.getEmail())) {
            throw new UserUpdateException("Update failed: New email must be different from current email.");
        }
        if (userRepository.existsByEmail(newEmail)) {
            throw new UserUpdateException("Update failed.");
        }

        userRepository.updateEmail(user.getId(), newEmail);
    }

    @Override
    @Transactional
    public void updatePassword(PasswordRequest passwordRequest) {

        User user = securityUtils.getCurrentUser();

        if (!passwordEncoder.matches(passwordRequest.getCurrentPassword(), user.getPassword())) {
            throw new InvalidPasswordException("Update failed: Current password is incorrect.");
        }
        if (passwordRequest.getCurrentPassword().equals(passwordRequest.getNewPassword())) {
            throw new InvalidPasswordException("Update failed: New password must be different from current password.");
        }

        userRepository.updatePassword(user.getId(), passwordEncoder.encode(passwordRequest.getNewPassword()));
    }

    @Override
    @Transactional
    public void updateProfileImage(ProfileImageRequest profileImageRequest) {
        userRepository.updateProfileImageUrl(securityUtils.getCurrentUserId(), profileImageRequest.getProfileImageUrl());
    }

    @Override
    public Page<UserResponse> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size)).map(this :: mapToResponse);
    }

    // Helpers
    private UserResponse mapToResponse(User user){
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getDisplayName())
                .email(user.getEmail())
                .balance(user.getBalance())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .build();
    }
}