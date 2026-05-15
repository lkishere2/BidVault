package com.auction.app.domains.users;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getCurrentUserInfo() {
        User currentUser = getCurrentUser();

        UserResponse userResponse = new UserResponse();
        userResponse.setUsername(currentUser.getUsername());
        userResponse.setEmail(currentUser.getEmail());
        userResponse.setBalance(currentUser.getBalance());
        return userResponse;
    }

    @Override
    @Transactional
    public void updateUsername(UsernameRequest usernameRequest) {
        User currentUser = getCurrentUser();
        userRepository.updateUsername(currentUser.getId(), usernameRequest.getUsername());
    }

    @Override
    @Transactional
    public void updateEmail(EmailRequest emailRequest) {
        User currentUser = getCurrentUser();

        String newEmail = emailRequest.getEmail();

        if (newEmail.equals(currentUser.getEmail())) {
            throw new RuntimeException("New email must be different from current email");
        }
        if (userRepository.existsByEmail(newEmail)) {
            throw new RuntimeException("Email is already in use");
        }

        userRepository.updateEmail(currentUser.getId(), newEmail);
    }

    @Override
    @Transactional
    public void updatePassword(PasswordRequest passwordRequest) {
        User currentUser = getCurrentUser();

        if (currentUser.getProvider() == Provider.GOOGLE) {
            throw new RuntimeException("This account uses Google Sign-In and does not have a local password");
        }

        if (!passwordEncoder.matches(passwordRequest.getCurrentPassword(), currentUser.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (passwordRequest.getCurrentPassword().equals(passwordRequest.getNewPassword())) {
            throw new RuntimeException("New password must be different from current password");
        }

        userRepository.updatePassword(currentUser.getId(), passwordEncoder.encode(passwordRequest.getNewPassword()));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}