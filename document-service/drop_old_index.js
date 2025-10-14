const mongoose = require('mongoose');

async function dropOldIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DOCUMENT_SERVICE_DB || 'mongodb://localhost:27017/document-service');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('verifications');

    // Drop the old unique index on documentNumber if it exists
    try {
      await collection.dropIndex('documentNumber_1');
      console.log('✅ Dropped old unique index on documentNumber');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('ℹ️ Old unique index on documentNumber not found (already dropped)');
      } else {
        console.log('⚠️ Error dropping old index:', error.message);
      }
    }

    // List current indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
    });

    await mongoose.disconnect();
    console.log('✅ Database cleanup completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

dropOldIndex();