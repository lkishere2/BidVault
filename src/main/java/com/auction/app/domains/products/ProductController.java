package com.auction.app.domains.products;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor

public class ProductController {

    @Autowired
    private final ProductServiceImpl service;

    @PostMapping(path = "api/addProduct")
    public ProductResponse addProduct(ProductRequest productRequest){
        return service.createProduct(productRequest);
    }

    @PostMapping(path = "api/readProduct")
    public ProductResponse readProduct(Long id){
        return service.readProduct(id);
    }

    @PostMapping(path = "api/updateProduct")
    public ProductResponse updateProduct(ProductRequest productRequest, Long id){
        return service.updateProduct(productRequest, id);
    }

    @PostMapping(path = "api/deleteProduct")
    public String deleteProduct(Long id){
        return service.deleteProduct(id);
    }

}
