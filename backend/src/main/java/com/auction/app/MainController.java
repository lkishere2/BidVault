package com.auction.app;

import org.springframework.stereotype.Component;
import javafx.fxml.FXML;

@Component
public class MainController {

    @FXML
    public void initialize() {
        System.out.println("JavaFX MainController successfully initialized by Spring Boot!");
    }
}