package com.auction.app.products;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.auction.app.domains.products.ProductController;
import com.auction.app.domains.products.ProductService;
import com.auction.app.domains.products.dtos.ProductRequest;
import com.auction.app.domains.products.dtos.ProductResponse;
import com.auction.app.infrastructure.exception.GlobalExceptionHandler;
import com.auction.app.infrastructure.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = ProductController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
@AutoConfigureMockMvc(addFilters = false)
@ContextConfiguration(classes = {com.auction.app.TestApplication.class, ProductController.class})
@Import(GlobalExceptionHandler.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductService productService;
    //helper
    private ProductRequest createProductRequest(String name, int quantity) {
        ProductRequest request = new ProductRequest();
        request.setProductName(name);
        request.setDescription("Sample description");
        request.setQuantity(quantity);
        return request;
    }


    //api/v1/inventory/get

    @Nested
    @DisplayName("Get Storage Endpoint Tests")
    class GetStorageTests {

        @Test
        @DisplayName("Should return product page when parameters are valid")
        void getStorage_ValidParams_ReturnsPage() throws Exception {
            ProductResponse response = new ProductResponse();
            response.setId(1L);
            response.setProductName("Gaming Laptop");
            response.setQuantity(2);

            Page<ProductResponse> mockPage = new PageImpl<>(List.of(response));
            when(productService.getStorage(0, 10)).thenReturn(mockPage);

            mockMvc.perform(get("/api/v1/inventory/get")
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].id").value(1))
                    .andExpect(jsonPath("$.content[0].productName").value("Gaming Laptop"))
                    .andExpect(jsonPath("$.content[0].quantity").value(2));

            verify(productService).getStorage(0, 10);
        }

        @Test
        @DisplayName("Should use default parameters when optionals are missing")
        void getStorage_MissingParams_UsesDefaults() throws Exception {
            Page<ProductResponse> mockPage = new PageImpl<>(List.of());
            when(productService.getStorage(0, 20)).thenReturn(mockPage);

            mockMvc.perform(get("/api/v1/inventory/get"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());

            verify(productService).getStorage(0, 20);
        }

        @Test
        @DisplayName("Should return BadRequest when page is negative")
        void getStorage_NegativePage_ReturnsBadRequest() throws Exception {
            mockMvc.perform(get("/api/v1/inventory/get")
                            .param("page", "-1")
                            .param("size", "10"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(productService);
        }

        @Test
        @DisplayName("Should return BadRequest when size is less than 1")
        void getStorage_ZeroSize_ReturnsBadRequest() throws Exception {
            mockMvc.perform(get("/api/v1/inventory/get")
                            .param("page", "0")
                            .param("size", "0"))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(productService);
        }
    }


 //api/v1/inventory/add

    @Nested
    @DisplayName("Add Product Endpoint Tests")
    class AddProductTests {

        @Test
        @DisplayName("Should return Created status and product data when request is valid")
        void addProduct_ValidRequest_ReturnsCreated() throws Exception {
            ProductRequest request = createProductRequest("Mechanical Keyboard", 5);

            ProductResponse response = new ProductResponse();
            response.setId(10L);
            response.setProductName(request.getProductName());
            response.setQuantity(request.getQuantity());

            when(productService.addProduct(any(ProductRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/inventory/add")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(10))
                    .andExpect(jsonPath("$.productName").value("Mechanical Keyboard"))
                    .andExpect(jsonPath("$.quantity").value(5));

            verify(productService).addProduct(any(ProductRequest.class));
        }
    }


    //api/v1/inventory/update/{id}

    @Nested
    @DisplayName("Edit Product Endpoint Tests")
    class EditProductTests {

        @Test
        @DisplayName("Should return Ok status and updated product data when request is valid")
        void editProduct_ValidRequest_ReturnsUpdatedProduct() throws Exception {
            Long productId = 10L;
            ProductRequest request = createProductRequest("Updated Gaming Mouse", 15);

            ProductResponse response = new ProductResponse();
            response.setId(productId);
            response.setProductName(request.getProductName());
            response.setQuantity(request.getQuantity());

            when(productService.editProduct(eq(productId), any(ProductRequest.class))).thenReturn(response);

            mockMvc.perform(put("/api/v1/inventory/update/{id}", productId)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(productId))
                    .andExpect(jsonPath("$.productName").value("Updated Gaming Mouse"))
                    .andExpect(jsonPath("$.quantity").value(15));

            verify(productService).editProduct(eq(productId), any(ProductRequest.class));
        }
    }


    //api/v1/inventory/delete/{id}
    @Nested
    @DisplayName("Delete Product Endpoint Tests")
    class DeleteProductTests {

        @Test
        @DisplayName("Should return Ok status when product is deleted successfully")
        void deleteProduct_ValidId_ReturnsOk() throws Exception {
            Long productId = 10L;

            mockMvc.perform(delete("/api/v1/inventory/delete/{id}", productId))
                    .andExpect(status().isOk()); // Theo code Controller của bạn: ResponseEntity.ok().build() trả về 200 OK

            verify(productService).deleteProduct(productId);
        }
    }
}
