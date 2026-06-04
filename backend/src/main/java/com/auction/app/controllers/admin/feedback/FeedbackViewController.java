package com.auction.app.controllers.admin.feedback;

import com.auction.app.domains.feedback.FeedbackController;
import com.auction.app.domains.feedback.dtos.FeedbackAdminResponseRequest;
import com.auction.app.domains.feedback.dtos.FeedbackResponse;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class FeedbackViewController {

    @FXML private VBox feedbackList;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label pageLabel;
    @FXML private Label totalLabel;

    @Autowired private FeedbackController feedbackController;

    private static final int PAGE_SIZE = 8;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private int currentPage = 0;
    private int totalPages = 1;

    @FXML
    public void initialize() {
        loadPage();
    }

    @FXML
    private void handleRefresh() {
        loadPage();
    }

    @FXML
    private void handlePrevPage() {
        if (currentPage > 0) {
            currentPage--;
            loadPage();
        }
    }

    @FXML
    private void handleNextPage() {
        if (currentPage < totalPages - 1) {
            currentPage++;
            loadPage();
        }
    }

    private void loadPage() {
        Runnable task = new DelegatingSecurityContextRunnable(() -> {
            try {
                ResponseEntity<Page<FeedbackResponse>> response = feedbackController.getAllFeedback(currentPage, PAGE_SIZE);
                Page<FeedbackResponse> page = response.getBody();
                if (response.getStatusCode().is2xxSuccessful() && page != null) {
                    Platform.runLater(() -> render(page));
                }
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> showMessage("Could not load feedback."));
            }
        });
        new Thread(task, "admin-feedback-load").start();
    }

    private void render(Page<FeedbackResponse> page) {
        totalPages = Math.max(1, page.getTotalPages());
        totalLabel.setText(page.getTotalElements() + " feedback");
        pageLabel.setText(String.format("Page %d of %d", currentPage + 1, totalPages));
        prevButton.setDisable(currentPage == 0);
        nextButton.setDisable(currentPage >= totalPages - 1);

        feedbackList.getChildren().clear();
        if (page.isEmpty()) {
            showMessage("No feedback found.");
            return;
        }
        page.getContent().forEach(feedback -> feedbackList.getChildren().add(createFeedbackCard(feedback)));
    }

    private VBox createFeedbackCard(FeedbackResponse feedback) {
        VBox card = new VBox(10);
        card.setPadding(new Insets(14));
        card.setStyle("-fx-background-color: #171717; -fx-border-color: rgba(255,255,255,0.08); "
                + "-fx-border-radius: 10; -fx-background-radius: 10;");

        HBox header = new HBox(10);
        header.setAlignment(Pos.CENTER_LEFT);
        Label user = new Label(safe(feedback.getUsername()) + "  <" + safe(feedback.getEmail()) + ">");
        user.setStyle("-fx-text-fill: #FFFFFF; -fx-font-size: 14px; -fx-font-weight: bold;");
        Label date = new Label(feedback.getCreatedAt() == null ? "" : DATE_FORMATTER.format(feedback.getCreatedAt()));
        date.setStyle("-fx-text-fill: #64748B; -fx-font-size: 11px;");
        HBox.setHgrow(user, Priority.ALWAYS);
        header.getChildren().addAll(user, date);

        Label content = new Label(safe(feedback.getContent()));
        content.setWrapText(true);
        content.setStyle("-fx-text-fill: #CBD5E1; -fx-font-size: 13px;");

        Label currentResponse = new Label("Admin response: " + safe(feedback.getAdminResponse()));
        currentResponse.setWrapText(true);
        currentResponse.setStyle("-fx-text-fill: #F5C518; -fx-font-size: 12px;");

        TextArea responseArea = new TextArea(feedback.getAdminResponse() == null ? "" : feedback.getAdminResponse());
        responseArea.setPromptText("Write admin response...");
        responseArea.setPrefRowCount(3);
        responseArea.setWrapText(true);
        responseArea.setStyle("-fx-control-inner-background: #101827; -fx-text-fill: #FFFFFF; "
                + "-fx-prompt-text-fill: #64748B;");

        Button respond = new Button("Respond");
        respond.setOnAction(event -> respond(feedback, responseArea.getText()));

        card.getChildren().addAll(header, content, currentResponse, responseArea, respond);
        return card;
    }

    private void respond(FeedbackResponse feedback, String text) {
        String responseText = text == null ? "" : text.trim();
        if (responseText.isBlank()) {
            alert("Admin response cannot be empty.");
            return;
        }

        Runnable task = new DelegatingSecurityContextRunnable(() -> {
            try {
                ResponseEntity<FeedbackResponse> response = feedbackController.respondToFeedback(
                        feedback.getId(), new FeedbackAdminResponseRequest(responseText));
                if (response.getStatusCode().is2xxSuccessful()) {
                    Platform.runLater(this::loadPage);
                }
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> alert("Could not send response."));
            }
        });
        new Thread(task, "admin-feedback-respond").start();
    }

    private void showMessage(String text) {
        feedbackList.getChildren().setAll(message(text));
    }

    private void alert(String text) {
        Alert alert = new Alert(Alert.AlertType.ERROR, text, ButtonType.OK);
        alert.showAndWait();
    }

    private Label message(String text) {
        Label label = new Label(text);
        label.setStyle("-fx-text-fill: #94A3B8; -fx-font-size: 14px;");
        return label;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "None" : value;
    }
}
