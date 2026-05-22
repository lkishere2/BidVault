package com.auction.app.domains.users.followers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    Optional<Connection> findByFollowerIdAndFollowingId(long followerId, long followingId);

    long countByFollowerId(long userId);

    long countByFollowingId(long userId);
}
