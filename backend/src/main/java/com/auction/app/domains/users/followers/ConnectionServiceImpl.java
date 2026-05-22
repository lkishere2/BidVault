package com.auction.app.domains.users.followers;

import com.auction.app.domains.users.users.User;
import com.auction.app.domains.users.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ConnectionServiceImpl implements ConnectionService {

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public String toggleFollow(Long followingId) {
        Long followerId = currentUser().getId();

        if (followerId.equals(followingId)) {
            throw new RuntimeException("You cannot follow yourself.");
        }

        Optional<Connection> optionalConnection = connectionRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (optionalConnection.isPresent()) {
            // Unfollow
            connectionRepository.delete(optionalConnection.get());
            return "Unfollowed successfully!";
        }
        else {
            // Follow
            User follower = findUserById(followerId);
            User following = findUserById(followingId);
            Connection connection = Connection.builder()
                    .follower(follower)
                    .following(following)
                    .build();
            connectionRepository.save(connection);
            return "Followed successfully";
        }
    }

    @Override
    public UserStats getUserStats(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        long followersCount = connectionRepository.countByFollowingId(userId);
        long followingCount = connectionRepository.countByFollowerId(userId);

        return new UserStats(followersCount, followingCount);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

}
