const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/db');

let server;

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  server = app.listen(config.port, () => {
    console.log(`=================================================`);
    console.log(`🏥 Doctors Cares Server running on port ${config.port}`);
    console.log(`🚀 Mode: ${config.env}`);
    console.log(`🔗 API Base: http://localhost:${config.port}/api/v1`);
    console.log(`=================================================`);
  });
};

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down Doctors Cares server...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

startServer();
