#!/usr/bin/env node

const { logger } = require('./src/lib/logger');

// Test different log levels
console.log('Testing logging functionality...\n');

logger.info('Application started', { 
  environment: 'development',
  version: '1.0.0'
});

logger.debug('Debug information', { 
  userId: 'test123',
  sessionId: 'session456'
});

logger.warn('This is a warning', { 
  message: 'Something might be wrong',
  timestamp: new Date().toISOString()
});

logger.error('This is an error', { 
  error: 'Something went wrong',
  stack: 'Error stack trace...'
});

// Test performance logging
const timer = logger.time('Database Query');
setTimeout(() => {
  timer.end();
}, 100);

// Test user action logging
logger.userAction('Button Click', { 
  buttonName: 'Submit',
  formData: { email: 'test@example.com' }
});

// Test API call logging
logger.apiCall('GET', '/api/users', 200, 150);
logger.apiCall('POST', '/api/login', 401, 300);

console.log('\nLogging test completed! Check the logs directory and console output.');
