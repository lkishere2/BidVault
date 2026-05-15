package com.auction.app.domains.users;

public interface UserService {
    UserResponse getCurrentUserInfo();
    void updateUsername(UsernameRequest usernameRequest);
    void updateEmail(EmailRequest emailRequest);
    void updatePassword(PasswordRequest passwordRequest);
}
