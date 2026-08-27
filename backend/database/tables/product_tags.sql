CREATE TABLE IF NOT EXISTS product_tags (
    product_id BIGINT NOT NULL,
    tag_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id, tag_name),
    CONSTRAINT fk_tag_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
