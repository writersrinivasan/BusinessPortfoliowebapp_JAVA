package com.portfolio.model;

/**
 * Model class representing a service offering
 * 
 * This class encapsulates the information about services provided by the business
 */
public class Service {
    
    private String title;
    private String description;
    private String iconClass;
    private String[] features;
    
    // Default constructor
    public Service() {}
    
    // Constructor with all fields
    public Service(String title, String description, String iconClass, String[] features) {
        this.title = title;
        this.description = description;
        this.iconClass = iconClass;
        this.features = features;
    }
    
    // Getters and Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIconClass() {
        return iconClass;
    }
    
    public void setIconClass(String iconClass) {
        this.iconClass = iconClass;
    }
    
    public String[] getFeatures() {
        return features;
    }
    
    public void setFeatures(String[] features) {
        this.features = features;
    }
}
