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
  data?: Record<string, unknown>
  component?: string
  userId?: string
  sessionId?: string
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO
  private logBuffer: LogEntry[] = []
  private maxBufferSize: number = 1000

  constructor() {
    // Pure client-side logger - no file operations
  }

  private formatLogEntry(level: LogLevel, message: string, data?: Record<string, unknown>, component?: string): LogEntry {
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

  private writeToBuffer(logEntry: LogEntry) {
    // Add to buffer and maintain max size
    this.logBuffer.push(logEntry)
    
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize)
    }
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>, component?: string) {
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
      
      // Store in buffer for debugging/monitoring
      this.writeToBuffer(logEntry)
    }
  }

  // Get logs from buffer (useful for debugging)
  getLogs(): LogEntry[] {
    return [...this.logBuffer]
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = []
  }

  // Public logging methods
  error(message: string, data?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.ERROR, message, data, component)
  }

  warn(message: string, data?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.WARN, message, data, component)
  }

  info(message: string, data?: Record<string, unknown>, component?: string) {
    this.log(LogLevel.INFO, message, data, component)
  }

  debug(message: string, data?: Record<string, unknown>, component?: string) {
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
  userAction(action: string, data?: Record<string, unknown>, component?: string) {
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
  componentMount(componentName: string, props?: Record<string, unknown>) {
    this.debug(`Component Mounted: ${componentName}`, props, componentName)
  }

  componentUnmount(componentName: string) {
    this.debug(`Component Unmounted: ${componentName}`, undefined, componentName)
  }

  // Error boundary logging
  errorBoundary(error: Error, errorInfo: Record<string, unknown>, component?: string) {
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
