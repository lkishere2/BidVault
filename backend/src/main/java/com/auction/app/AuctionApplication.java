package com.auction.app;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.stage.Stage;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableCaching
public class AuctionApplication extends Application {

	private ConfigurableApplicationContext context;

	@Override
	public void init() {
		// Boostrap the Spring Boot backend in the background when JavaFX initializes
		this.context = new SpringApplicationBuilder()
				.sources(AuctionApplication.class)
				.run();
	}

	@Override
	public void start(Stage primaryStage) {
		// Fire the event to open your JavaFX window once Spring is ready
		this.context.publishEvent(new StageReadyEvent(primaryStage));
	}

	@Override
	public void stop() {
		// Cleanly shut down both Spring and JavaFX when the user closes the window
		this.context.close();
		Platform.exit();
	}

	public static void main(String[] args) {
		// Launch JavaFX instead of SpringApplication.run()
		Application.launch(AuctionApplication.class, args);
	}
}