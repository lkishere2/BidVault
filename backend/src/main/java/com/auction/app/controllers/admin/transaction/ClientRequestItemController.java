package com.auction.app.controllers.admin.transaction;

import com.auction.app.domains.transaction.dtos.ClientRequest;
import com.auction.app.domains.transaction.model.TransactionStatus;
import com.auction.app.domains.transaction.model.TransactionType;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import java.util.function.Consumer;

public class ClientRequestItemController {

    @FXML private Label usernameLabel;
    @FXML private Label typeBadgeLabel;
    @FXML private Label statusBadgeLabel;
    @FXML private Label emailLabel;
    @FXML private Label dateLabel;
    @FXML private Label amountLabel;
    @FXML private Button acceptButton;
    @FXML private Button denyButton;

    private ClientRequest requestData;
    private Consumer<ClientRequest> onAcceptCallback;
    private Consumer<ClientRequest> onDenyCallback;

    public void populate(ClientRequest request, Consumer<ClientRequest> onAccept, Consumer<ClientRequest> onDeny) {
        this.requestData = request;
        this.onAcceptCallback = onAccept;
        this.onDenyCallback = onDeny;

        usernameLabel.setText(request.getUsername() != null ? request.getUsername() : "Unknown User");
        emailLabel.setText(request.getEmail() != null ? request.getEmail() : "No Email Provided");
        dateLabel.setText(request.getCreatedAt() != null ? request.getCreatedAt().toString() : "");
        amountLabel.setText(String.format("$%,.2f", request.getAmount()));

        renderTypeBadge(request.getType());
        renderStatusBadge(request.getStatus());
        configureActionButtons(request.getStatus());
    }

    private void renderTypeBadge(TransactionType type) {
        if (type == TransactionType.DEPOSIT) {
            typeBadgeLabel.setText("DEPOSIT");
            typeBadgeLabel.setStyle(badgeStyle("#F0FDF4", "#16A34A"));
            return;
        }

        typeBadgeLabel.setText("WITHDRAWAL");
        typeBadgeLabel.setStyle(badgeStyle("#FFF1F2", "#E11D48"));
    }

    private void renderStatusBadge(TransactionStatus status) {
        TransactionStatus displayStatus = status != null ? status : TransactionStatus.PENDING;
        statusBadgeLabel.setText(displayStatus.name());

        if (displayStatus == TransactionStatus.SUCCESS) {
            statusBadgeLabel.setStyle(badgeStyle("#DCFCE7", "#15803D"));
        } else if (displayStatus == TransactionStatus.FAILED) {
            statusBadgeLabel.setStyle(badgeStyle("#FEE2E2", "#B91C1C"));
        } else {
            statusBadgeLabel.setStyle(badgeStyle("#FEF3C7", "#B45309"));
        }
    }

    private void configureActionButtons(TransactionStatus status) {
        boolean pending = status == null || status == TransactionStatus.PENDING;
        acceptButton.setDisable(!pending);
        denyButton.setDisable(!pending);
        acceptButton.setVisible(pending);
        denyButton.setVisible(pending);
        acceptButton.setManaged(pending);
        denyButton.setManaged(pending);
    }

    private String badgeStyle(String backgroundColor, String textColor) {
        return "-fx-background-color: " + backgroundColor + ";"
                + " -fx-text-fill: " + textColor + ";"
                + " -fx-font-size: 10px;"
                + " -fx-font-weight: bold;"
                + " -fx-padding: 2 6 2 6;"
                + " -fx-background-radius: 4px;";
    }

    @FXML
    private void handleAccept() {
        if (onAcceptCallback != null && requestData != null) {
            onAcceptCallback.accept(requestData);
        }
    }

    @FXML
    private void handleDeny() {
        if (onDenyCallback != null && requestData != null) {
            onDenyCallback.accept(requestData);
        }
    }
}
