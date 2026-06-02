package com.auction.app.controllers.account.balance;

import com.auction.app.controllers.UserSession;
import com.auction.app.domains.transaction.model.TransactionType;
import com.auction.app.domains.users.users.UserController;
import com.auction.app.domains.users.users.UserRepository;
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
import java.math.BigDecimal;

@Component
public class UserBalanceCardController {

    @FXML private Label balanceAmountLabel;
    @FXML private Button requestBalanceBtn;

    @Autowired private UserController userController;
    @Autowired private UserRepository userRepository;
    @Autowired private UserSession userSession;
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
                BigDecimal balance = loadBalanceSnapshot();
                Platform.runLater(() -> balanceAmountLabel.setText(formatBalance(balance)));
            } catch (Exception e) {
                e.printStackTrace();
                Platform.runLater(() -> balanceAmountLabel.setText("Connection Error"));
            }
        });

        new Thread(secureTask).start();
    }

    private BigDecimal loadBalanceSnapshot() {
        if (userSession != null && userSession.getUserDetails() != null && userSession.getUserDetails().getId() != null) {
            BigDecimal balance = userRepository.findById(userSession.getUserDetails().getId())
                    .map(user -> user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO)
                    .orElse(BigDecimal.ZERO);
            userSession.getUserDetails().setBalance(balance);
            return balance;
        }

        ResponseEntity<UserResponse> response = userController.getCurrentUserInformation();
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            UserResponse profile = response.getBody();
            return profile.getBalance() != null ? profile.getBalance() : BigDecimal.ZERO;
        }

        return BigDecimal.ZERO;
    }

    private String formatBalance(BigDecimal balance) {
        return String.format("$%,.2f", balance != null ? balance : BigDecimal.ZERO);
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
