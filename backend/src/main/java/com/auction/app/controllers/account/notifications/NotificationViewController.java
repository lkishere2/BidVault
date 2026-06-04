package com.auction.app.controllers.account.notifications;

import com.auction.app.domains.notifications.NotificationController;
import com.auction.app.domains.notifications.dtos.NotificationResponse;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Slice;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class NotificationViewController {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final NotificationController notificationController;

    @FXML private VBox notificationList;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label pageLabel;
    @FXML private Label statusLabel;

    private int currentPage = 0;
    private boolean hasNextPage = false;

    @FXML
    public void initialize() {
        loadNotifications();
    }

    @FXML
    private void handleRefresh() {
        loadNotifications();
    }

    @FXML
    private void handleMarkAllRead() {
        runSecurely(() -> {
            try {
                notificationController.markAllAsRead();
                Platform.runLater(this::loadNotifications);
            } catch (Exception e) {
                Platform.runLater(() -> statusLabel.setText("Could not mark all as read."));
            }
        });
    }

    @FXML
    private void handlePrevPage() {
        if (currentPage > 0) {
            currentPage--;
            loadNotifications();
        }
    }

    @FXML
    private void handleNextPage() {
        if (hasNextPage) {
            currentPage++;
            loadNotifications();
        }
    }

    private void loadNotifications() {
        notificationList.getChildren().clear();
        statusLabel.setText("Loading notifications...");
        prevButton.setDisable(true);
        nextButton.setDisable(true);

        runSecurely(() -> {
            try {
                ResponseEntity<Slice<NotificationResponse>> response = notificationController.getMyNotificationsFeed(currentPage, 12);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Platform.runLater(() -> renderNotifications(response.getBody()));
                }
            } catch (Exception e) {
                Platform.runLater(() -> statusLabel.setText("Could not load notifications."));
            }
        });
    }

    private void renderNotifications(Slice<NotificationResponse> feed) {
        notificationList.getChildren().clear();
        hasNextPage = feed.hasNext();
        pageLabel.setText("Page " + (currentPage + 1));
        prevButton.setDisable(currentPage == 0);
        nextButton.setDisable(!hasNextPage);

        if (feed.getContent().isEmpty()) {
            statusLabel.setText("No notifications yet.");
            return;
        }

        statusLabel.setText("");
        for (NotificationResponse notification : feed.getContent()) {
            notificationList.getChildren().add(createNotificationRow(notification));
        }
    }

    private VBox createNotificationRow(NotificationResponse notification) {
        Label messageLabel = new Label(notification.getMessage());
        messageLabel.setWrapText(true);
        messageLabel.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 14; -fx-font-weight: " + (notification.isHasRead() ? "normal" : "bold") + ";");

        Label timeLabel = new Label(notification.getSendAt() != null ? notification.getSendAt().format(TIME_FORMATTER) : "");
        timeLabel.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 12;");

        Button readToggle = new Button(notification.isHasRead() ? "Mark unread" : "Mark read");
        readToggle.setStyle("-fx-background-color: rgba(245,197,24,0.16); -fx-text-fill: #F5C518; -fx-background-radius: 8; -fx-font-weight: bold; -fx-cursor: hand;");
        readToggle.setOnAction(event -> toggleReadState(notification));

        HBox metaRow = new HBox(12, timeLabel, readToggle);
        metaRow.setStyle("-fx-alignment: center-left;");

        VBox row = new VBox(8, messageLabel, metaRow);
        String borderColor = notification.isHasRead() ? "rgba(255,255,255,0.08)" : "#F5C518";
        row.setStyle("-fx-background-color: #1A1A1A; -fx-background-radius: 12; -fx-border-color: " + borderColor + "; -fx-border-radius: 12; -fx-padding: 16;");
        return row;
    }

    private void toggleReadState(NotificationResponse notification) {
        runSecurely(() -> {
            try {
                if (notification.isHasRead()) {
                    notificationController.markAsUnread(notification.getId());
                } else {
                    notificationController.markAsRead(notification.getId());
                }
                Platform.runLater(this::loadNotifications);
            } catch (Exception e) {
                Platform.runLater(() -> statusLabel.setText("Could not update notification."));
            }
        });
    }

    private void runSecurely(Runnable task) {
        DelegatingSecurityContextRunnable secureTask = new DelegatingSecurityContextRunnable(task, SecurityContextHolder.getContext());
        Thread thread = new Thread(secureTask);
        thread.setDaemon(true);
        thread.start();
    }
}
