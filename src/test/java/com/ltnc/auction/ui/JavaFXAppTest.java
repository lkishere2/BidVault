package com.ltnc.auction.ui;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.BeforeAll;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test to verify JavaFX components are properly compiled and accessible
 */
@DisplayName("JavaFX Integration Tests")
class JavaFXAppTest {

    @BeforeAll
    static void setupHeadless() {
        // Set headless mode for JavaFX to run in server environments
        System.setProperty("java.awt.headless", "false");
        System.setProperty("testfx.headless", "true");
        System.setProperty("prism.useSWPipeline", "true");
    }

    @Test
    @DisplayName("JavaFX Application class should exist and be accessible")
    void testJavaFXAppExists() {
        try {
            Class<?> javaFXAppClass = Class.forName("com.ltnc.auction.ui.JavaFXApp");
            assertNotNull(javaFXAppClass, "JavaFXApp class should not be null");
            assertTrue(javaFXAppClass.getName().contains("JavaFXApp"), 
                    "Class should be named JavaFXApp");
        } catch (ClassNotFoundException e) {
            fail("JavaFXApp class should be found: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("JavaFX Application should have start method")
    void testJavaFXAppHasStartMethod() {
        try {
            Class<?> javaFXAppClass = Class.forName("com.ltnc.auction.ui.JavaFXApp");
            Method[] methods = javaFXAppClass.getDeclaredMethods();
            
            boolean hasStartMethod = false;
            for (Method method : methods) {
                if (method.getName().equals("start")) {
                    hasStartMethod = true;
                    break;
                }
            }
            
            assertTrue(hasStartMethod, "JavaFXApp should have a start method");
        } catch (ClassNotFoundException e) {
            fail("JavaFXApp class should be found: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("JavaFX dependencies should be on classpath")
    void testJavaFXDependenciesAvailable() {
        try {
            // Test if JavaFX core classes are on the classpath without initializing GUI
            Class.forName("javafx.application.Application");
            Class.forName("javafx.scene.Scene");
            Class.forName("javafx.scene.layout.Pane");
            Class.forName("javafx.geometry.Insets");
            
            assertTrue(true, "All JavaFX core dependencies are on the classpath");
        } catch (ClassNotFoundException e) {
            fail("JavaFX dependencies should be available: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Spring Boot and JavaFX should coexist in classpath")
    void testSpringBootAndJavaFXCoexist() {
        try {
            // Test Spring Boot classes
            Class.forName("org.springframework.boot.SpringApplication");
            Class.forName("org.springframework.boot.autoconfigure.SpringBootApplication");
            
            // Test JavaFX classes
            Class.forName("javafx.application.Application");
            
            assertTrue(true, "Both Spring Boot and JavaFX should be available in classpath");
        } catch (ClassNotFoundException e) {
            fail("Spring Boot and JavaFX should coexist: " + e.getMessage());
        }
    }
}
