# Business Portfolio Java Web Application 🚀

A professional business portfolio website built with **Spring Boot 3.2.12** and **Java 21 LTS**, featuring a modern responsive design and comprehensive portfolio showcase.

## 🌟 Features

- ✅ **Modern Java 21 LTS Support** - Latest long-term support Java version
- ✅ **Spring Boot 3.2.12** - Latest stable Spring Boot framework
- ✅ **Responsive Design** - Mobile-first responsive HTML5/CSS3 interface
- ✅ **Professional Portfolio Showcase** - Display projects, services, and skills
- ✅ **Contact Form** - Integrated contact form with validation
- ✅ **MVC Architecture** - Clean separation of concerns
- ✅ **Thymeleaf Templates** - Server-side HTML templating
- ✅ **Maven Build System** - Streamlined dependency management
- ✅ **Development Ready** - Hot reloading and development profiles

## 🛠 Tech Stack

- **Backend**: Java 21, Spring Boot 3.2.12, Spring Web MVC
- **Frontend**: HTML5, CSS3, JavaScript, Thymeleaf
- **Build Tool**: Maven 3.9+
- **Template Engine**: Thymeleaf
- **Validation**: Spring Boot Validation
- **Development**: Spring Boot DevTools

## 🚀 Quick Start

### Prerequisites

- Java 21 LTS installed
- Maven 3.6+ installed

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/writersrinivasan/BusinessPortfoliowebapp_JAVA.git
   cd BusinessPortfoliowebapp_JAVA
   ```

2. **Set up Java 21 environment:**
   ```bash
   source setup-java21.sh
   ```

3. **Build and run the application:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. **Access the application:**
   Open your browser and navigate to: `http://localhost:8080`

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/portfolio/
│   │   ├── BusinessPortfolioApplication.java     # Main Spring Boot application
│   │   ├── controller/
│   │   │   └── PortfolioController.java          # Web controller
│   │   └── model/
│   │       ├── ContactForm.java                  # Contact form model
│   │       ├── PortfolioItem.java                # Portfolio item model
│   │       └── Service.java                      # Service model
│   └── resources/
│       ├── application.yml                       # Application configuration
│       └── templates/
│           └── index.html                        # Main HTML template
├── pom.xml                                       # Maven configuration
├── setup-java21.sh                              # Java 21 setup script
└── .java-version                                # Java version specification
```

## 🔧 Configuration

The application can be configured through `src/main/resources/application.yml`:

```yaml
server:
  port: 8080                    # Server port

spring:
  application:
    name: business-portfolio    # Application name
  thymeleaf:
    cache: false               # Template caching (dev mode)
    
logging:
  level:
    com.portfolio: INFO        # Application logging level
```

## 🎨 Customization

### Adding New Portfolio Items

1. Edit the `PortfolioController.java` to add new portfolio items
2. Customize the `index.html` template to display your content
3. Update the CSS styles for your branding

### Contact Form Integration

The contact form is ready for integration with:
- Email services (JavaMail, SendGrid)
- Database storage
- External APIs

## 🌍 Deployment

### Local Development
```bash
mvn spring-boot:run
```

### Production Build
```bash
mvn clean package
java -jar target/business-portfolio-1.0.0.jar
```

### Docker Deployment (Future Enhancement)
```dockerfile
FROM openjdk:21-jre-slim
COPY target/business-portfolio-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 📱 Screenshots

*Coming Soon - Screenshots of the responsive portfolio interface*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: *Coming Soon*
- **Documentation**: *This README*
- **Issues**: [GitHub Issues](https://github.com/writersrinivasan/BusinessPortfoliowebapp_JAVA/issues)

## 👨‍💻 Author

**Srinivasan Ramanujam**
- GitHub: [@writersrinivasan](https://github.com/writersrinivasan)

---

⭐ Star this repository if you find it helpful!

*Built with ❤️ using Java 21 and Spring Boot*
