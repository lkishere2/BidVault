package com.auction.app.users;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.auction.app.TestReflectionUtils;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.UserServiceImpl;
import com.auction.app.domains.users.users.dtos.PasswordRequest;
import com.auction.app.domains.users.users.dtos.UserResponse;
import com.auction.app.domains.users.users.dtos.UsernameRequest;
import com.auction.app.domains.users.users.model.Role;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.infrastructure.security.TestSecurityUtils;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private TestSecurityUtils securityUtils;

    @InjectMocks
    private UserServiceImpl userService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = createUser(1L, "buyer", "buyer@example.com", "encodedOldPassword", Role.USER);
        currentUser.setBalance(new BigDecimal("150.00"));

        // Configure the mocked SecurityUtils to return the current user and id
        securityUtils = new TestSecurityUtils();
        securityUtils.setCurrentUser(currentUser);

        // Inject into the UserServiceImpl instance which is created via @InjectMocks
        TestReflectionUtils.injectField(userService, "securityUtils", securityUtils);
    }

    @AfterEach
    void tearDown() {
        // reset mock stubs
        // no-op: Mockito will reset between tests automatically when using @ExtendWith(MockitoExtension.class)
    }

    // =========================================================================
    // METHOD 1: getCurrentUserInfo (3 Tests)
    // =========================================================================

    // --- Happy Path (1 Test) ---

    @Test
    void getCurrentUserInfo_WhenAuthenticated_ShouldReturnCurrentUserResponse() {
        UserResponse response = userService.getCurrentUserInfo();

        assertThat(response.getEmail()).isEqualTo("buyer@example.com");
        assertThat(response.getBalance()).isEqualByComparingTo("150.00");
    }


    // =========================================================================
    // METHOD 2: updateUsername (4 Tests)
    // =========================================================================

    // --- Happy Paths (2 Tests) ---

    @Test
    void updateUsername_WhenRequestIsValid_ShouldCallRepositoryUpdate() {
        UsernameRequest request = createUsernameRequest("newBuyer");

        userService.updateUsername(request);

        verify(userRepository).updateUsername(1L, "newBuyer");
    }

    @Test
    void updateUsername_WhenUsernameIsBlank_CurrentServiceStillDelegatesToRepository() {
        UsernameRequest request = createUsernameRequest("");

        userService.updateUsername(request);

        verify(userRepository).updateUsername(1L, "");
    }

    // --- Edge Cases (2 Tests) ---

    @Test
    void updateUsername_WhenRequestIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> userService.updateUsername(null))
                .isInstanceOf(NullPointerException.class);

        verify(userRepository, never()).updateUsername(any(), any());
    }

    @Test
    void updateUsername_WhenUsernameIsNull_CurrentServiceStillDelegatesToRepository() {
        UsernameRequest request = createUsernameRequest(null);

        userService.updateUsername(request);

        verify(userRepository).updateUsername(1L, null);
    }


    // =========================================================================
    // METHOD 4: updatePassword (6 Tests)
    // =========================================================================

    // --- Happy Paths (2 Tests) ---

    @Test
    void updatePassword_WhenRequestIsValid_ShouldEncodeAndPersistNewPassword() {
        PasswordRequest request = createPasswordRequest("oldPassword", "newPassword");
        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        userService.updatePassword(request);

        verify(userRepository).updatePassword(1L, "encodedNewPassword");
    }

    @Test
    void updatePassword_WhenNewPasswordHasBoundaryLength_ShouldEncodeAndPersistNewPassword() {
        PasswordRequest request = createPasswordRequest("oldPassword", "123456");
        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("123456")).thenReturn("encodedBoundaryPassword");

        userService.updatePassword(request);

        verify(userRepository).updatePassword(1L, "encodedBoundaryPassword");
    }

    // --- Edge Cases (4 Tests) ---

    @Test
    void updatePassword_WhenCurrentPasswordIsIncorrect_ShouldThrowException() {
        PasswordRequest request = createPasswordRequest("wrongPassword", "newPassword");
        when(passwordEncoder.matches("wrongPassword", "encodedOldPassword")).thenReturn(false);

    assertThatThrownBy(() -> userService.updatePassword(request))
        .isInstanceOf(RuntimeException.class)
    .hasMessageContaining("Current password is incorrect");

        verify(userRepository, never()).updatePassword(any(), any());
    }

    @Test
    void updatePassword_WhenNewPasswordMatchesCurrentPassword_ShouldThrowException() {
        PasswordRequest request = createPasswordRequest("samePassword", "samePassword");
        when(passwordEncoder.matches("samePassword", "encodedOldPassword")).thenReturn(true);

    assertThatThrownBy(() -> userService.updatePassword(request))
        .isInstanceOf(RuntimeException.class)
    .hasMessageContaining("different from current password");

        verify(userRepository, never()).updatePassword(any(), any());
    }

    @Test
    void updatePassword_WhenRequestIsNull_ShouldThrowException() {
        assertThatThrownBy(() -> userService.updatePassword(null))
                .isInstanceOf(NullPointerException.class);

        verify(userRepository, never()).updatePassword(any(), any());
    }

    @Test
    void updatePassword_WhenNewPasswordIsNull_CurrentServiceStillEncodesNullValue() {
        PasswordRequest request = createPasswordRequest("oldPassword", null);
        when(passwordEncoder.matches("oldPassword", "encodedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode(null)).thenReturn("encodedNullPassword");

        userService.updatePassword(request);

        verify(userRepository).updatePassword(1L, "encodedNullPassword");
    }

    // =========================================================================
    // METHOD 5: getAllUsers (4 Tests)
    // =========================================================================

    // --- Happy Paths (2 Tests) ---

    @Test
    void getAllUsers_WhenUsersExist_ShouldReturnMappedPage() {
        when(userRepository.findAll(PageRequest.of(0, 10)))
                .thenReturn(new PageImpl<>(List.of(currentUser)));

        Page<UserResponse> response = userService.getAllUsers(0, 10);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getEmail()).isEqualTo("buyer@example.com");
    }

    @Test
    void getAllUsers_WhenBoundaryPageSizeOne_ShouldReturnSingleItemPage() {
        when(userRepository.findAll(PageRequest.of(0, 1)))
                .thenReturn(new PageImpl<>(List.of(currentUser)));

        Page<UserResponse> response = userService.getAllUsers(0, 1);

        assertThat(response.getContent()).hasSize(1);
    }

    // --- Edge Cases (2 Tests) ---

    @Test
    void getAllUsers_WhenPageIsNegative_ShouldThrowException() {
        assertThatThrownBy(() -> userService.getAllUsers(-1, 10))
                .isInstanceOf(IllegalArgumentException.class);

        verify(userRepository, never()).findAll(any(PageRequest.class));
    }

    @Test
    void getAllUsers_WhenSizeIsZero_ShouldThrowException() {
        assertThatThrownBy(() -> userService.getAllUsers(0, 0))
                .isInstanceOf(IllegalArgumentException.class);

        verify(userRepository, never()).findAll(any(PageRequest.class));
    }

    // =========================================================================
    // METHOD 6: disableUser (4 Tests)
    // =========================================================================

    // --- Happy Path (1 Test) ---

    private User createUser(Long id, String username, String email, String password, Role role) {
        return User.builder()
                .id(id)
                .username(username)
                .email(email)
                .password(password)
                .role(role)
                .enabled(true)
                .build();
    }

    private UsernameRequest createUsernameRequest(String username) {
        UsernameRequest request = new UsernameRequest();
        request.setUsername(username);
        return request;
    }

    private PasswordRequest createPasswordRequest(String verificationCode, String newPassword) {
        PasswordRequest request = new PasswordRequest();
        request.setVerificationCode(verificationCode);
        request.setNewPassword(newPassword);
        return request;
    }
}
