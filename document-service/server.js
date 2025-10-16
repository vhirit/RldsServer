const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIO = require('socket.io');
const documentRoutes = require('./routes/documents');
const branchRoutes = require('./routes/branchRoutes');
const sourcePersonRoutes = require('./routes/sourcePersonRoutes');
const DocumentNumberService = require('./services/documentNumberService');
// const dbManager = require('./config/db');

const dbManager = require('./config/db');

// Load models to register them with Mongoose
const models = require('./models');
console.log('Models loaded:', Object.keys(models));
//
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3003'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// dbManager().then(() => {
//   console.log('Database connected, starting server...');
// });


const PORT = process.env.DOCUMENT_SERVICE_PORT || 3002;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001','http://localhost:3003'],
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
// app.use(async (req, res, next) => {
//   try {
//     if (!dbManager.isConnected('document-service')) {
//       await dbManager.connectServiceDB(
//         'document-service', 
//         process.env.DOCUMENT_SERVICE_DB || 'mongodb://localhost:27017/document-service'
//       );
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('📡 Client connected to document-service WebSocket:', socket.id);

  // Send current document number when client connects
  socket.on('requestDocumentNumber', async () => {
    try {
      const currentDocumentNumber = await DocumentNumberService.getCurrentDocumentNumber();
      socket.emit('documentNumber', { 
        documentNumber: currentDocumentNumber,
        timestamp: new Date().toISOString()
      });
      console.log('📄 Sent document number:', currentDocumentNumber, 'to client:', socket.id);
    } catch (error) {
      console.error('❌ Error sending document number:', error);
      const defaultNumber = DocumentNumberService.generateDefaultDocumentNumber();
      socket.emit('documentNumber', { 
        documentNumber: defaultNumber,
        timestamp: new Date().toISOString(),
        isDefault: true
      });
    }
  });

  // Generate and broadcast new document number
  socket.on('generateNewDocumentNumber', async () => {
    try {
      const newDocumentNumber = await DocumentNumberService.generateDocumentNumber();
      
      // Broadcast to all connected clients
      io.emit('documentNumber', { 
        documentNumber: newDocumentNumber,
        timestamp: new Date().toISOString(),
        isNew: true
      });
      
      console.log('🔄 Generated and broadcasted new document number:', newDocumentNumber);
    } catch (error) {
      console.error('❌ Error generating new document number:', error);
      socket.emit('error', { message: 'Failed to generate document number' });
    }
  });

  socket.on('disconnect', () => {
    console.log('📡 Client disconnected from document-service WebSocket:', socket.id);
  });
});

// Broadcast document number updates to all clients
const broadcastDocumentNumber = async () => {
  try {
    const currentDocumentNumber = await DocumentNumberService.getCurrentDocumentNumber();
    io.emit('documentNumber', { 
      documentNumber: currentDocumentNumber,
      timestamp: new Date().toISOString(),
      isBroadcast: true
    });
    console.log('📢 Broadcasted current document number:', currentDocumentNumber);
  } catch (error) {
    console.error('❌ Error broadcasting document number:', error);
  }
};

// Make broadcastDocumentNumber available globally for use in routes
app.locals.broadcastDocumentNumber = broadcastDocumentNumber;
app.locals.io = io;

// Routes
app.use('/documents', documentRoutes);
app.use('/documentsbranches', branchRoutes);
app.use('/sourcepersons', sourcePersonRoutes);
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

    server.listen(PORT, () => {
      console.log(`📄 Document Service running on port ${PORT}`);
      console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
      console.log(`📡 WebSocket server ready for document number broadcasting`);
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