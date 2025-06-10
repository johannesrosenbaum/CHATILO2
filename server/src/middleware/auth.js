const jwt = require('jsonwebtoken');

// KONSISTENTER JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'chatilo_super_secret_key_2024_production_ready';

// ERWEITERTE DEBUGGING Token Authentication
function authenticateToken(req, res, next) {
  console.log('🔧 DETAILED Token authentication:');
  console.log('   JWT_SECRET available:', !!process.env.JWT_SECRET);
  console.log('   Using secret source:', process.env.JWT_SECRET ? 'environment' : 'fallback');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('❌ No token provided');
    return res.status(401).json({ 
      message: 'Access token required',
      code: 'NO_TOKEN'
    });
  }

  try {
    console.log('🔧 DEBUG: Verifying token with consistent secret...');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token verified successfully:');
    console.log('   User ID:', decoded.userId);
    console.log('   Username:', decoded.username);
    
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('❌ DETAILED Token verification error:');
    console.error('   Error message:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Secret used:', JWT_SECRET === process.env.JWT_SECRET ? 'environment' : 'fallback');
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({ 
      message: 'Token verification failed',
      code: 'TOKEN_ERROR'
    });
  }
}

module.exports = { authenticateToken };
