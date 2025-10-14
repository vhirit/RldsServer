const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');

const authMiddleware = (req, res, next) => {
  try {
    console.log('Auth middleware - Headers:', req.headers);
    
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.headers['x-auth-token'] || 
                  req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    console.log('Token found:', token.substring(0, 20) + '...');

    try {
      // Try to verify with JWT_SECRET if available, otherwise just decode
      let decoded;
      if (process.env.JWT_SECRET) {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } else {
        console.log('No JWT_SECRET found, using decode only (not secure for production)');
        decoded = jwt.decode(token);
      }
      
      console.log('Decoded token:', decoded);
      
      if (!decoded) {
        console.log('Invalid token - could not decode');
        return errorResponse(res, 'Invalid token.', 401);
      }

      // Extract user info from token
      req.user = {
        id: decoded.id || decoded.userId || decoded._id,
        email: decoded.email,
        name: decoded.name,
        ...decoded
      };

      console.log('User set in request:', req.user);
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return errorResponse(res, 'Invalid token.', 401);
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    errorResponse(res, 'Server error in authentication', 500);
  }
};

module.exports = { authMiddleware };