'use client'
import { useEffect, useRef } from 'react'
import { clientLogger } from '@/lib/clientLogger'
import { LogLevel } from '@/lib/logger'

export function useLogger(componentName: string) {
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      clientLogger.componentMount(componentName)
      mountedRef.current = true
    }

    return () => {
      clientLogger.componentUnmount(componentName)
    }
  }, [componentName])

  return {
    // Basic logging methods
    error: (message: string, data?: any) => clientLogger.error(message, data, componentName),
    warn: (message: string, data?: any) => clientLogger.warn(message, data, componentName),
    info: (message: string, data?: any) => clientLogger.info(message, data, componentName),
    debug: (message: string, data?: any) => clientLogger.debug(message, data, componentName),
    
    // Specialized logging methods
    userAction: (action: string, data?: any) => clientLogger.userAction(action, data, componentName),
    apiCall: (method: string, url: string, status?: number, duration?: number) => 
      clientLogger.apiCall(method, url, status, duration, componentName),
    
    // Performance timing
    time: (label: string) => clientLogger.time(label, componentName),
    
    // Component-specific helpers
    logFormSubmit: (formData: any) => {
      clientLogger.userAction('Form Submit', { formData }, componentName)
    },
    
    logButtonClick: (buttonName: string, data?: any) => {
      clientLogger.userAction('Button Click', { buttonName, ...data }, componentName)
    },
    
    logNavigation: (to: string, from?: string) => {
      clientLogger.userAction('Navigation', { to, from }, componentName)
    },
    
    logError: (error: Error, context?: any) => {
      clientLogger.error('Component Error', {
        error: error.message,
        stack: error.stack,
        context
      }, componentName)
    },
    
    logAsyncOperation: (operation: string, status: 'start' | 'success' | 'error', data?: any) => {
      if (status === 'start') {
        clientLogger.info(`Async Operation Started: ${operation}`, data, componentName)
      } else if (status === 'success') {
        clientLogger.info(`Async Operation Completed: ${operation}`, data, componentName)
      } else {
        clientLogger.error(`Async Operation Failed: ${operation}`, data, componentName)
      }
    }
  }
}

// Hook for setting global log level
export function useLogLevel() {
  return {
    setLogLevel: (level: LogLevel) => clientLogger.setLogLevel(level),
    getLogLevel: () => clientLogger.getLogLevel()
  }
}

// Hook for performance monitoring
export function usePerformanceLogger(componentName: string) {
  const timers = useRef<Map<string, { end: () => void }>>(new Map())
  
  return {
    startTimer: (label: string) => {
      const timer = clientLogger.time(label, componentName)
      timers.current.set(label, timer)
      return timer
    },
    
    endTimer: (label: string) => {
      const timer = timers.current.get(label)
      if (timer) {
        timer.end()
        timers.current.delete(label)
      }
    },
    
    measureRender: () => {
      const renderTimer = clientLogger.time('Component Render', componentName)
      
      useEffect(() => {
        renderTimer.end()
      })
    }
  }
}
