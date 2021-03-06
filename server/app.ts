/**
 * Main application file
 */

'use strict';

import * as express from 'express';
import * as mongoose from 'mongoose';
// import config from './config/environment';
import * as http from 'http';

// Connect to MongoDB
mongoose.connect('mongodb://localhost/typescript-blog');
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

// Populate databases with sample data
// if (config.seedDB) { require('./config/seed'); }

// Setup server
let app = express();
let server = http.createServer(app);
require('./config/express').default(app);
require('./routes').default(app);

// Start server
function startServer() {
  app['blogExample'] = server.listen(3000, '0.0.0.0', function() {
    console.log('Express server listening on %d, in %s mode', 3000, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
