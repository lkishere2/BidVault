package com.auction.app.controllers.admin.transaction;

import com.auction.app.domains.transaction.dtos.ClientRequest;
import com.auction.app.domains.transaction.model.TransactionType;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import java.util.function.Consumer;

public class ClientRequestItemController {

    @FXML private Label usernameLabel;
    @FXML private Label typeBadgeLabel;
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

        if (request.getType() == TransactionType.DEPOSIT) {
            typeBadgeLabel.setText("DEPOSIT");
            typeBadgeLabel.setStyle("-fx-background-color: #F0FDF4; -fx-text-fill: #16A34A; -fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");
        } else {
            typeBadgeLabel.setText("WITHDRAWAL");
            typeBadgeLabel.setStyle("-fx-background-color: #FFF1F2; -fx-text-fill: #E11D48; -fx-font-size: 10px; -fx-font-weight: bold; -fx-padding: 2 6 2 6; -fx-background-radius: 4px;");
        }
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