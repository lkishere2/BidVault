package com.auction.app;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;

// Minimal Spring Boot test configuration. It deliberately avoids component
// scanning the full desktop/backend application so slice tests do not pull in
// JavaFX controllers, Redis services, or unrelated web beans.
@SpringBootConfiguration
@EnableAutoConfiguration
public class TestApplication {
    // empty
}
