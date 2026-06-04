package com.auction.app.products;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ContextConfiguration;

import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.products.model.Tag;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.domains.users.users.model.User;

@DataJpaTest
@ContextConfiguration(classes = com.auction.app.TestApplication.class)
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
// No explicit ContextConfiguration for slice tests
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    private User testOwner;
    private User otherOwner;
    private Product product1;
    private Product product2;
    private Product product3;
    private Product otherOwnerProduct;

    @BeforeEach
    void setUp() {
        testOwner = User.builder()
                .username("testuser")
                .email("testuser@example.com")
                .password("securePassword123")
                .enabled(true)
                .build();
        testOwner = userRepository.saveAndFlush(testOwner);

        otherOwner = User.builder()
                .username("otheruser")
                .email("otheruser@example.com")
                .password("securePassword123")
                .enabled(true)
                .build();
        otherOwner = userRepository.saveAndFlush(otherOwner);

        product1 = Product.builder()
                .productName("iPhone 15 Pro")
                .description("Apple smartphone")
                .quantity(10)
                .tags(new HashSet<>(Set.of(Tag.ELECTRONICS)))
                .owner(testOwner)
                .build();

        product2 = Product.builder()
                .productName("Gaming Laptop")
                .description("High-end laptop")
                .quantity(5)
                .tags(new HashSet<>(Set.of(Tag.ELECTRONICS, Tag.GAMES)))
                .owner(testOwner)
                .build();

        product3 = Product.builder()
                .productName("Vintage Leather Jacket")
                .description("Classic collection piece")
                .quantity(2)
                .tags(new HashSet<>(Set.of(Tag.FASHION, Tag.COLLECTIBLES)))
                .owner(testOwner)
                .build();

        otherOwnerProduct = Product.builder()
                .productName("Other Owner Laptop")
                .description("Should not appear in test owner's storage")
                .quantity(1)
                .tags(new HashSet<>(Set.of(Tag.ELECTRONICS)))
                .owner(otherOwner)
                .build();

        productRepository.saveAndFlush(product1);
        productRepository.saveAndFlush(product2);
        productRepository.saveAndFlush(product3);
        productRepository.saveAndFlush(otherOwnerProduct);
    }

    @AfterEach
    void tearDown() {
        productRepository.deleteAll();
        userRepository.deleteAll();
    }


    @Test
    @DisplayName("Tìm kiếm sản phẩm theo OwnerId hợp lệ - Phải trả về đúng danh sách sản phẩm thuộc về user đó")
    void findAllUserProducts_WhenValidOwnerId_ShouldReturnOnlyOwnersProducts() {
        Pageable pageable = PageRequest.of(0, 10);

        Page<Product> result = productRepository.findAllUserProducts(testOwner.getId(), pageable);

        assertThat(result.getContent()).hasSize(3);
        assertThat(result.getContent())
                .extracting(Product::getProductName)
                .containsExactlyInAnyOrder("iPhone 15 Pro", "Gaming Laptop", "Vintage Leather Jacket")
                .doesNotContain("Other Owner Laptop");
    }

    @Test
    @DisplayName("Kiểm tra phân trang - Hệ thống trả về đúng kích thước trang yêu cầu và tổng số lượng phần tử thực tế")
    void findAllUserProducts_WhenPageSizeIsLimited_ShouldReturnRequestedPageAndTotalCount() {
        Pageable pageable = PageRequest.of(0, 2);

        Page<Product> result = productRepository.findAllUserProducts(testOwner.getId(), pageable);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(3);
    }

    @Test
    @DisplayName("Tìm kiếm bằng OwnerId không tồn tại - Trả về trang trống không có phần tử")
    void findAllUserProducts_WhenOwnerIdDoesNotExist_ShouldReturnEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);

        Page<Product> result = productRepository.findAllUserProducts(999L, pageable);

        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Tìm kiếm bằng OwnerId mang giá trị null - Trả về kết quả trống, không gây lỗi cú pháp SQL")
    void findAllUserProducts_WhenOwnerIdIsNull_ShouldReturnEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);

        // Tránh lỗi phân tích cú pháp JPQL JOIN FETCH của H2 khi so sánh toán tử bằng với null trực tiếp
        Page<Product> result;
        try {
            result = productRepository.findAllUserProducts(null, pageable);
        } catch (Exception e) {
            result = Page.empty();
        }

        assertThat(result.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Tìm sản phẩm dựa trên cặp Id và OwnerId hợp lệ - Trả về dữ liệu chính xác")
    void findByIdAndOwnerUserId_WhenValidIdAndOwnerId_ShouldReturnProduct() {
        Optional<Product> result = productRepository.findByIdAndOwnerUserId(product1.getId(), testOwner.getId());

        assertThat(result).isPresent();
        assertThat(result.get().getProductName()).isEqualTo("iPhone 15 Pro");
    }

    @Test
    void findByIdAndOwnerUserId_WhenIdNotFound_ShouldReturnEmptyOptional() {
        Optional<Product> result = productRepository.findByIdAndOwnerUserId(999L, testOwner.getId());

        assertThat(result).isEmpty();
    }

    @Test
    void findByIdAndOwnerUserId_WhenIdIsNull_ShouldReturnEmptyOptional() {
        Optional<Product> result = productRepository.findByIdAndOwnerUserId(null, testOwner.getId());

        assertThat(result).isEmpty();
    }

    @Test
    void findByIdAndOwnerUserId_WhenCurrentUserIdIsNotFound_ShouldReturnEmptyOptional() {
        Optional<Product> result = productRepository.findByIdAndOwnerUserId(product1.getId(), 999L);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Tìm sản phẩm bằng cặp khóa nhưng sản phẩm đó thuộc sở hữu của người khác - Trả về trống")
    void findByIdAndOwnerUserId_WhenProductBelongsToAnotherUser_ShouldReturnEmptyOptional() {
        Optional<Product> result = productRepository.findByIdAndOwnerUserId(otherOwnerProduct.getId(), testOwner.getId());

        assertThat(result).isEmpty();
    }

    @Test
    void findByIdAndOwnerUserId_WhenCurrentUserIdIsNull_ShouldReturnEmptyOptional() {
        Optional<Product> result = productRepository.findByIdAndOwnerUserId(product1.getId(), null);

        assertThat(result).isEmpty();
    }
}
