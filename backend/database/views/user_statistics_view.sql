CREATE OR REPLACE VIEW user_statistics_view AS
SELECT 
    u.id AS user_id,
    u.username,
    u.email,
    u.balance,
    (SELECT COUNT(*) FROM connections c WHERE c.following_id = u.id) AS followers_count,
    (SELECT COUNT(*) FROM connections c WHERE c.follower_id = u.id) AS following_count,
    (SELECT COUNT(*) FROM auctions a WHERE a.seller_id = u.id) AS total_auctions_created,
    (SELECT COUNT(*) FROM bids b WHERE b.bidder_id = u.id) AS total_bids_placed
FROM users u;
