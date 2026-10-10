const dotenv = require('dotenv');

// Load environment variables before any other imports
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[TaskFlow Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[TaskFlow Server] Health check available at: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[TaskFlow Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[TaskFlow Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error(`[TaskFlow Server] Failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();
