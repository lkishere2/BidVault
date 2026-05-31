package com.auction.app.domains.users.connection;

import com.auction.app.domains.users.connection.dtos.UserStats;
import com.auction.app.domains.users.connection.model.Connection;
import com.auction.app.domains.users.exceptions.UserNotFoundException;
import com.auction.app.domains.users.exceptions.SelfFollowException;
import com.auction.app.domains.notifications.NotificationService;
import com.auction.app.domains.notifications.model.NotificationType;
import com.auction.app.domains.users.users.model.User;
import com.auction.app.domains.users.users.UserRepository;
import com.auction.app.infrastructure.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConnectionServiceImpl implements ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public void toggleFollow(Long followingId) {

        User follower = securityUtils.getCurrentUser();
        Long followerId = follower.getId();

        if (followerId.equals(followingId)) {
            throw new SelfFollowException("You cannot follow your own account.");
        }

        Optional<Connection> optionalConnection = connectionRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (optionalConnection.isPresent()) {
            // Unfollow
            connectionRepository.delete(optionalConnection.get());
        }
        else {
            // Follow
            User following = userRepository.findById(followingId)
                    .orElseThrow(() -> new UserNotFoundException("User not found!"));
            Connection connection = Connection.builder().follower(follower).following(following).build();
            connectionRepository.save(connection);

            // Call the notification service
            notificationService.createAndSend(following, follower, NotificationType.FOLLOWING);
        }
    }

    @Override
    public UserStats getUserStats(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found");
        }

        long followersCount = connectionRepository.countByFollowing_Id(userId);
        long followingCount = connectionRepository.countByFollower_Id(userId);

        return new UserStats(followersCount, followingCount);
    }

}