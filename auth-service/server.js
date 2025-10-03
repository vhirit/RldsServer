require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/database');

const app = express();

// Connect to database FIRST
connectDB().then(() => {
  console.log('Database connected, starting server...');
});

// Middleware
app.use(helmet());
// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:3001" || "http://localhost:3003",
//   credentials: true,
// }));
app.use(cors({
    origin: ["http://localhost:3001", "http://localhost:3123", "http://localhost:3000","http://localhost:3003"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes AFTER database connection
const AuRouter = require('./routes/auth');
const adminRoutes = require('./routes/admin');
// Routes
app.use('/customer', AuRouter);
app.use('/admin', adminRoutes);

// Health check with DB status
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;