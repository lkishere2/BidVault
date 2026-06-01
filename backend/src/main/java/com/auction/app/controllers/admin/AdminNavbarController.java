package com.auction.app.controllers.admin;

import com.auction.app.MainController;
import com.auction.app.controllers.NavbarItemController;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class AdminNavbarController {

    @Autowired
    private MainController mainController;

    @Autowired
    private ApplicationContext springContext;

    @Autowired
    private AdminViewController adminViewController;

    @FXML private Parent navTransactions;
    @FXML private Parent navAuctions;
    @FXML private Parent navUsers;
    @FXML private Parent navBack;

    @FXML private NavbarItemController navTransactionsController;
    @FXML private NavbarItemController navAuctionsController;
    @FXML private NavbarItemController navUsersController;
    @FXML private NavbarItemController navBackController;

    @FXML
    public void initialize() {
        if (navTransactionsController != null) navTransactionsController.setItemText("Transactions");
        if (navAuctionsController != null) navAuctionsController.setItemText("Auctions");
        if (navUsersController != null) navUsersController.setItemText("Users");
        if (navBackController != null) navBackController.setItemText("Back to Dashboard");

        if (navTransactions != null) navTransactions.setOnMouseClicked(e -> handlePanelSwap("Transactions"));
        if (navAuctions != null) navAuctions.setOnMouseClicked(e -> handlePanelSwap("Auctions"));
        if (navUsers != null) navUsers.setOnMouseClicked(e -> handlePanelSwap("Users"));

        if (navBack != null) {
            navBack.setOnMouseClicked(e -> mainController.navigateTo("/ui/views/home/HomeView.fxml"));
        }
    }

    private void handlePanelSwap(String panelName) {
        String fxmlPath = null;

        if ("Transactions".equals(panelName)) {
            fxmlPath = "/ui/views/admin/transaction/TransactionView.fxml";
        } else if ("Auctions".equals(panelName)) {
            fxmlPath = "/ui/views/admin/AdminAuctionView.fxml";
        } else if ("Users".equals(panelName)) {
            fxmlPath = "/ui/views/admin/AdminUserView.fxml";
        }

        if (fxmlPath != null) {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource(fxmlPath));
                loader.setControllerFactory(springContext::getBean);
                Parent viewNode = loader.load();

                if (adminViewController != null && adminViewController.getAdminContentCanvas() != null) {
                    adminViewController.getAdminContentCanvas().getChildren().setAll(viewNode);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}