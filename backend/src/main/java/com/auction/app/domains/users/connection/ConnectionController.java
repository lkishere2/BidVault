package com.auction.app.domains.users.connection;

import com.auction.app.domains.users.connection.dtos.UserStats;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class ConnectionController {

    @Autowired
    private ConnectionService connectionService;

    @PostMapping("/follow/{following_id}")
    public ResponseEntity<Void> follow(@PathVariable("following_id") Long followingId) {
        connectionService.toggleFollow(followingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{user_id}/stats")
    public ResponseEntity<UserStats> getStats(@PathVariable("user_id") Long userId) {
        return ResponseEntity.ok(connectionService.getUserStats(userId));
    }
}
