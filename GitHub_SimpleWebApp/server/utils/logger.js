/**
 * Application logging service
 * Handles centralized logging for both client-side and server-side errors
 */

const fs = require('fs');
const path = require('path');
const { format } = require('util');

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Configuration
const config = {
  logToConsole: true,
  logToFile: true,
  logDirectory: path.join(__dirname, '../../logs'),
  logLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG,
  maxLogFileSize: 5 * 1024 * 1024, // 5MB
  logRetentionDays: 30
};

// Ensure log directory exists
if (config.logToFile && !fs.existsSync(config.logDirectory)) {
  fs.mkdirSync(config.logDirectory, { recursive: true });
}

// Get current log file path
const getLogFilePath = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return path.join(config.logDirectory, `app-${dateStr}.log`);
};

// Format log message
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}\n`;
};

// Write log to file
const writeToFile = (level, message, meta = {}) => {
  if (!config.logToFile) return;

  const logFilePath = getLogFilePath();
  const logMessage = formatLogMessage(level, message, meta);

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

// Write log to console
const writeToConsole = (level, message, meta = {}) => {
  if (!config.logToConsole) return;

  const logMessage = `[${level}] ${message}`;
  
  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(logMessage, meta);
      break;
    case LOG_LEVELS.WARN:
      console.warn(logMessage, meta);
      break;
    case LOG_LEVELS.INFO:
      console.info(logMessage, meta);
      break;
    case LOG_LEVELS.DEBUG:
      console.debug(logMessage, meta);
      break;
    default:
      console.log(logMessage, meta);
  }
};

// Check if level is loggable
const shouldLog = (level) => {
  const levels = Object.values(LOG_LEVELS);
  const configLevelIndex = levels.indexOf(config.logLevel);
  const logLevelIndex = levels.indexOf(level);
  
  return logLevelIndex <= configLevelIndex;
};

// Log methods
const log = (level, message, meta = {}) => {
  if (!shouldLog(level)) return;
  
  writeToConsole(level, message, meta);
  writeToFile(level, message, meta);
};

// Clean up old log files
const cleanupOldLogs = () => {
  if (!config.logToFile) return;
  
  fs.readdir(config.logDirectory, (err, files) => {
    if (err) {
      console.error('Failed to read log directory:', err);
      return;
    }
    
    const now = Date.now();
    const cutoffDate = new Date(now - (config.logRetentionDays * 24 * 60 * 60 * 1000));
    
    files.forEach(file => {
      if (!file.startsWith('app-') || !file.endsWith('.log')) return;
      
      const filePath = path.join(config.logDirectory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Failed to stat log file ${file}:`, err);
          return;
        }
        
        if (stats.birthtime < cutoffDate) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Failed to delete old log file ${file}:`, err);
            }
          });
        }
      });
    });
  });
};

// Run cleanup periodically
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000); // Once a day

// Export logger
module.exports = {
  error: (message, meta = {}) => log(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta = {}) => log(LOG_LEVELS.WARN, message, meta),
  info: (message, meta = {}) => log(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta = {}) => log(LOG_LEVELS.DEBUG, message, meta),
  LOG_LEVELS
};
