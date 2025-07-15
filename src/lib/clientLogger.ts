'use client'
import { LogLevel, LogEntry } from './logger'

class ClientLogger {
  private logLevel: LogLevel = LogLevel.INFO
  private logBuffer: LogEntry[] = []
  private maxBufferSize: number = 50
  private flushInterval: number = 10000 // 10 seconds
  private logEndpoint: string = '/api/logs'
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.startPeriodicFlush()
  }

  private startPeriodicFlush() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    
    this.intervalId = setInterval(() => {
      this.flush()
    }, this.flushInterval)
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
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  private getSessionId(): string | undefined {
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

  private addToBuffer(logEntry: LogEntry) {
    this.logBuffer.push(logEntry)
    
    // If buffer is full, flush immediately
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush()
    }
  }

  private async flush() {
    if (this.logBuffer.length === 0) return

    const logsToSend = [...this.logBuffer]
    this.logBuffer = []

    try {
      const response = await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend })
      })

      if (!response.ok) {
        // If sending fails, put logs back in buffer
        this.logBuffer.unshift(...logsToSend)
        console.error('Failed to send logs to server:', response.statusText)
      }
    } catch (error) {
      // If sending fails, put logs back in buffer
      this.logBuffer.unshift(...logsToSend)
      console.error('Error sending logs to server:', error)
    }
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>, component?: string) {
    if (level <= this.logLevel) {
      const logEntry = this.formatLogEntry(level, message, data, component)
      
      // Console output with color coding
      const colors = {
        [LogLevel.ERROR]: 'color: red; font-weight: bold;',
        [LogLevel.WARN]: 'color: orange; font-weight: bold;',
        [LogLevel.INFO]: 'color: blue; font-weight: bold;',
        [LogLevel.DEBUG]: 'color: green; font-weight: bold;'
      }
      
      const style = colors[level] || ''
      
      console.log(
        `%c[${logEntry.timestamp}] ${logEntry.level}%c ${logEntry.message}`,
        style,
        'color: inherit;',
        logEntry.data || ''
      )
      
      // Add to buffer for server sending
      this.addToBuffer(logEntry)
    }
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

  // Get log level
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

  // Force flush logs
  forceFlush() {
    this.flush()
  }

  // Cleanup
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.flush() // Send any remaining logs
  }
}

// Export singleton instance
export const clientLogger = new ClientLogger()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clientLogger.forceFlush()
  })
}

export default clientLogger
