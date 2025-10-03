const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const Session = require('../models/Session');

class JwtService {
    generateToken(user, options = {}) {
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
            ...options
        });

        return token;
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, jwtConfig.secret);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async createSession(user, token) {
        const decoded = this.verifyToken(token);
        
        const session = new Session({
            token,
            userId: user._id,
            expiresAt: new Date(decoded.exp * 1000)
        });

        await session.save();
        return session;
    }

    async invalidateToken(token) {
        try {
            const session = await Session.findOne({ token });
            if (session) {
                session.invalidated = true;
                session.invalidatedAt = new Date();
                await session.save();
            }
        } catch (error) {
            throw new Error('Token invalidation failed');
        }
    }

    async validateToken(token) {
        try {
            const session = await Session.findOne({ 
                token, 
                invalidated: false,
                expiresAt: { $gt: new Date() }
            });
            return !!session;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new JwtService();