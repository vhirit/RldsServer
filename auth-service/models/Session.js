const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    invalidated: {
        type: Boolean,
        default: false
    },
    invalidatedAt: Date,
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Create TTL index for automatic expiration
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', sessionSchema);