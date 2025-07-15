'use client'
import { useState, useEffect } from 'react'
import { useLogger } from '@/hooks/useLogger'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  data?: any
  component?: string
  userId?: string
  sessionId?: string
}

export default function LogDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const logger = useLogger('LogDashboard')

  useEffect(() => {
    logger.info('Log dashboard opened')
    
    // Mock some logs for demonstration
    const mockLogs: LogEntry[] = [
      {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'User logged in',
        data: { userId: 'user123' },
        component: 'Login',
        sessionId: 'session123'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: 'API call failed',
        data: { url: '/api/user', status: 500 },
        component: 'UserProfile',
        sessionId: 'session123'
      },
      {
        timestamp: new Date().toISOString(),
        level: 'WARN',
        message: 'Slow performance detected',
        data: { duration: 5000 },
        component: 'PolaroidGallery',
        sessionId: 'session123'
      }
    ]
    
    setLogs(mockLogs)
  }, [logger])

  const filteredLogs = logs.filter(log => {
    const matchesText = filter === '' || 
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.component?.toLowerCase().includes(filter.toLowerCase())
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    
    return matchesText && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-50'
      case 'WARN': return 'text-yellow-600 bg-yellow-50'
      case 'INFO': return 'text-blue-600 bg-blue-50'
      case 'DEBUG': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Logging Dashboard</h1>
          
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                Search Logs
              </label>
              <input
                id="filter"
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by message or component..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="sm:w-48">
              <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Level
              </label>
              <select
                id="level-filter"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="ERROR">ERROR</option>
                <option value="WARN">WARN</option>
                <option value="INFO">INFO</option>
                <option value="DEBUG">DEBUG</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.level === 'ERROR').length}
              </div>
              <div className="text-sm text-red-600">Errors</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter(log => log.level === 'WARN').length}
              </div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter(log => log.level === 'INFO').length}
              </div>
              <div className="text-sm text-blue-600">Info</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {logs.filter(log => log.level === 'DEBUG').length}
              </div>
              <div className="text-sm text-green-600">Debug</div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {log.component || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {log.message}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {log.data ? (
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            View Data
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No logs found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
