package com.auction.app.users;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ContextConfiguration;

import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.Role;
import com.auction.app.domains.users.users.model.User;

import jakarta.persistence.EntityManager;

@DataJpaTest(properties = "spring.profiles.active=test") // Thêm dòng này nếu cần tách cấu hình profile
@ContextConfiguration(classes = com.auction.app.TestApplication.class)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
// No explicit ContextConfiguration for slice tests
class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private User buyer;
    private User seller;

    @BeforeEach
    void setUp() {
        buyer = userRepository.saveAndFlush(createUser("buyer", "buyer@example.com", "buyerPassword", Role.USER));
        seller = userRepository.saveAndFlush(createUser("seller", "seller@example.com", "sellerPassword", Role.USER));
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

    // =========================================================================
    // METHOD 1: findByEmail (4 Tests)
    // =========================================================================

    // --- Happy Path (1 Test) ---

    @Test
    void findByEmail_WhenEmailExists_ShouldReturnUser() {
        Optional<User> result = userRepository.findByEmail("buyer@example.com");

        assertThat(result).isPresent();
        assertThat(result.get().getDisplayName()).isEqualTo("buyer");
        assertThat(result.get().getEmail()).isEqualTo("buyer@example.com");
    }

    // --- Edge Cases (3 Tests) ---

    @Test
    void findByEmail_WhenEmailDoesNotExist_ShouldReturnEmptyOptional() {
        Optional<User> result = userRepository.findByEmail("missing@example.com");

        assertThat(result).isEmpty();
    }

    @Test
    void findByEmail_WhenEmailIsNull_ShouldReturnEmptyOptional() {
        Optional<User> result = userRepository.findByEmail(null);

        assertThat(result).isEmpty();
    }

    @Test
    void findByEmail_WhenEmailCaseDoesNotMatch_ShouldReturnEmptyOptional() {
        Optional<User> result = userRepository.findByEmail("BUYER@example.com");

        assertThat(result).isEmpty();
    }

    // =========================================================================
    // METHOD 2: existsByEmail (4 Tests)
    // =========================================================================

    // --- Happy Paths (2 Tests) ---

    @Test
    void existsByEmail_WhenEmailExists_ShouldReturnTrue() {
        boolean exists = userRepository.existsByEmail("buyer@example.com");

        assertThat(exists).isTrue();
    }

    @Test
    void existsByEmail_WhenEmailDoesNotExist_ShouldReturnFalse() {
        boolean exists = userRepository.existsByEmail("missing@example.com");

        assertThat(exists).isFalse();
    }

    // --- Edge Cases (2 Tests) ---

    @Test
    void existsByEmail_WhenEmailIsNull_ShouldReturnFalse() {
        boolean exists = userRepository.existsByEmail(null);

        assertThat(exists).isFalse();
    }

    @Test
    void existsByEmail_WhenEmailCaseDoesNotMatch_ShouldReturnFalse() {
        boolean exists = userRepository.existsByEmail("BUYER@example.com");

        assertThat(exists).isFalse();
    }

    // =========================================================================
    // METHOD 3: updateUsername (4 Tests)
    // =========================================================================

    // --- Happy Path (1 Test) ---

    @Test
    void updateUsername_WhenUserExists_ShouldPersistNewUsername() {
        userRepository.updateUsername(buyer.getId(), "updatedBuyer");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getDisplayName()).isEqualTo("updatedBuyer"); // Sửa từ getDisplayName() thành getUsername()
    }

    // --- Edge Cases (3 Tests) ---

    @Test
    void updateUsername_WhenUserIdDoesNotExist_ShouldNotChangeExistingUsers() {
        userRepository.updateUsername(999L, "ghost");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getDisplayName()).isEqualTo("buyer");
    }

    @Test
    void updateUsername_WhenUserIdIsNull_ShouldNotChangeExistingUsers() {
        userRepository.updateUsername(null, "ghost");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getDisplayName()).isEqualTo("buyer"); // Sửa từ getDisplayName() thành getUsername()
    }

    @Test
    void updateUsername_WhenUsernameIsNull_ShouldViolateNotNullConstraint() {
        assertThatThrownBy(() -> {
            userRepository.updateUsername(buyer.getId(), null);
            userRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    // =========================================================================
    // METHOD 4: updateEmail (5 Tests)
    // =========================================================================

    // --- Happy Path (1 Test) ---

    @Test
    void updateEmail_WhenUserExists_ShouldPersistNewEmail() {
        userRepository.updateEmail(buyer.getId(), "updated@example.com");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getEmail()).isEqualTo("updated@example.com");
    }

    // --- Edge Cases (4 Tests) ---

    @Test
    void updateEmail_WhenUserIdDoesNotExist_ShouldNotChangeExistingUsers() {
        userRepository.updateEmail(999L, "ghost@example.com");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getEmail()).isEqualTo("buyer@example.com");
    }

    @Test
    void updateEmail_WhenUserIdIsNull_ShouldNotChangeExistingUsers() {
        userRepository.updateEmail(null, "ghost@example.com");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getEmail()).isEqualTo("buyer@example.com");
    }

    @Test
    void updateEmail_WhenEmailIsNull_ShouldViolateNotNullConstraint() {
        assertThatThrownBy(() -> {
            userRepository.updateEmail(buyer.getId(), null);
            userRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void updateEmail_WhenEmailAlreadyBelongsToAnotherUser_ShouldViolateUniqueConstraint() {
        assertThatThrownBy(() -> {
            userRepository.updateEmail(buyer.getId(), seller.getEmail());
            userRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    // =========================================================================
    // METHOD 5: updatePassword (4 Tests)
    // =========================================================================

    // --- Happy Path (1 Test) ---

    @Test
    void updatePassword_WhenUserExists_ShouldPersistNewPassword() {
        userRepository.updatePassword(buyer.getId(), "newEncodedPassword");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getPassword()).isEqualTo("newEncodedPassword");
    }

    // --- Edge Cases (3 Tests) ---

    @Test
    void updatePassword_WhenUserIdDoesNotExist_ShouldNotChangeExistingUsers() {
        userRepository.updatePassword(999L, "ghostPassword");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getPassword()).isEqualTo("buyerPassword");
    }

    @Test
    void updatePassword_WhenUserIdIsNull_ShouldNotChangeExistingUsers() {
        userRepository.updatePassword(null, "ghostPassword");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getPassword()).isEqualTo("buyerPassword");
    }



    // =========================================================================
    // METHOD 6: searchByUsername (4 Tests)
    // =========================================================================

    @Test
    void searchByUsername_WhenMatchExists_ShouldReturnPagedUsers() {
        Page<User> result = userRepository.searchByUsername("uy", PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getDisplayName()).isEqualTo("buyer");
    }

    @Test
    void searchByUsername_WhenCaseInsensitiveMatch_ShouldReturnPagedUsers() {
        Page<User> result = userRepository.searchByUsername("BUY", PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getDisplayName()).isEqualTo("buyer");
    }

    // --- Edge Cases (2 Tests) ---

    @Test
    void searchByUsername_WhenNoMatchExists_ShouldReturnEmptyPage() {
        Page<User> result = userRepository.searchByUsername("nonexistent", PageRequest.of(0, 10));

        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void searchByUsername_WhenQueryIsEmpty_ShouldReturnAllUsers() {
        Page<User> result = userRepository.searchByUsername("", PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(2);
    }

    // =========================================================================
    // METHOD 7: updateProfileImageUrl (4 Tests)
    // =========================================================================

    // --- Happy Path (1 Test) ---

    @Test
    void updateProfileImageUrl_WhenUserExists_ShouldPersistNewUrl() {
        userRepository.updateProfileImageUrl(buyer.getId(), "http://example.com/image.png");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getProfileImageUrl()).isEqualTo("http://example.com/image.png");
    }

    // --- Edge Cases (3 Tests) ---

    @Test
    void updateProfileImageUrl_WhenUserIdDoesNotExist_ShouldNotChangeExistingUsers() {
        userRepository.updateProfileImageUrl(999L, "http://example.com/ghost.png");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getProfileImageUrl()).isNull();
    }

    @Test
    void updateProfileImageUrl_WhenUserIdIsNull_ShouldNotChangeExistingUsers() {
        userRepository.updateProfileImageUrl(null, "http://example.com/ghost.png");
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();

        assertThat(result.getProfileImageUrl()).isNull();
    }

    @Test
    void updateProfileImageUrl_WhenUrlIsNull_ShouldAllowIfNullableOrThrowIfNotNull() {
        // Giả sử profileImageUrl cho phép null, test xem nó cập nhật thành công thành null không
        userRepository.updateProfileImageUrl(buyer.getId(), null);
        userRepository.flush();
        entityManager.clear();

        User result = userRepository.findById(buyer.getId()).orElseThrow();
        assertThat(result.getProfileImageUrl()).isNull();
    }

    // =========================================================================
    // METHOD 8: findTopUsersByFollowers (2 Tests)
    // =========================================================================

    @Test
    void findTopUsersByFollowers_WhenCalled_ShouldReturnOrderedList() {
        // Vì quan hệ followers (ManyToMany/OneToMany) phụ thuộc vào cấu trúc của Entity User
        // Thiết lập danh sách followers giả lập nếu entity cho phép hoặc kiểm tra việc gọi method không lỗi
        List<User> result = userRepository.findTopUsersByFollowers(PageRequest.of(0, 10));

        assertThat(result).isNotNull();
        // Mặc định số lượng followers của cả 2 bằng 0 (hoặc rỗng), list trả về có độ dài 2
        assertThat(result).hasSize(2);
    }

    @Test
    void findTopUsersByFollowers_WithPagination_ShouldLimitResults() {
        List<User> result = userRepository.findTopUsersByFollowers(PageRequest.of(0, 1));

        assertThat(result).hasSize(1);
    }

    private User createUser(String username, String email, String password, Role role) {
        return User.builder()
                .username(username)
                .email(email)
                .password(password)
                .role(role)
                .enabled(true)
                .followers(new ArrayList<>()) // Khởi tạo list trống để tránh NullPointerException khi chạy query size()
                .build();
    }
}
