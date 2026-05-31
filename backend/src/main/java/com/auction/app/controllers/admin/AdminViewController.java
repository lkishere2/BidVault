package com.auction.app.controllers.admin;

import javafx.fxml.FXML;
import javafx.scene.layout.StackPane;
import org.springframework.stereotype.Component;

@Component
public class AdminViewController {

    @FXML private StackPane adminContentCanvas;
    @FXML private AdminNavbarController adminNavbarController;

    @FXML
    public void initialize() {
    }

    public StackPane getAdminContentCanvas() {
        return this.adminContentCanvas;
    }

    public AdminNavbarController getAdminNavbarController() {
        return this.adminNavbarController;
    }
}