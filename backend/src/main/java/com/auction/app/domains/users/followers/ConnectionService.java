package com.auction.app.domains.users.followers;

public interface ConnectionService {
    String toggleFollow(Long followingId);
    UserStats getUserStats(Long userId);
}
