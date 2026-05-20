package com.auction.app.domains.products;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.Set;

@Data
public class ProductRequest {
    @NotBlank
    private String productName;

    @NotBlank
    private String description;

    @Positive
    private int quantity;

    @NotEmpty
    private Set<Tag> tags;
}
