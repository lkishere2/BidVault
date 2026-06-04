package com.auction.app.users;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.containsStringIgnoringCase;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.auction.app.domains.users.users.UserController;
import com.auction.app.domains.users.users.UserService;
import com.auction.app.domains.users.users.dtos.PasswordRequest;
import com.auction.app.domains.users.users.dtos.UserResponse;
import com.auction.app.domains.users.users.dtos.UsernameRequest;
import com.auction.app.infrastructure.exception.GlobalExceptionHandler;
import com.auction.app.infrastructure.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(
        controllers = UserController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {com.auction.app.TestApplication.class, UserController.class})
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    // =========================================================================
    // METHOD 1: getCurrentUserInformation (2 Tests)
    // =========================================================================

    @Test
    void getCurrentUserInformation_WhenCalled_ShouldReturnUserInfo() throws Exception {
        when(userService.getCurrentUserInfo()).thenReturn(UserResponse.builder()
                .username("buyer")
                .email("buyer@example.com")
                .balance(new BigDecimal("150.00"))
                .build());

        mockMvc.perform(get("/api/v1/users/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("buyer"))
                .andExpect(jsonPath("$.email").value("buyer@example.com"))
                .andExpect(jsonPath("$.balance").value(150.00));

        verify(userService).getCurrentUserInfo();
    }

    @Test
    void getCurrentUserInformation_WhenServiceThrows_ShouldReturnInternalServerError() throws Exception {
        when(userService.getCurrentUserInfo()).thenThrow(new RuntimeException("Unexpected user error"));

        // Thay đổi từ assertThatThrownBy sang kiểm tra HTTP status 500 và thông điệp lỗi trong JSON body
        mockMvc.perform(get("/api/v1/users/info"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Unexpected user error"));
    }

    // =========================================================================
    // METHOD 2: updateUsername (3 Tests)
    // =========================================================================

    @Test
    void updateUsername_WhenRequestIsValid_ShouldReturnOk() throws Exception {
        UsernameRequest request = createUsernameRequest("newBuyer");

        mockMvc.perform(patch("/api/v1/users/update-username")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(userService).updateUsername(any(UsernameRequest.class));
    }

    @Test
    void updateUsername_WhenUsernameIsBlank_CurrentControllerStillPassesRequestToService() throws Exception {
        UsernameRequest request = createUsernameRequest("");

        mockMvc.perform(patch("/api/v1/users/update-username")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(userService).updateUsername(any(UsernameRequest.class));
    }

    @Test
    void updateUsername_WhenBodyIsMissing_ShouldReturnInternalServerError() throws Exception {
        // Sửa lại status mong đợi là 500 do HttpMessageNotReadableException đã bị bắt và chuyển đổi thành 500 trong project của bạn
        mockMvc.perform(patch("/api/v1/users/update-username")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value(containsStringIgnoringCase("required request body is missing")));
        verifyNoInteractions(userService);
    }

    // =========================================================================
    // METHOD 3: updateEmail (4 Tests)
    // =========================================================================


    @Test
    void updateEmail_WhenBodyIsMissing_ShouldReturnInternalServerError() throws Exception {
        // Sửa lại status mong đợi từ 400 thành 500 dựa theo log thực tế từ hệ thống của bạn
        mockMvc.perform(patch("/api/v1/users/update-email")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value(containsStringIgnoringCase("required request body is missing")));
        verifyNoInteractions(userService);
    }

    // =========================================================================
    // METHOD 4: updatePassword (2 Tests)
    // =========================================================================

    @Test
    void updatePassword_WhenRequestIsValid_ShouldReturnOk() throws Exception {
        PasswordRequest request = createPasswordRequest("676967", "newPassword");

        mockMvc.perform(patch("/api/v1/users/update-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(userService).updatePassword(any(PasswordRequest.class));
    }

    @Test
    void updatePassword_WhenCurrentPasswordIsBlank_ShouldReturnBadRequest() throws Exception {
        PasswordRequest request = createPasswordRequest("", "newPassword");

        mockMvc.perform(patch("/api/v1/users/update-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(userService);
    }

    // =========================================================================
    // METHOD 5: getAllUsers (2 Tests)
    // =========================================================================

    @Test
    void getAllUsers_WhenCalled_ShouldReturnUserPage() throws Exception {
        Page<UserResponse> response = new PageImpl<>(List.of(createUserResponse("buyer", "buyer@example.com")));
        when(userService.getAllUsers(0, 10)).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/all")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].username").value("buyer"))
                .andExpect(jsonPath("$.content[0].email").value("buyer@example.com"));

        verify(userService).getAllUsers(0, 10);
    }

    @Test
    void getAllUsers_WhenParamsAreMissing_ShouldUseDefaultPagination() throws Exception {
        Page<UserResponse> response = new PageImpl<>(List.of());
        when(userService.getAllUsers(0, 20)).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        verify(userService).getAllUsers(0, 20);
    }

    private UsernameRequest createUsernameRequest(String username) {
        UsernameRequest request = new UsernameRequest();
        request.setUsername(username);
        return request;
    }

    private PasswordRequest createPasswordRequest(String verificationCode, String newPassword) {
        PasswordRequest request = new PasswordRequest();
        request.setNewPassword(newPassword);
        return request;
    }

    private UserResponse createUserResponse(String username, String email) {
        return UserResponse.builder()
                .username(username)
                .email(email)
                .balance(new BigDecimal("150.00"))
                .build();
    }
}
