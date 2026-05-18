package com.auction.app.domains.products;

import com.auction.app.domains.products.exceptions.ProductNotFoundException;
import com.auction.app.domains.users.users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getStorage(int page, int size, String keyword, Set<Tag> tags) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByKeywordAndTags(currentUser().getId(), keyword, tags, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ProductResponse addProduct(ProductRequest productRequest) {
        Product product = mapToEntity(productRequest, currentUser());
        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse editProduct(Long id, ProductRequest productRequest) {
        Product product = findProductAndValidateUser(id);
        updateEntity(product, productRequest);
        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProductAndValidateUser(id);
        productRepository.delete(product);
    }

    // Helpers
    private Product findProductAndValidateUser(long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found."));
        if (!product.getOwner().getId().equals(currentUser().getId())) {
            throw new AccessDeniedException("Unauthorized: You do not own this product.");
        }
        return product;
    }

    private void updateEntity(Product product, ProductRequest productRequest) {
        product.setProductName(productRequest.getProductName());
        product.setDescription(productRequest.getDescription());
        product.setQuantity(productRequest.getQuantity());
        product.setTags(productRequest.getTags());
    }

    private Product mapToEntity(ProductRequest productRequest, User currentUser) {
        return Product.builder()
                .productName(productRequest.getProductName())
                .description(productRequest.getDescription())
                .quantity(productRequest.getQuantity())
                .tags(productRequest.getTags())
                .owner(currentUser)
                .build();
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .tags(product.getTags())
                .createdAt(product.getCreatedAt())
                .build();
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}