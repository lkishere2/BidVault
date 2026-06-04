package com.auction.app.products;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested; // use test helper instead of mocking
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;

import com.auction.app.TestReflectionUtils;
import com.auction.app.domains.products.ProductRepository;
import com.auction.app.domains.products.ProductServiceImpl;
import com.auction.app.domains.products.dtos.ProductRequest;
import com.auction.app.domains.products.dtos.ProductResponse;
import com.auction.app.domains.products.exceptions.ProductNotFoundException;
import com.auction.app.domains.products.model.Product;
import com.auction.app.domains.products.model.Tag;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.infrastructure.security.TestSecurityUtils;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    private TestSecurityUtils securityUtils;

    @InjectMocks
    private ProductServiceImpl productService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = User.builder()
                .id(1L)
                .username("seller")
                .email("seller@example.com")
                .password("password")
                .enabled(true)
                .build();
        // initialize TestSecurityUtils and inject into service
        securityUtils = new TestSecurityUtils();
        securityUtils.setCurrentUser(currentUser);
        TestReflectionUtils.injectField(productService, "securityUtils", securityUtils);
    }

    @Nested
    @DisplayName("Kịch bản kiểm thử cho chức năng lấy kho hàng (getStorage)")
    class GetStorageTests {

        @Test
        void getStorage_WhenValidPageAndSize_ShouldReturnMappedProductResponsesSortedByCreatedAtDesc() {
            Product product = Product.builder()
                    .id(1L)
                    .productName("Gaming Laptop")
                    .description("High-end laptop")
                    .quantity(2)
                    .tags(new HashSet<>(Set.of(Tag.ELECTRONICS)))
                    .owner(currentUser)
                    .build();

            Pageable expectedPageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());

    // TestSecurityUtils already initialized in @BeforeEach
            when(productRepository.findAllUserProducts(eq(1L), eq(expectedPageable)))
                    .thenReturn(new PageImpl<>(List.of(product)));

            Page<ProductResponse> resultPage = productService.getStorage(0, 10);
            List<ProductResponse> responses = resultPage.getContent();

            assertThat(responses).hasSize(1);
            ProductResponse response = responses.get(0);
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getProductName()).isEqualTo("Gaming Laptop");

            verify(productRepository).findAllUserProducts(1L, expectedPageable);
        }

        @Test
        void getStorage_WhenPageIsInvalid_ShouldThrowBeforeRepositoryCall() {
            assertThatThrownBy(() -> productService.getStorage(-1, 10))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(productRepository, never()).findAllUserProducts(any(), any());
        }

        @Test
        void getStorage_WhenSizeIsInvalid_ShouldThrowBeforeRepositoryCall() {
            assertThatThrownBy(() -> productService.getStorage(0, 0))
                    .isInstanceOf(IllegalArgumentException.class);

            verify(productRepository, never()).findAllUserProducts(any(), any());
        }
    }

    @Nested
    @DisplayName("Kịch bản kiểm thử cho chức năng thêm sản phẩm (addProduct)")
    class AddProductTests {

        @Test
        void addProduct_WhenRequestIsValid_ShouldSaveProductForCurrentUser() {
            ProductRequest request = createProductRequest("Mechanical Keyboard", 3, Set.of(Tag.ELECTRONICS, Tag.GAMES));

            securityUtils.setCurrentUser(currentUser);
            when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
                Product p = invocation.getArgument(0);
                p.setId(100L); // Giả lập DB sinh ID tự động
                return p;
            });

            ProductResponse response = productService.addProduct(request);

            ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
            verify(productRepository).save(productCaptor.capture());
            Product savedProduct = productCaptor.getValue();

            assertThat(savedProduct.getOwner()).isEqualTo(currentUser);
            assertThat(savedProduct.getProductName()).isEqualTo("Mechanical Keyboard");
            assertThat(response.getId()).isEqualTo(100L);
            assertThat(response.getProductName()).isEqualTo("Mechanical Keyboard");
            // TestSecurityUtils is a simple helper; no verify
        }

        @Test
        @DisplayName("Thêm sản phẩm với danh sách tag rỗng - Hệ thống phải tự động gán tag OTHERS")
        void addProduct_WhenTagsAreEmpty_ShouldAssignDefaultTagOthers() {
            ProductRequest request = createProductRequest("Uncategorized Item", 1, null);

            securityUtils.setCurrentUser(currentUser);
            when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

            ProductResponse response = productService.addProduct(request);

            assertThat(response.getTags()).containsExactly(Tag.OTHERS);
        }
    }

    @Nested
    @DisplayName("Kịch bản kiểm thử cho chức năng chỉnh sửa sản phẩm (editProduct)")
    class EditProductTests {

        @Test
        void editProduct_WhenCurrentUserOwnsProduct_ShouldUpdateAndSaveProduct() {
            Product existingProduct = Product.builder()
                    .id(10L)
                    .productName("Old name")
                    .description("Old description")
                    .quantity(1)
                    .tags(new HashSet<>(Set.of(Tag.COLLECTIBLES)))
                    .owner(currentUser)
                    .build();
            ProductRequest request = createProductRequest("Mechanical Keyboard", 3, Set.of(Tag.ELECTRONICS, Tag.GAMES));

            when(productRepository.findById(10L)).thenReturn(Optional.of(existingProduct));
            securityUtils.setCurrentUser(currentUser);
            when(productRepository.save(existingProduct)).thenReturn(existingProduct);

            ProductResponse response = productService.editProduct(10L, request);

            assertThat(existingProduct.getProductName()).isEqualTo("Mechanical Keyboard");
            assertThat(existingProduct.getQuantity()).isEqualTo(3);
            assertThat(response.getProductName()).isEqualTo("Mechanical Keyboard");
            verify(productRepository).save(existingProduct);
        }

        @Test
        void editProduct_WhenProductDoesNotExist_ShouldThrowProductNotFoundException() {
            when(productRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> productService.editProduct(99L, createProductRequest("Name", 1, null)))
                    .isInstanceOf(ProductNotFoundException.class)
                    .hasMessageContaining("Product not found");

            verify(productRepository, never()).save(any(Product.class));
        }

        @Test
        void editProduct_WhenProductBelongsToAnotherUser_ShouldThrowAccessDeniedException() {
            User otherUser = User.builder().id(2L).username("other").build();
            Product product = Product.builder()
                    .id(20L)
                    .productName("Camera")
                    .owner(otherUser)
                    .build();

            when(productRepository.findById(20L)).thenReturn(Optional.of(product));
            securityUtils.setCurrentUser(currentUser); // ID hiện tại là 1 khác với Owner ID là 2

            assertThatThrownBy(() -> productService.editProduct(20L, createProductRequest("Name", 1, null)))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You do not own this product");

            verify(productRepository, never()).save(any(Product.class));
        }
    }

    @Nested
    @DisplayName("Kịch bản kiểm thử cho chức năng xóa sản phẩm (deleteProduct)")
    class DeleteProductTests {

        @Test
        void deleteProduct_WhenCurrentUserOwnsProduct_ShouldDeleteProduct() {
            Product product = Product.builder()
                    .id(20L)
                    .productName("Camera")
                    .owner(currentUser)
                    .build();

            when(productRepository.findById(20L)).thenReturn(Optional.of(product));
            securityUtils.setCurrentUser(currentUser);

            productService.deleteProduct(20L);

            verify(productRepository).delete(product);
        }

        @Test
        void deleteProduct_WhenProductBelongsToAnotherUser_ShouldThrowAccessDeniedException() {
            User otherUser = User.builder().id(2L).username("other").build();
            Product product = Product.builder()
                    .id(20L)
                    .productName("Camera")
                    .owner(otherUser)
                    .build();

            when(productRepository.findById(20L)).thenReturn(Optional.of(product));
            securityUtils.setCurrentUser(currentUser);

            assertThatThrownBy(() -> productService.deleteProduct(20L))
                    .isInstanceOf(AccessDeniedException.class)
                    .hasMessageContaining("You do not own this product");

            verify(productRepository, never()).delete(any(Product.class));
        }
    }

    private ProductRequest createProductRequest(String name, int quantity, Set<Tag> tags) {
        ProductRequest request = new ProductRequest();
        request.setProductName(name);
        request.setDescription("Sample text description");
        request.setQuantity(quantity);
        request.setProductImageUrl("http://image.com/url.png");
        request.setTags(tags != null ? new HashSet<>(tags) : null);
        return request;
    }
}