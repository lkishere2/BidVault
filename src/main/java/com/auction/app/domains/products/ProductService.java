package com.auction.app.domains.products;

public interface ProductService {

    ProductResponse createProduct(ProductRequest productRequest);

    ProductResponse readProduct(Long id);

    ProductResponse updateProduct(ProductRequest productRequest, Long id);

    String deleteProduct(Long id);


}
