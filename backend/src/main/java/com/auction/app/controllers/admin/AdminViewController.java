package com.auction.app.controllers.admin;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.layout.StackPane;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class AdminViewController {

    @FXML private StackPane adminContentCanvas;
    @FXML private AdminNavbarController adminNavbarController;

    @Autowired private ApplicationContext springContext;

    @FXML
    public void initialize() {
        loadDefaultTransactionsView();
    }

    public StackPane getAdminContentCanvas() {
        return this.adminContentCanvas;
    }

    public AdminNavbarController getAdminNavbarController() {
        return this.adminNavbarController;
    }

    private void loadDefaultTransactionsView() {
        if (adminContentCanvas == null) {
            return;
        }

        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ui/views/admin/transaction/TransactionView.fxml"));
            loader.setControllerFactory(springContext::getBean);
            Parent viewNode = loader.load();
            adminContentCanvas.getChildren().setAll(viewNode);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
