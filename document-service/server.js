const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const documentRoutes = require('./routes/documents');
const config = require('./config/database');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'document-service',
        timestamp: new Date().toISOString()
    });
});

// Database connection
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Document Service connected to MongoDB');
    
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
        console.log(`📄 Document Service running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

module.exports = app;