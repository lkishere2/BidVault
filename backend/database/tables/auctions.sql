CREATE TABLE IF NOT EXISTS auctions (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    auctioned_quantity INTEGER NOT NULL,
    starting_price NUMERIC(15, 2) NOT NULL,
    current_price NUMERIC(15, 2) NOT NULL,
    min_bid_increment NUMERIC(15, 2) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'UPCOMING' NOT NULL,
    winner_id BIGINT,
    bid_count INTEGER DEFAULT 0 NOT NULL,
    extended BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT fk_auction_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_auction_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_auction_winner FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);
