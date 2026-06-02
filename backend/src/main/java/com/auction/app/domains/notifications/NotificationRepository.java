package com.auction.app.domains.notifications;

import com.auction.app.domains.notifications.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Slice<Notification> findByReceiverId(long receiverId, Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.hasRead = true WHERE n.id = :id AND n.receiver.id = :userId")
    void markAsRead(@Param("id") long id, @Param("userId") long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.hasRead = true WHERE n.receiver.id = :userId")
    void markAllAsRead(@Param("userId") long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.hasRead = false WHERE n.id = :id AND n.receiver.id = :userId")
    void markAsUnread(@Param("id") long id, @Param("userId") long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.hasRead = false WHERE n.receiver.id = :userId")
    void markAllAsUnread(@Param("userId") long userId);

}
