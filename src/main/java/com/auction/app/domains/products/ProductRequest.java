package com.auction.app.domains.products;

import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter

public class ProductRequest {
    private String productName;
    private Long price;
    private int quantity;

    private Set<Tag> tags = new HashSet<>();
}
