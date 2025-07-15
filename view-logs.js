#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const logsDir = path.join(__dirname, 'logs')
const jsonLogFile = path.join(logsDir, 'app.log')
const readableLogFile = path.join(logsDir, 'app-readable.log')
const errorLogFile = path.join(logsDir, 'errors.log')

function displayLogStats() {
  console.log('\n📊 LOG STATISTICS\n')
  
  try {
    if (fs.existsSync(jsonLogFile)) {
      const jsonContent = fs.readFileSync(jsonLogFile, 'utf8')
      const jsonLines = jsonContent.split('\n').filter(line => line.trim())
      console.log(`📄 JSON Log File: ${jsonLines.length} entries`)
      
      // Parse levels
      const levels = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 }
      const components = new Set()
      const sessions = new Set()
      
      jsonLines.forEach(line => {
        try {
          const entry = JSON.parse(line)
          levels[entry.level] = (levels[entry.level] || 0) + 1
          if (entry.component) components.add(entry.component)
          if (entry.data?.clientInfo?.sessionId) sessions.add(entry.data.clientInfo.sessionId)
        } catch (e) {
          // Skip invalid JSON lines
        }
      })
      
      console.log('   📈 Log Levels:')
      Object.entries(levels).forEach(([level, count]) => {
        const icon = level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : level === 'INFO' ? 'ℹ️' : '🐛'
        console.log(`      ${icon} ${level}: ${count}`)
      })
      
      console.log(`   🧩 Components: ${components.size} (${Array.from(components).join(', ')})`)
      console.log(`   👥 Sessions: ${sessions.size}`)
    }
    
    if (fs.existsSync(readableLogFile)) {
      const readableContent = fs.readFileSync(readableLogFile, 'utf8')
      const readableLines = readableContent.split('\n').filter(line => line.trim())
      console.log(`📖 Readable Log File: ${readableLines.length} entries`)
    }
    
    if (fs.existsSync(errorLogFile)) {
      const errorContent = fs.readFileSync(errorLogFile, 'utf8')
      const errorLines = errorContent.split('\n').filter(line => line.trim())
      console.log(`❌ Error Log File: ${errorLines.length} entries`)
    }
    
  } catch (error) {
    console.error('Error reading log files:', error)
  }
}

function tailLogs(file, lines = 10) {
  try {
    if (!fs.existsSync(file)) {
      console.log(`File ${file} does not exist`)
      return
    }
    
    const content = fs.readFileSync(file, 'utf8')
    const allLines = content.split('\n').filter(line => line.trim())
    const lastLines = allLines.slice(-lines)
    
    console.log(`\n📋 Last ${lines} entries from ${path.basename(file)}:\n`)
    lastLines.forEach((line, index) => {
      console.log(`${(allLines.length - lines + index + 1).toString().padStart(6)}: ${line}`)
    })
    
  } catch (error) {
    console.error('Error reading log file:', error)
  }
}

function watchLogs(file) {
  console.log(`👀 Watching ${path.basename(file)} for changes... (Press Ctrl+C to stop)\n`)
  
  let lastSize = 0
  
  const checkForChanges = () => {
    try {
      if (!fs.existsSync(file)) return
      
      const stats = fs.statSync(file)
      if (stats.size > lastSize) {
        const content = fs.readFileSync(file, 'utf8')
        const newContent = content.slice(lastSize)
        const newLines = newContent.split('\n').filter(line => line.trim())
        
        newLines.forEach(line => {
          const timestamp = new Date().toLocaleTimeString()
          console.log(`[${timestamp}] ${line}`)
        })
        
        lastSize = stats.size
      }
    } catch (error) {
      console.error('Error watching file:', error)
    }
  }
  
  // Initial read
  if (fs.existsSync(file)) {
    lastSize = fs.statSync(file).size
  }
  
  // Watch for changes
  const interval = setInterval(checkForChanges, 1000)
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping log watcher...')
    clearInterval(interval)
    process.exit(0)
  })
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'stats':
    displayLogStats()
    break
    
  case 'tail':
    const lines = parseInt(args[2]) || 10
    const logType = args[1] || 'readable'
    let file
    
    switch (logType) {
      case 'json':
        file = jsonLogFile
        break
      case 'error':
        file = errorLogFile
        break
      case 'readable':
      default:
        file = readableLogFile
        break
    }
    
    tailLogs(file, lines)
    break
    
  case 'watch':
    const watchType = args[1] || 'readable'
    let watchFile
    
    switch (watchType) {
      case 'json':
        watchFile = jsonLogFile
        break
      case 'error':
        watchFile = errorLogFile
        break
      case 'readable':
      default:
        watchFile = readableLogFile
        break
    }
    
    watchLogs(watchFile)
    break
    
  default:
    console.log(`
🔍 LOG VIEWER UTILITY

Usage: node view-logs.js <command> [options]

Commands:
  stats              Show log statistics
  tail <type> <n>    Show last n lines (default: 10)
  watch <type>       Watch logs in real-time

Types:
  readable          Human-readable format (default)
  json              JSON format
  error             Error logs only

Examples:
  node view-logs.js stats
  node view-logs.js tail readable 20
  node view-logs.js watch json
  node view-logs.js tail error 5
`)
    break
}
