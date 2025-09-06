# Deployment Guide

This document provides instructions for deploying the Lifestyle Manager application in various environments.

## Prerequisites

Before deploying, ensure you have:

1. Node.js (v14.x or higher)
2. npm (v6.x or higher)
3. Git

## Local Development Environment

### Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lifestyle-manager.git
   cd lifestyle-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at [http://localhost:3000](http://localhost:3000)

### Development Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

## Production Deployment

### Option 1: Standard Node.js Deployment

1. Clone the repository on your production server:
   ```bash
   git clone https://github.com/yourusername/lifestyle-manager.git
   cd lifestyle-manager
   ```

2. Install production dependencies only:
   ```bash
   npm install --production
   ```

3. Create a `.env` file with production settings:
   ```
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=info
   ```

4. Start the server:
   ```bash
   npm run prod
   ```

5. For keeping the application running after terminal closes, use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "lifestyle-manager"
   pm2 save
   ```

### Option 2: Docker Deployment

1. Create a `Dockerfile` in the root directory:
   ```Dockerfile
   FROM node:16-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --production

   COPY . .

   ENV NODE_ENV=production
   ENV PORT=3000

   EXPOSE 3000

   CMD ["node", "server.js"]
   ```

2. Build and run the Docker container:
   ```bash
   docker build -t lifestyle-manager .
   docker run -d -p 3000:3000 --name lifestyle-app lifestyle-manager
   ```

3. For persistence, mount a volume for the SQLite database:
   ```bash
   docker run -d -p 3000:3000 -v /path/on/host:/app/data --name lifestyle-app lifestyle-manager
   ```

### Option 3: Cloud Platform Deployment

#### Heroku

1. Create a `Procfile` in the root directory:
   ```
   web: node server.js
   ```

2. Create a Heroku application and deploy:
   ```bash
   heroku create lifestyle-manager
   git push heroku main
   ```

3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   ```

#### AWS Elastic Beanstalk

1. Install the EB CLI:
   ```bash
   pip install awsebcli
   ```

2. Initialize your EB application:
   ```bash
   eb init
   ```

3. Create an environment and deploy:
   ```bash
   eb create lifestyle-manager-prod
   ```

4. For subsequent deployments:
   ```bash
   eb deploy
   ```

## Environment-Specific Considerations

### Development Environment

- Debug logging enabled
- Stack traces included in error responses
- Auto-restart on file changes (using nodemon)
- In-memory or local file SQLite database

### Production Environment

- Minimal logging (info level by default)
- No stack traces in error responses
- Process manager for reliability
- Error alerting
- Regular database backups
- Rate limiting (if implemented)

## Database Management

### SQLite Database

The application uses SQLite, which stores data in a single file:

```
database.sqlite
```

#### Backup Strategy

1. Regular file backup:
   ```bash
   cp database.sqlite database.backup.sqlite
   ```

2. Using SQLite dump:
   ```bash
   sqlite3 database.sqlite .dump > backup.sql
   ```

3. Restore from backup:
   ```bash
   sqlite3 database.sqlite < backup.sql
   ```

4. Automated daily backup script:
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +"%Y%m%d%H%M%S")
   cp database.sqlite backup/database.$TIMESTAMP.sqlite
   # Keep only last 7 days of backups
   find backup -name "database.*.sqlite" -mtime +7 -delete
   ```

## Scaling Considerations

### Horizontal Scaling

To scale beyond a single instance:

1. Replace SQLite with a centralized database like MySQL or PostgreSQL
2. Use a load balancer to distribute traffic across multiple app instances
3. Use a shared file system or object storage for any file assets
4. Implement session management if adding authentication

### Vertical Scaling

1. Increase server resources (CPU, memory)
2. Optimize database indices
3. Implement query caching

## Monitoring and Logging

### Application Logs

Logs are stored in the `logs` directory with daily rotation:
```
logs/app-YYYY-MM-DD.log
```

View today's logs:
```bash
npm run view-logs
```

### Health Check Endpoint

Add a health check endpoint to monitor application health:

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

### Recommended Monitoring Tools

1. **PM2** for process monitoring
2. **Prometheus + Grafana** for metrics and dashboards
3. **Sentry** for error tracking
4. **New Relic** or **DataDog** for comprehensive APM

## Security Considerations

1. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

2. **Set secure HTTP headers** (if exposed directly to the internet):
   - Content-Security-Policy
   - X-Content-Type-Options
   - X-XSS-Protection

3. **Rate limiting** to prevent abuse

4. **Input validation** for all user inputs

5. **CORS configuration** if API is used by external clients

## Maintenance Procedures

### Updates and Patches

1. Pull latest code:
   ```bash
   git pull origin main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Restart the application:
   ```bash
   pm2 restart lifestyle-manager
   ```

### Database Migrations

For schema changes, create migration scripts in a `migrations` directory:

```javascript
// Example migration to add a new column
const migration = async () => {
  try {
    await db.run('ALTER TABLE recipes ADD COLUMN tags TEXT');
    console.log('Migration successful');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

migration();
```

### Rollback Procedure

1. Identify the last known good commit
2. Roll back the code:
   ```bash
   git checkout <last-good-commit>
   npm install
   pm2 restart lifestyle-manager
   ```

3. If database rollback is needed, restore from the latest backup

## Troubleshooting Common Issues

### Application Won't Start

1. Check logs:
   ```bash
   cat logs/app-$(date +%Y-%m-%d).log
   ```

2. Verify port availability:
   ```bash
   lsof -i :3000
   ```

3. Check for database file permissions:
   ```bash
   ls -la database.sqlite
   ```

### Database Errors

1. Check SQLite database integrity:
   ```bash
   sqlite3 database.sqlite "PRAGMA integrity_check;"
   ```

2. Verify file permissions:
   ```bash
   chmod 644 database.sqlite
   ```

### High Memory Usage

1. Check Node.js process memory:
   ```bash
   pm2 monit
   ```

2. Look for memory leaks using:
   ```bash
   node --inspect server.js
   ```
   Then connect using Chrome DevTools

## Conclusion

This application is designed to be simple to deploy and maintain. For most use cases, a single instance with regular database backups will be sufficient. As your user base grows, consider the scaling options outlined above.

For any deployment issues, consult the application logs and this guide for troubleshooting steps.
