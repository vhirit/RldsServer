const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class EncryptionService {
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(12);
        return bcrypt.hash(password, salt);
    }

    async comparePassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    hashResetToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}

module.exports = new EncryptionService();