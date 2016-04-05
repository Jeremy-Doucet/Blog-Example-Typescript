// Set default node environment to development
let env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Export the application
exports = module.exports = require('./app');
