CREATE OR REPLACE VIEW active_auctions_view AS
SELECT 
    a.id AS auction_id,
    a.auctioned_quantity,
    a.starting_price,
    a.current_price,
    a.min_bid_increment,
    a.start_time,
    a.end_time,
    a.bid_count,
    a.extended,
    u.id AS seller_id,
    u.username AS seller_username,
    p.id AS product_id,
    p.product_name,
    p.product_image_url
FROM auctions a
JOIN users u ON a.seller_id = u.id
JOIN products p ON a.product_id = p.id
WHERE a.status = 'ACTIVE';
