// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: any
  component?: string
  userId?: string
  sessionId?: string
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO
  private logDirectory: string = './logs'
  private logFile: string = 'app.log'
  private maxLogSize: number = 10 * 1024 * 1024 // 10MB
  private maxLogFiles: number = 5

  constructor() {
    this.ensureLogDirectory()
  }

  private ensureLogDirectory() {
    // Only run on server side
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs')
        if (!fs.existsSync(this.logDirectory)) {
          fs.mkdirSync(this.logDirectory, { recursive: true })
        }
      } catch (error) {
        console.error('Failed to create log directory:', error)
      }
    }
  }

  private formatLogEntry(level: LogLevel, message: string, data?: any, component?: string): LogEntry {
    const timestamp = new Date().toISOString()
    const levelNames = ['ERROR', 'WARN', 'INFO', 'DEBUG']
    
    return {
      timestamp,
      level: levelNames[level],
      message,
      data,
      component,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    }
  }

  private getCurrentUserId(): string | undefined {
    // Get from localStorage if available (client-side)
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  private getSessionId(): string | undefined {
    // Get from sessionStorage if available (client-side)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let sessionId = sessionStorage.getItem('sessionId')
      if (!sessionId) {
        sessionId = this.generateSessionId()
        sessionStorage.setItem('sessionId', sessionId)
      }
      return sessionId
    }
    return undefined
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  private writeToFile(logEntry: LogEntry) {
    // Only write to file on server side
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs')
        const path = require('path')
        
        const logPath = path.join(this.logDirectory, this.logFile)
        const logLine = JSON.stringify(logEntry) + '\n'
        
        // Check if file exists and its size
        if (fs.existsSync(logPath)) {
          const stats = fs.statSync(logPath)
          if (stats.size > this.maxLogSize) {
            this.rotateLogFile()
          }
        }
        
        fs.appendFileSync(logPath, logLine)
      } catch (error) {
        console.error('Failed to write to log file:', error)
      }
    }
  }

  private rotateLogFile() {
    // Only rotate on server side
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs')
        const path = require('path')
        
        const baseName = this.logFile.replace('.log', '')
        const extension = '.log'
        
        // Rotate existing files
        for (let i = this.maxLogFiles - 1; i >= 1; i--) {
          const currentFile = path.join(this.logDirectory, `${baseName}.${i}${extension}`)
          const nextFile = path.join(this.logDirectory, `${baseName}.${i + 1}${extension}`)
          
          if (fs.existsSync(currentFile)) {
            if (i === this.maxLogFiles - 1) {
              // Delete the oldest file
              fs.unlinkSync(currentFile)
            } else {
              // Move to next position
              fs.renameSync(currentFile, nextFile)
            }
          }
        }
        
        // Move current log file to .1
        const currentLog = path.join(this.logDirectory, this.logFile)
        const firstBackup = path.join(this.logDirectory, `${baseName}.1${extension}`)
        
        if (fs.existsSync(currentLog)) {
          fs.renameSync(currentLog, firstBackup)
        }
      } catch (error) {
        console.error('Failed to rotate log file:', error)
      }
    }
  }

  private log(level: LogLevel, message: string, data?: any, component?: string) {
    if (level <= this.logLevel) {
      const logEntry = this.formatLogEntry(level, message, data, component)
      
      // Console output with color coding
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[36m',  // Cyan
        [LogLevel.DEBUG]: '\x1b[32m'  // Green
      }
      
      const resetColor = '\x1b[0m'
      const color = colors[level] || resetColor
      
      console.log(
        `${color}[${logEntry.timestamp}] ${logEntry.level}${resetColor} ${logEntry.message}`,
        logEntry.data ? logEntry.data : ''
      )
      
      // Write to file (only on server side or when explicitly enabled)
      if (typeof window === 'undefined' || process.env.NODE_ENV === 'development') {
        this.writeToFile(logEntry)
      }
    }
  }

  // Public logging methods
  error(message: string, data?: any, component?: string) {
    this.log(LogLevel.ERROR, message, data, component)
  }

  warn(message: string, data?: any, component?: string) {
    this.log(LogLevel.WARN, message, data, component)
  }

  info(message: string, data?: any, component?: string) {
    this.log(LogLevel.INFO, message, data, component)
  }

  debug(message: string, data?: any, component?: string) {
    this.log(LogLevel.DEBUG, message, data, component)
  }

  // Set log level
  setLogLevel(level: LogLevel) {
    this.logLevel = level
  }

  // Get current log level
  getLogLevel(): LogLevel {
    return this.logLevel
  }

  // Performance logging
  time(label: string, component?: string) {
    const startTime = performance.now()
    return {
      end: () => {
        const endTime = performance.now()
        const duration = endTime - startTime
        this.info(`Performance: ${label} completed in ${duration.toFixed(2)}ms`, { duration }, component)
      }
    }
  }

  // User action logging
  userAction(action: string, data?: any, component?: string) {
    this.info(`User Action: ${action}`, data, component)
  }

  // API call logging
  apiCall(method: string, url: string, status?: number, duration?: number, component?: string) {
    const data = { method, url, status, duration }
    if (status && status >= 400) {
      this.error(`API Error: ${method} ${url} - Status: ${status}`, data, component)
    } else {
      this.info(`API Call: ${method} ${url}`, data, component)
    }
  }

  // Component lifecycle logging
  componentMount(componentName: string, props?: any) {
    this.debug(`Component Mounted: ${componentName}`, props, componentName)
  }

  componentUnmount(componentName: string) {
    this.debug(`Component Unmounted: ${componentName}`, undefined, componentName)
  }

  // Error boundary logging
  errorBoundary(error: Error, errorInfo: any, component?: string) {
    this.error('Error Boundary Caught Error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    }, component)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for easy import
export default logger
