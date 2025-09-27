package com.portfolio.controller;

import com.portfolio.model.ContactForm;
import com.portfolio.model.PortfolioItem;
import com.portfolio.model.Service;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/**
 * Main controller for the Business Portfolio Website
 * 
 * This controller handles all the routing and business logic for the portfolio website.
 * It manages the homepage, services, portfolio, and contact form functionality.
 * 
 * @author Professional Java Developer
 * @version 1.0.0
 */
@Controller
public class PortfolioController {
    
    private static final Logger logger = Logger.getLogger(PortfolioController.class.getName());
    
    /**
     * Homepage route - displays the main portfolio page with all sections
     */
    @GetMapping("/")
    public String index(Model model) {
        logger.info("Serving homepage request");
        
        // Add company information to model
        model.addAttribute("companyName", "TechSolutions Pro");
        model.addAttribute("companyTagline", "Innovative Solutions for Modern Business");
        model.addAttribute("companyDescription", 
            "We are a leading technology company specializing in web development, " +
            "mobile applications, and digital transformation solutions. Our team of " +
            "experienced professionals is dedicated to delivering high-quality, " +
            "scalable solutions that drive business growth.");
        
        // Add services to model
        model.addAttribute("services", getServices());
        
        // Add portfolio items to model
        model.addAttribute("portfolioItems", getPortfolioItems());
        
        // Add contact form to model
        model.addAttribute("contactForm", new ContactForm());
        
        return "index";
    }
    
    /**
     * Handle contact form submission
     */
    @PostMapping("/contact")
    public String submitContactForm(@Valid @ModelAttribute("contactForm") ContactForm contactForm,
                                  BindingResult bindingResult,
                                  RedirectAttributes redirectAttributes,
                                  Model model) {
        
        logger.info("Processing contact form submission from: " + contactForm.getName());
        
        if (bindingResult.hasErrors()) {
            // If there are validation errors, reload the page with error messages
            model.addAttribute("companyName", "TechSolutions Pro");
            model.addAttribute("companyTagline", "Innovative Solutions for Modern Business");
            model.addAttribute("services", getServices());
            model.addAttribute("portfolioItems", getPortfolioItems());
            return "index";
        }
        
        // Process the contact form (in a real application, you would save to database or send email)
        processContactForm(contactForm);
        
        // Add success message
        redirectAttributes.addFlashAttribute("successMessage", 
            "Thank you for your message! We'll get back to you within 24 hours.");
        
        return "redirect:/#contact";
    }
    
    /**
     * Process contact form submission
     * In a real application, this would save to database or send an email
     */
    private void processContactForm(ContactForm contactForm) {
        logger.info("=== NEW CONTACT FORM SUBMISSION ===");
        logger.info("Name: " + contactForm.getName());
        logger.info("Email: " + contactForm.getEmail());
        logger.info("Subject: " + contactForm.getSubject());
        logger.info("Message: " + contactForm.getMessage());
        logger.info("=====================================");
        
        // Here you would typically:
        // 1. Save to database
        // 2. Send email notification
        // 3. Send auto-reply to customer
        // 4. Add to CRM system
    }
    
    /**
     * Get list of services offered by the company
     */
    private List<Service> getServices() {
        List<Service> services = new ArrayList<>();
        
        services.add(new Service(
            "Web Development",
            "Custom web applications built with modern technologies and best practices.",
            "fas fa-code",
            new String[]{"Responsive Design", "Modern Frameworks", "SEO Optimized", "Fast Loading"}
        ));
        
        services.add(new Service(
            "Mobile Apps",
            "Native and cross-platform mobile applications for iOS and Android.",
            "fas fa-mobile-alt",
            new String[]{"iOS Development", "Android Development", "Cross-Platform", "App Store Optimization"}
        ));
        
        services.add(new Service(
            "Cloud Solutions",
            "Scalable cloud infrastructure and deployment solutions for your business.",
            "fas fa-cloud",
            new String[]{"AWS/Azure", "DevOps", "Scalable Architecture", "24/7 Monitoring"}
        ));
        
        services.add(new Service(
            "Digital Marketing",
            "Comprehensive digital marketing strategies to grow your online presence.",
            "fas fa-chart-line",
            new String[]{"SEO/SEM", "Social Media", "Content Marketing", "Analytics"}
        ));
        
        services.add(new Service(
            "UI/UX Design",
            "Beautiful and intuitive user interfaces that enhance user experience.",
            "fas fa-paint-brush",
            new String[]{"User Research", "Wireframing", "Prototyping", "Visual Design"}
        ));
        
        services.add(new Service(
            "Consulting",
            "Strategic technology consulting to help your business make informed decisions.",
            "fas fa-handshake",
            new String[]{"Technology Strategy", "Architecture Review", "Process Optimization", "Training"}
        ));
        
        return services;
    }
    
    /**
     * Get list of portfolio items
     */
    private List<PortfolioItem> getPortfolioItems() {
        List<PortfolioItem> portfolioItems = new ArrayList<>();
        
        portfolioItems.add(new PortfolioItem(
            "E-Commerce Platform",
            "A modern e-commerce platform with advanced features including inventory management, payment processing, and real-time analytics.",
            "https://via.placeholder.com/400x300/4f46e5/ffffff?text=E-Commerce",
            "Web Development",
            "#",
            "Spring Boot, React, PostgreSQL, Stripe API"
        ));
        
        portfolioItems.add(new PortfolioItem(
            "Mobile Banking App",
            "Secure mobile banking application with biometric authentication, real-time transactions, and comprehensive account management.",
            "https://via.placeholder.com/400x300/059669/ffffff?text=Banking+App",
            "Mobile Development",
            "#",
            "React Native, Node.js, MongoDB, Biometric APIs"
        ));
        
        portfolioItems.add(new PortfolioItem(
            "Healthcare Management System",
            "Comprehensive healthcare management system for hospitals with patient records, appointment scheduling, and staff management.",
            "https://via.placeholder.com/400x300/dc2626/ffffff?text=Healthcare",
            "Web Application",
            "#",
            "Java Spring, Angular, MySQL, REST APIs"
        ));
        
        portfolioItems.add(new PortfolioItem(
            "Real Estate Portal",
            "Property listing platform with advanced search, virtual tours, and mortgage calculator integration.",
            "https://via.placeholder.com/400x300/7c3aed/ffffff?text=Real+Estate",
            "Web Platform",
            "#",
            "Laravel, Vue.js, PostgreSQL, Google Maps API"
        ));
        
        portfolioItems.add(new PortfolioItem(
            "Learning Management System",
            "Online learning platform with course management, video streaming, assessments, and progress tracking.",
            "https://via.placeholder.com/400x300/ea580c/ffffff?text=LMS",
            "Educational Platform",
            "#",
            "Django, React, PostgreSQL, Video APIs"
        ));
        
        portfolioItems.add(new PortfolioItem(
            "Business Analytics Dashboard",
            "Interactive business intelligence dashboard with real-time data visualization and reporting capabilities.",
            "https://via.placeholder.com/400x300/0891b2/ffffff?text=Analytics",
            "Data Visualization",
            "#",
            "D3.js, Python, Flask, PostgreSQL"
        ));
        
        return portfolioItems;
    }
}
