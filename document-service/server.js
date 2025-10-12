const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const documentRoutes = require('./routes/documents');
const dbManager = require('./config/db');

const app = express();
const PORT = process.env.DOCUMENT_SERVICE_PORT || 3002;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    if (!dbManager.isConnected('document-service')) {
      await dbManager.connectServiceDB(
        'document-service', 
        process.env.DOCUMENT_SERVICE_DB || 'mongodb://localhost:27017/document-service'
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use('/documents', documentRoutes);

// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await dbManager.healthCheck('document-service');
    
    res.json({ 
      status: dbStatus.status === 'connected' ? 'OK' : 'ERROR',
      service: 'document-service',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      service: 'document-service',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Database status endpoint
app.get('/health/db', async (req, res) => {
  try {
    const status = await dbManager.getAllConnectionsStatus();
    res.json({ databases: status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Server startup
async function startServer() {
  try {
    // Initialize database connection
    await dbManager.connectServiceDB(
      'document-service',
      process.env.DOCUMENT_SERVICE_DB || 'mongodb://localhost:27017/document-service'
    );

    app.listen(PORT, () => {
      console.log(`📄 Document Service running on port ${PORT}`);
      console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start Document Service:', error);
    process.exit(1);
  }
}

// Cleanup temporary PDF files periodically (every hour)
const setupCleanupJob = () => {
  const pdfConversionService = require('./services/pdfConversionService');
  
  setInterval(async () => {
    try {
      await pdfConversionService.cleanupOldTempFiles(3600000); // 1 hour
      console.log('Temporary PDF files cleanup completed');
    } catch (error) {
      console.error('Error during temp files cleanup:', error);
    }
  }, 3600000); // Run every hour
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start if running standalone
if (require.main === module) {
  startServer().then(() => {
    setupCleanupJob();
  });
}

module.exports = app;