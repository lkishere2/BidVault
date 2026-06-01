package com.auction.app.controllers.account.balance;

import com.auction.app.domains.transaction.model.TransactionType;
import com.auction.app.domains.users.users.UserController;
import com.auction.app.domains.users.users.dtos.UserResponse;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class UserBalanceCardController {

    @FXML private Label balanceAmountLabel;
    @FXML private Button requestBalanceBtn;

    @Autowired private UserController userController;
    @Autowired private ApplicationContext springContext;

    private BalanceViewController parentController;

    public void setParentController(BalanceViewController parentController) {
        this.parentController = parentController;
    }

    @FXML
    public void initialize() {
        loadActiveUserMetrics();
    }

    public void loadActiveUserMetrics() {
        Runnable secureTask = new DelegatingSecurityContextRunnable(() -> {
            try {
                ResponseEntity<UserResponse> response = userController.getCurrentUserInformation();
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    UserResponse profile = response.getBody();
                    Platform.runLater(() -> balanceAmountLabel.setText(
                            String.format("$%,.2f", profile.getBalance())
                    ));
                }
            } catch (Exception e) {
                Platform.runLater(() -> balanceAmountLabel.setText("Connection Error"));
            }
        });

        new Thread(secureTask).start();
    }

    @FXML
    private void handleOpenDepositModal() {
        openBalanceRequestModal(TransactionType.DEPOSIT);
    }

    @FXML
    private void handleOpenWithdrawalModal() {
        openBalanceRequestModal(TransactionType.WITHDRAWAL);
    }

    private void openBalanceRequestModal(TransactionType type) {
        if (parentController == null) {
            return;
        }
        try {
            FXMLLoader loader = new FXMLLoader(
                    getClass().getResource("/ui/views/account/balance/BalanceRequestBox.fxml"));
            loader.setControllerFactory(springContext::getBean);
            VBox modalContent = loader.load();

            BalanceRequestBoxController modalController = loader.getController();
            modalController.configureModalContext(type, parentController);

            StackPane overlay = parentController.getModalOverlayTarget();
            overlay.getChildren().setAll(modalContent);
            overlay.setStyle("-fx-background-color: rgba(0,0,0,0.6);");
            overlay.setMouseTransparent(false);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}