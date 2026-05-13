package com.auction.app.domains.auth;

import com.auction.app.domains.users.User;
import com.auction.app.domains.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public AuthResponse register(RegisterRequest registerRequest) {
        User newUser = new User();

        newUser.setUsername(registerRequest.getUsername());
        newUser.setPassword(registerRequest.getPassword());
        newUser.setEmail(registerRequest.getEmail());

        userRepository.save(newUser);

        AuthResponse authResponse = new AuthResponse();

        authResponse.setUsername(newUser.getUsername());
        authResponse.setEmail(newUser.getEmail());

        return authResponse;
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Optional<User> user = userRepository.findByEmail(loginRequest.getEmail());

        if (user.isEmpty()) {
            throw new RuntimeException("Invalid email");
        }

        if (!user.get().getPassword().equals(loginRequest.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        AuthResponse authResponse = new AuthResponse();
        authResponse.setUsername(user.get().getUsername());
        authResponse.setEmail(user.get().getEmail());
        return authResponse;
    }
}
