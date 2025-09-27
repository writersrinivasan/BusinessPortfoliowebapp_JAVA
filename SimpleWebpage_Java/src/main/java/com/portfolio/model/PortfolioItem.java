package com.portfolio.model;

/**
 * Model class representing a portfolio project
 * 
 * This class encapsulates the information about individual portfolio items
 * including project details, images, and descriptions.
 */
public class PortfolioItem {
    
    private String title;
    private String description;
    private String imageUrl;
    private String category;
    private String projectUrl;
    private String technologies;
    
    // Default constructor
    public PortfolioItem() {}
    
    // Constructor with all fields
    public PortfolioItem(String title, String description, String imageUrl, 
                        String category, String projectUrl, String technologies) {
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
        this.projectUrl = projectUrl;
        this.technologies = technologies;
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
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getProjectUrl() {
        return projectUrl;
    }
    
    public void setProjectUrl(String projectUrl) {
        this.projectUrl = projectUrl;
    }
    
    public String getTechnologies() {
        return technologies;
    }
    
    public void setTechnologies(String technologies) {
        this.technologies = technologies;
    }
    
    @Override
    public String toString() {
        return "PortfolioItem{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", category='" + category + '\'' +
                ", projectUrl='" + projectUrl + '\'' +
                ", technologies='" + technologies + '\'' +
                '}';
    }
}
