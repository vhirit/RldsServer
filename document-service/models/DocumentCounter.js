// models/DocumentCounter.js
const mongoose = require('mongoose');

const documentCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: 'documentNumber'
  },
  sequence_value: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: String, // Store as DD-MM-YYYY
    default: null
  }
});

// Get current date in DD-MM-YYYY format
documentCounterSchema.statics.getCurrentDate = function() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

// Reset counter if it's a new day
documentCounterSchema.statics.checkAndResetCounter = async function() {
  const currentDate = this.getCurrentDate();
  let counter = await this.findOne({ _id: 'documentNumber' });
  
  if (!counter) {
    // Create new counter starting from 1
    counter = await this.create({ 
      _id: 'documentNumber', 
      sequence_value: 1,
      lastResetDate: currentDate
    });
    return counter;
  }
  
  // Reset counter if it's a new day
  if (counter.lastResetDate !== currentDate) {
    counter.sequence_value = 1;
    counter.lastResetDate = currentDate;
    await counter.save();
    return counter;
  }
  
  return counter;
};

// Get next sequence number (increment after getting)
documentCounterSchema.statics.getNextSequence = async function() {
  const currentDate = this.getCurrentDate();
  
  // First, check and reset counter if needed
  await this.checkAndResetCounter();
  
  // Then increment and get the next sequence
  const counter = await this.findByIdAndUpdate(
    'documentNumber',
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  
  return counter;
};

// Get current sequence without incrementing (for display)
documentCounterSchema.statics.getCurrentSequence = async function() {
  const currentDate = this.getCurrentDate();
  const counter = await this.checkAndResetCounter();
  return counter;
};

module.exports = mongoose.model('DocumentCounter', documentCounterSchema);