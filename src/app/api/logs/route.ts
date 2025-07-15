import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { fileLogger } from '@/lib/fileLogger'

export async function POST(request: NextRequest) {
  try {
    const { logs } = await request.json()
    
    if (!Array.isArray(logs)) {
      return NextResponse.json({ error: 'Invalid logs format' }, { status: 400 })
    }

    // Process each log entry
    logs.forEach((logEntry) => {
      const { level, message, data, component, timestamp, userId, sessionId } = logEntry
      
      // Add client info to the log data
      const enhancedData = {
        ...data,
        clientInfo: {
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          referer: request.headers.get('referer'),
          userId,
          sessionId,
          originalTimestamp: timestamp
        }
      }

      // Log using both loggers
      const logMessage = `[CLIENT] ${message}`
      
      // Use the new file logger for better formatting
      fileLogger.logEntry({
        timestamp: new Date().toISOString(),
        level,
        message: logMessage,
        data: enhancedData,
        component
      }, request)

      // Also use the original logger for backward compatibility
      switch (level) {
        case 'ERROR':
          logger.error(logMessage, enhancedData, component)
          break
        case 'WARN':
          logger.warn(logMessage, enhancedData, component)
          break
        case 'INFO':
          logger.info(logMessage, enhancedData, component)
          break
        case 'DEBUG':
          logger.debug(logMessage, enhancedData, component)
          break
        default:
          logger.info(logMessage, enhancedData, component)
      }
    })

    return NextResponse.json({ success: true, processed: logs.length })
  } catch (error) {
    const errorMessage = 'Error processing client logs'
    const errorData = { error: error instanceof Error ? error.message : error }
    
    // Log the error using both loggers
    fileLogger.error(errorMessage, errorData, 'LogsAPI', request)
    logger.error(errorMessage, errorData)
    
    return NextResponse.json({ error: 'Failed to process logs' }, { status: 500 })
  }
}
