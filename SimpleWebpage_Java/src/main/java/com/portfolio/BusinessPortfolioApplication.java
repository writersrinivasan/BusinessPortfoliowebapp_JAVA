package com.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot application class for the Business Portfolio Website
 * 
 * This class serves as the entry point for the Spring Boot application.
 * It enables auto-configuration and component scanning for the entire application.
 * 
 * @author Professional Java Developer
 * @version 1.0.0
 */
@SpringBootApplication
public class BusinessPortfolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(BusinessPortfolioApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🚀 Business Portfolio Website is now running!");
        System.out.println("📱 Open your browser and navigate to: http://localhost:8080");
        System.out.println("=================================================");
    }
}
