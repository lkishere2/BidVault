package com.auction.app.domains.users.users;

import com.auction.app.domains.users.users.dtos.*;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/info")
    public ResponseEntity<UserResponse> getCurrentUserInformation() {
        return ResponseEntity.ok(userService.getCurrentUserInfo());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> searchUsersByUsername(
            @RequestParam String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.searchUsersByUsername(username, page, size));
    }

    @PatchMapping("/update-username")
    public ResponseEntity<Void> updateUsername(@Valid @RequestBody UsernameRequest userRequest) {
        userService.updateUsername(userRequest);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/update-email")
    public ResponseEntity<Void> updateEmail(@Valid @RequestBody EmailRequest userRequest) {
        userService.updateEmail(userRequest);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/update-password")
    public ResponseEntity<Void> updatePassword(@Valid @RequestBody PasswordRequest userRequest) {
        userService.updatePassword(userRequest);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/update-profile-image")
    public ResponseEntity<Void> updateProfileImage(@Valid @RequestBody ProfileImageRequest profileImageRequest) {
        userService.updateProfileImage(profileImageRequest);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.getAllUsers(page, size));
    }

    @GetMapping("/top")
    public ResponseEntity<List<UserResponse>> getTopUsers() {
        return ResponseEntity.ok(userService.getTop8Users());
    }
}