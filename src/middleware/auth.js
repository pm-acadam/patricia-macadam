const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');

// Middleware to verify JWT token and authenticate admin
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from cookie first, then fall back to Authorization header
    let token = req.cookies?.adminToken;
    
    if (!token) {
      // Fall back to Authorization header for backward compatibility
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided. Authentication required.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find admin and verify they still exist
    const admin = await Admin.findById(decoded.adminId).select('-password -secretKey -twoFactorAuthSecret');
    
    if (!admin) {
      return res.status(401).json({ 
        message: 'Admin not found. Token invalid.' 
      });
    }

    // Attach admin to request object
    req.admin = admin;
    req.adminId = decoded.adminId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token. Please login again.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Authentication error' 
    });
  }
};

module.exports = { authenticateAdmin };

