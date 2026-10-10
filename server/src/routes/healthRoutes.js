const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1 || process.env.NODE_ENV === 'test';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'TaskFlow Backend API',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatusMap[dbState] || 'unknown',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
