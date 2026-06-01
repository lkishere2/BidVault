package com.auction.app.controllers.admin.transaction;

import com.auction.app.domains.transaction.TransactionController;
import com.auction.app.domains.transaction.dtos.ClientRequest;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.stereotype.Component;

@Component
public class TransactionViewController {

    @FXML private ClientRequestGridController clientRequestGridController;
    @FXML private Button prevButton;
    @FXML private Button nextButton;
    @FXML private Label pageTrackerLabel;

    @Autowired private TransactionController transactionController;

    private int currentPage = 0;
    private int totalPages = 1;
    private static final int PAGE_SIZE = 10;

    @FXML
    public void initialize() {
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

    public void loadPage() {
        Runnable task = new DelegatingSecurityContextRunnable(() -> {
            try {
                ResponseEntity<Page<ClientRequest>> response = transactionController.getAllTransactionRequests(currentPage, PAGE_SIZE);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Page<ClientRequest> page = response.getBody();
                    Platform.runLater(() -> {
                        totalPages = Math.max(1, page.getTotalPages());
                        if (clientRequestGridController != null) {
                            clientRequestGridController.renderItems(page.getContent(), this::handleAcceptRequest, this::handleDenyRequest);
                        }
                        pageTrackerLabel.setText(String.format("Page %d of %d", currentPage + 1, totalPages));
                        prevButton.setDisable(currentPage == 0);
                        nextButton.setDisable(currentPage >= totalPages - 1);
                    });
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        new Thread(task).start();
    }

    private void handleAcceptRequest(ClientRequest request) {
        Runnable task = new DelegatingSecurityContextRunnable(() -> {
            try {
                ResponseEntity<Void> response = transactionController.acceptTransaction(request);
                if (response.getStatusCode().is2xxSuccessful()) {
                    Platform.runLater(this::loadPage);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        new Thread(task).start();
    }

    private void handleDenyRequest(ClientRequest request) {
        Runnable task = new DelegatingSecurityContextRunnable(() -> {
            try {
                ResponseEntity<Void> response = transactionController.cancelTransaction(request.getTransactionId());
                if (response.getStatusCode().is2xxSuccessful()) {
                    Platform.runLater(this::loadPage);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        new Thread(task).start();
    }
}