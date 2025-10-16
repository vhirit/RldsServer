require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080;

// Import document number service
const DocumentNumberService = require('./document-service/services/documentNumberService');

// Helper function to get current date in DD-MM-YYYY format
const getCurrentFormattedDate = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
};

// Import the Express app from app.js
const authRouter = require('./auth-service/server');
const documentRouter = require('./document-service/server');


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
// WebSocket Setup (ws library) - REMOVED to prevent conflicts with Socket.IO
// Using only Socket.IO for WebSocket functionality
// ========================

// ========================
// Socket.IO Setup
// ========================

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3001", "http://localhost:3123", "http://localhost:3000","http://localhost:3003"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New Socket.IO connection:', socket.id);

    // Document Number WebSocket Handlers
    socket.on('requestDocumentNumber', async () => {
        try {
            console.log('📄 Document number requested by client:', socket.id);
            
            // Get the latest document number from database and increment it
            const Document = require('./document-service/models/Document');
            
            // Find the highest document reference number
            const latestDocument = await Document.findOne({
                documentReferenceNumber: { $exists: true, $ne: null }
            })
            .sort({ documentReferenceNumber: -1, createdAt: -1 })
            .select('documentReferenceNumber');

            let nextDocumentNumber;
            
            if (latestDocument && latestDocument.documentReferenceNumber) {
                // Extract sequence number and increment
                const parts = latestDocument.documentReferenceNumber.split('/');
                if (parts.length === 2) {
                    const sequenceNumber = parseInt(parts[0]);
                    if (!isNaN(sequenceNumber)) {
                        const nextSequence = (sequenceNumber + 1).toString().padStart(3, '0');
                        const currentDate = getCurrentFormattedDate();
                        nextDocumentNumber = `${nextSequence}/${currentDate}`;
                    }
                }
            }
            
            // If no documents exist or invalid format, start with 001
            if (!nextDocumentNumber) {
                const currentDate = getCurrentFormattedDate();
                nextDocumentNumber = `001/${currentDate}`;
            }

            socket.emit('documentNumber', { 
                documentNumber: nextDocumentNumber,
                timestamp: new Date().toISOString(),
                isNext: true
            });
            console.log('📄 Sent next document number:', nextDocumentNumber, 'to client:', socket.id);
            
        } catch (error) {
            console.error('❌ Error getting next document number:', error);
            const currentDate = getCurrentFormattedDate();
            const defaultNumber = `001/${currentDate}`;
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
            console.log('🔄 New document number generation requested by client:', socket.id);
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

    // Branch data WebSocket handlers
    socket.on('requestBranches', async () => {
        try {
            console.log('🏢 Branch list requested by client:', socket.id);
            
            // Import Branch model from document-service
            const Branch = require('./document-service/models/branchModel');
            
            // Get all active branches
            const branches = await Branch.find({ status: 'Active' })
                .select('branchName code local nonLocal gst')
                .sort({ branchName: 1 });
            
            socket.emit('branchesData', {
                success: true,
                branches: branches,
                timestamp: new Date().toISOString()
            });
            
            console.log('🏢 Sent branch list to client:', socket.id, '- Count:', branches.length);
            
        } catch (error) {
            console.error('❌ Error fetching branches:', error);
            socket.emit('branchesError', {
                success: false,
                error: error.message
            });
        }
    });

    // Branch creation broadcast handler
    socket.on('branchCreated', (branchData) => {
        try {
            console.log('🎉 New branch created, broadcasting to all clients:', branchData.branchName);
            
            // Broadcast to all connected clients except sender
            socket.broadcast.emit('newBranchAdded', {
                branch: branchData,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Error broadcasting branch creation:', error);
        }
    });

    // Save verification data handler
    socket.on('saveVerificationData', async (verificationData) => {
        try {
            console.log('💾 Saving verification data:', verificationData);
            
            // Import Document model dynamically
            const Document = require('./document-service/models/Document');
            
            let finalDocumentNumber = verificationData.documentReferenceNumber;
            let attempts = 0;
            const maxAttempts = 10;
            
            // Try to save with the provided document number, if duplicate then find next available
            while (attempts < maxAttempts) {
                try {
                    // Check if document number already exists
                    const existingDoc = await Document.findOne({
                        documentReferenceNumber: finalDocumentNumber
                    });
                    
                    if (existingDoc) {
                        console.log('📋 Document number', finalDocumentNumber, 'already exists, finding next available...');
                        // Find the next available number
                        const parts = finalDocumentNumber.split('/');
                        if (parts.length === 2) {
                            const sequenceNumber = parseInt(parts[0]) + 1;
                            finalDocumentNumber = `${sequenceNumber.toString().padStart(3, '0')}/${parts[1]}`;
                        }
                        attempts++;
                        continue;
                    }
                    
                    // Create new document with final document number
                    const newDocument = new Document({
                        documentReferenceNumber: finalDocumentNumber,
                        selectedVerificationTypes: verificationData.selectedVerificationTypes,
                        overallStatus: 'INCOMPLETE',
                        createdAt: new Date(verificationData.timestamp)
                    });

                    const savedDocument = await newDocument.save();
                    
                    console.log('✅ Verification data saved to database:', savedDocument._id);
                    console.log('📄 Final document number used:', finalDocumentNumber);
                    
                    // Send confirmation back to client
                    socket.emit('verificationDataSaved', {
                        success: true,
                        documentId: savedDocument._id,
                        documentReferenceNumber: savedDocument.documentReferenceNumber,
                        finalDocumentNumber: finalDocumentNumber,
                        message: 'Verification data saved successfully'
                    });
                    return; // Exit the function on successful save
                    
                } catch (saveError) {
                    if (saveError.code === 11000) {
                        // Duplicate key error, try next number
                        console.log('🔄 Duplicate key detected, trying next number...');
                        const parts = finalDocumentNumber.split('/');
                        if (parts.length === 2) {
                            const sequenceNumber = parseInt(parts[0]) + 1;
                            finalDocumentNumber = `${sequenceNumber.toString().padStart(3, '0')}/${parts[1]}`;
                        }
                        attempts++;
                        continue;
                    } else {
                        throw saveError; // Re-throw non-duplicate errors
                    }
                }
            }
            
            // If we get here, we've exceeded max attempts
            throw new Error(`Unable to find available document number after ${maxAttempts} attempts`);

        } catch (error) {
            console.error('❌ Error saving verification data:', error);
            socket.emit('verificationDataError', {
                success: false,
                error: error.message
            });
        }
    });

    // Original Socket.IO handlers
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
app.use('/api/document', documentRouter);

// Middleware to attach io to requests for WebSocket broadcasting
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Global branch creation broadcast function
const broadcastBranchCreation = (branchData) => {
    console.log('🌐 Main Server: Broadcasting branch creation to all clients:', branchData.branchName);
    io.emit('newBranchAdded', {
        branch: branchData,
        timestamp: new Date().toISOString()
    });
};

// Make broadcast functions available globally
app.locals.broadcastBranchCreation = broadcastBranchCreation;

// Verification data endpoint
app.post('/api/document/verification', async (req, res) => {
    try {
        const { documentReferenceNumber, selectedVerificationTypes, timestamp } = req.body;
        
        console.log('📝 HTTP API: Saving verification data:', req.body);
        
        // Import Document model
        const Document = require('./document-service/models/Document');
        
        // Create new document with verification data
        const newDocument = new Document({
            documentReferenceNumber,
            selectedVerificationTypes,
            overallStatus: 'INCOMPLETE',
            createdAt: new Date(timestamp)
        });

        const savedDocument = await newDocument.save();
        
        console.log('✅ HTTP API: Verification data saved:', savedDocument._id);
        
        res.json({
            success: true,
            documentId: savedDocument._id,
            documentReferenceNumber: savedDocument.documentReferenceNumber,
            message: 'Verification data saved successfully'
        });

    } catch (error) {
        console.error('❌ HTTP API: Error saving verification data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

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
    console.log(`� Socket.IO running on port ${PORT}`);
    console.log(`� Document number WebSocket service ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});