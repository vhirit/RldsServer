require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;


// Import the Express app from app.js
const authRouter = require('./auth-service/server');
const doucntRouter = require('./document-service/server');
// ========================
// Middleware Setup
// ========================

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: ["http://localhost:3001", "http://localhost:3123", "http://localhost:3000","http://localhost:3003"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ========================
// WebSocket Setup (ws library)
// ========================

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
        console.log('Received WebSocket message:', message.toString());
        
        // Broadcast to all clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(`Echo: ${message}`);
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    // Send welcome message
    ws.send('Welcome to WebSocket server!');
});

// ========================
// Socket.IO Setup
// ========================

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3001", "http://localhost:3123", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New Socket.IO connection:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
        socket.to(room).emit('user_joined', { userId: socket.id });
    });

    socket.on('send_message', (data) => {
        console.log('Message received:', data);
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Socket.IO disconnected:', socket.id);
    });
});

// ========================
// API Routes

app.use('/api/user', authRouter);
app.use('/api/document', doucntRouter);
// ========================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// WebSocket info endpoint
app.get('/api/websocket-info', (req, res) => {
    res.json({
        websocket: {
            connections: wss.clients.size,
            socketIO: io.engine.clientsCount
        }
    });
});

// Sample API routes
app.get('/api/users', (req, res) => {
    res.json({
        message: 'Get all users',
        users: [
            { id: 1, name: 'John Doe' },
            { id: 2, name: 'Jane Smith' }
        ]
    });
});

app.post('/api/users', (req, res) => {
    const user = req.body;
    res.json({
        message: 'User created successfully',
        user: { id: Date.now(), ...user }
    });
});

// ========================
// Error Handling (FIXED)
// ========================

// 404 handler - FIXED: Use proper path pattern
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});

// ========================
// Server Startup
// ========================

server.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Server started successfully!');
    console.log(`📍 Local: http://localhost:${PORT}`);  
    console.log(`🔌 WebSocket running on port ${PORT}`);
    console.log(`📡 Socket.IO running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});