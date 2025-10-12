// config/db.js - Enhanced version
const mongoose = require('mongoose');

class DatabaseManager {
  constructor() {
    this.connections = new Map();
    this.defaultOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    };
  }

  async connectServiceDB(serviceName, connectionString, options = {}) {
    try {
      // Check if connection already exists and is healthy
      if (this.connections.has(serviceName)) {
        const existingConnection = this.connections.get(serviceName);
        if (existingConnection.readyState === 1) {
          return existingConnection;
        } else {
          // Remove stale connection
          this.connections.delete(serviceName);
        }
      }

      // Create new connection with merged options
      const connectionOptions = { ...this.defaultOptions, ...options };
      const connection = mongoose.createConnection(connectionString, connectionOptions);

      // Store connection
      this.connections.set(serviceName, connection);

      // Wait for connection with timeout
      await Promise.race([
        connection.asPromise(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 15000)
        )
      ]);
      
      console.log(`✅ ${serviceName} Database connected successfully`);
      
      // Enhanced event handlers
      connection.on('error', (err) => {
        console.error(`❌ ${serviceName} Database connection error:`, err);
        this.connections.delete(serviceName);
      });

      connection.on('disconnected', () => {
        console.log(`🔌 ${serviceName} Database disconnected`);
        this.connections.delete(serviceName);
      });

      connection.on('reconnected', () => {
        console.log(`🔁 ${serviceName} Database reconnected`);
      });

      return connection;
    } catch (error) {
      console.error(`❌ ${serviceName} Database connection failed:`, error.message);
      this.connections.delete(serviceName);
      throw error;
    }
  }

  // Add connection health check
  async healthCheck(serviceName) {
    const connection = this.connections.get(serviceName);
    if (!connection) {
      return { status: 'disconnected', service: serviceName };
    }
    
    try {
      // Simple ping to check connection
      await connection.db.admin().ping();
      return { 
        status: 'connected', 
        service: serviceName,
        readyState: connection.readyState 
      };
    } catch (error) {
      return { 
        status: 'error', 
        service: serviceName,
        error: error.message 
      };
    }
  }

  // Add method to get all connections status
  async getAllConnectionsStatus() {
    const statuses = [];
    for (const [serviceName] of this.connections) {
      statuses.push(await this.healthCheck(serviceName));
    }
    return statuses;
  }

  getConnection(serviceName) {
    return this.connections.get(serviceName);
  }

  async disconnectServiceDB(serviceName) {
    try {
      const connection = this.connections.get(serviceName);
      if (connection) {
        await connection.close();
        this.connections.delete(serviceName);
        console.log(`🔌 ${serviceName} Database disconnected`);
      }
    } catch (error) {
      console.error(`Error disconnecting ${serviceName}:`, error);
      throw error;
    }
  }

  async disconnectAll() {
    const disconnectPromises = [];
    for (const [serviceName] of this.connections) {
      disconnectPromises.push(this.disconnectServiceDB(serviceName));
    }
    
    await Promise.allSettled(disconnectPromises);
  }

  isConnected(serviceName) {
    const connection = this.connections.get(serviceName);
    return connection && connection.readyState === 1;
  }
}

// Create singleton instance
const dbManager = new DatabaseManager();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Closing database connections...');
  await dbManager.disconnectAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM. Closing database connections...');
  await dbManager.disconnectAll();
  process.exit(0);
});

module.exports = dbManager;