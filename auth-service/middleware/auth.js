const jwtService = require('../services/jwtService');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Check if token is valid in sessions
        const isValid = await jwtService.validateToken(token);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token.'
            });
        }

        // Verify JWT token
        const decoded = jwtService.verifyToken(token);
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid token.'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};

module.exports = { authenticate, authorize };