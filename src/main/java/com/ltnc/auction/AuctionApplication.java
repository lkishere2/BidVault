package com.ltnc.auction;

import io.github.cdimascio.dotenv.Dotenv;
import javafx.application.Platform;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuctionApplication {

    public static void main(String[] args) {
        // 1. Load Env
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

        // 2. Start Spring (Swagger/APIs)
        SpringApplication.run(AuctionApplication.class, args);

        // 3. Start JavaFX manually without extending Application in this class
        Platform.startup(() -> {
            // This initializes the JavaFX Toolkit
            new FxWindow().show(); 
        });
    }
}