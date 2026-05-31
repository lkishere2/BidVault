package com.auction.app.domains.users.users;

import com.auction.app.domains.users.users.dtos.*;
import org.springframework.data.domain.Page;

public interface UserService {
    UserResponse getCurrentUserInfo();
    void updateUsername(UsernameRequest usernameRequest);
    void updateEmail(EmailRequest emailRequest);
    void updatePassword(PasswordRequest passwordRequest);
    void updateProfileImage(ProfileImageRequest profileImageRequest);
    Page<UserResponse> getAllUsers(int page, int size);
}