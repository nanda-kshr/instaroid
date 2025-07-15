// Server-side logger specifically for API routes
import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: Record<string, unknown>
  component?: string
  userId?: string
  sessionId?: string
}

class FileLogger {
  private logDirectory: string = './logs'
  private jsonLogFile: string = 'app.log'
  private readableLogFile: string = 'app-readable.log'
  private errorLogFile: string = 'errors.log'

  constructor() {
    this.ensureLogDirectory()
  }

  private ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDirectory)) {
        fs.mkdirSync(this.logDirectory, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create log directory:', error)
    }
  }

  private writeToFile(filename: string, content: string) {
    try {
      const logPath = path.join(this.logDirectory, filename)
      fs.appendFileSync(logPath, content + '\n')
    } catch (error) {
      console.error(`Failed to write to ${filename}:`, error)
    }
  }

  private formatReadableLog(logEntry: LogEntry): string {
    const { timestamp, level, message, component, data } = logEntry
    const time = new Date(timestamp).toLocaleString()
    
    let formatted = `[${time}] ${level.padEnd(5)} `
    
    if (component) {
      formatted += `[${component}] `
    }
    
    formatted += message
    
    if (data && Object.keys(data).length > 0) {
      // Format data in a more readable way
      const formattedData = this.formatDataForReading(data)
      if (formattedData) {
        formatted += ` | ${formattedData}`
      }
    }
    
    return formatted
  }

  private formatDataForReading(data: Record<string, unknown>): string {
    if (!data || typeof data !== 'object') return JSON.stringify(data)
    
    const parts: string[] = []
    
    // Handle common data patterns
    if (data.from !== undefined && data.to !== undefined) {
      parts.push(`${data.from} → ${data.to}`)
    }
    
    if (data.themeName) {
      parts.push(`theme: ${data.themeName}`)
    }
    
    if (data.themeIndex !== undefined) {
      parts.push(`index: ${data.themeIndex}`)
    }
    
    if (data.buttonName) {
      parts.push(`button: ${data.buttonName}`)
    }
    
    if (data.formType) {
      parts.push(`form: ${data.formType}`)
    }
    
    if (data.clientInfo && typeof data.clientInfo === 'object') {
      const clientInfo = data.clientInfo as Record<string, unknown>
      const { ip, sessionId } = clientInfo
      if (sessionId && typeof sessionId === 'string') parts.push(`session: ${sessionId.slice(0, 8)}...`)
      if (ip && typeof ip === 'string' && ip !== '::1') parts.push(`ip: ${ip}`)
    }
    
    if (data.error) {
      parts.push(`error: ${data.error}`)
    }
    
    if (data.duration) {
      parts.push(`duration: ${data.duration}ms`)
    }
    
    return parts.join(', ')
  }

  logEntry(logEntry: LogEntry, request?: NextRequest) {
    // Enhanced log entry with request info
    const enhancedEntry = {
      ...logEntry,
      timestamp: new Date().toISOString(),
      data: {
        ...logEntry.data,
        ...(request && {
          requestInfo: {
            method: request.method,
            url: request.url,
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            referer: request.headers.get('referer')
          }
        })
      }
    }

    // Write JSON log
    this.writeToFile(this.jsonLogFile, JSON.stringify(enhancedEntry))
    
    // Write readable log
    this.writeToFile(this.readableLogFile, this.formatReadableLog(enhancedEntry))
    
    // Write to error log if it's an error
    if (logEntry.level === 'ERROR') {
      this.writeToFile(this.errorLogFile, this.formatReadableLog(enhancedEntry))
    }
    
    // Console output with colors
    const colors = {
      'ERROR': '\x1b[31m',
      'WARN': '\x1b[33m',
      'INFO': '\x1b[36m',
      'DEBUG': '\x1b[32m'
    }
    
    const color = colors[logEntry.level as keyof typeof colors] || '\x1b[0m'
    const reset = '\x1b[0m'
    
    console.log(`${color}${this.formatReadableLog(enhancedEntry)}${reset}`)
  }

  // Convenience methods
  error(message: string, data?: Record<string, unknown>, component?: string, request?: NextRequest) {
    this.logEntry({ timestamp: '', level: 'ERROR', message, data, component }, request)
  }

  warn(message: string, data?: Record<string, unknown>, component?: string, request?: NextRequest) {
    this.logEntry({ timestamp: '', level: 'WARN', message, data, component }, request)
  }

  info(message: string, data?: Record<string, unknown>, component?: string, request?: NextRequest) {
    this.logEntry({ timestamp: '', level: 'INFO', message, data, component }, request)
  }

  debug(message: string, data?: Record<string, unknown>, component?: string, request?: NextRequest) {
    this.logEntry({ timestamp: '', level: 'DEBUG', message, data, component }, request)
  }
}

export const fileLogger = new FileLogger()
export default fileLogger
