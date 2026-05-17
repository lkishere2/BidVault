package com.auction.app.domains.products;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class ProductRequest {
    private String productName;
    private String description;
    private int quantity;
    private Set<Tag> tags;
}
