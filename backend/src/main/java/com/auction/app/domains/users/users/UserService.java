package com.auction.app.domains.users.users;

import com.auction.app.domains.users.users.dtos.*;
import org.springframework.data.domain.Page;
import java.util.List;

public interface UserService {
    UserResponse getCurrentUserInfo();
    Page<UserResponse> searchUsersByUsername(String username, int page, int size);
    void updateUsername(UsernameRequest usernameRequest);
    void updateEmail(EmailRequest emailRequest);
    void updatePassword(PasswordRequest passwordRequest);
    void updateProfileImage(ProfileImageRequest profileImageRequest);
    Page<UserResponse> getAllUsers(int page, int size);
    List<UserResponse> getTop8Users();
}