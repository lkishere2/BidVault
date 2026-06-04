package com.auction.app.infrastructure.security;

import com.auction.app.domains.users.users.model.User;

/**
 * Simple test helper to avoid mocking the production SecurityUtils class which
 * Mockito may fail to mock in this JVM. Tests can create an instance and set
 * the current user/id to simulate authentication.
 */
public class TestSecurityUtils extends SecurityUtils {

    private User currentUser;

    public TestSecurityUtils() {
        super(null); // we override behavior, so no UserRepository is required
    }

    public void setCurrentUser(User user) {
        this.currentUser = user;
    }

    @Override
    public User getCurrentUser() {
        if (currentUser == null) {
            throw new RuntimeException("No test current user set");
        }
        return currentUser;
    }

    @Override
    public Long getCurrentUserId() {
        if (currentUser == null) {
            throw new RuntimeException("No test current user set");
        }
        return currentUser.getId();
    }
}
