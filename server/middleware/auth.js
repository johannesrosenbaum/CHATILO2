const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔥 KORRIGIERTE JWT MIDDLEWARE - DEBUGGING & FIX
const auth = async (req, res, next) => {
  try {
    console.log('🔐 AUTH MIDDLEWARE: Processing request');
    console.log('   URL:', req.originalUrl);
    console.log('   Method:', req.method);
    console.log('   Headers:', Object.keys(req.headers));
    
    // 1. Token aus Headers extrahieren
    const authHeader = req.header('Authorization');
    console.log('   Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('   Authorization value:', authHeader ? authHeader.substring(0, 30) + '...' : 'none');
    
    if (!authHeader) {
      console.log('❌ AUTH FAIL: No Authorization header');
      return res.status(401).json({ 
        success: false, 
        message: 'No Authorization header provided' 
      });
    }

    // 2. Bearer Token Format prüfen
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ AUTH FAIL: Invalid Authorization format');
      console.log('   Expected: "Bearer <token>"');
      console.log('   Received:', authHeader.substring(0, 50));
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Authorization format. Expected "Bearer <token>"' 
      });
    }

    // 3. Token extrahieren
    const token = authHeader.substring(7); // Entferne "Bearer "
    console.log('   Extracted token length:', token.length);
    console.log('   Token preview:', token.substring(0, 20) + '...');
    
    if (!token || token.length < 10) {
      console.log('❌ AUTH FAIL: Token too short or empty');
      return res.status(401).json({ 
        success: false, 
        message: 'Token is empty or too short' 
      });
    }

    // 4. JWT Secret prüfen
    const jwtSecret = process.env.JWT_SECRET;
    console.log('   JWT Secret available:', !!jwtSecret);
    console.log('   JWT Secret length:', jwtSecret ? jwtSecret.length : 0);
    
    if (!jwtSecret) {
      console.error('❌ CRITICAL: JWT_SECRET not found in environment');
      return res.status(500).json({ 
        success: false, 
        message: 'Server configuration error' 
      });
    }

    // 5. Token verifizieren mit DEBUGGING
    console.log('🔐 VERIFYING TOKEN...');
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('✅ TOKEN VERIFIED successfully');
      console.log('   Decoded payload:', {
        userId: decoded.userId || decoded.id,
        username: decoded.username,
        exp: decoded.exp,
        iat: decoded.iat
      });
    } catch (jwtError) {
      console.error('❌ JWT VERIFICATION FAILED:');
      console.error('   Error name:', jwtError.name);
      console.error('   Error message:', jwtError.message);
      console.error('   Token used:', token.substring(0, 50) + '...');
      console.error('   Secret used length:', jwtSecret.length);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has expired' 
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token is not valid' 
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Token verification failed: ' + jwtError.message 
        });
      }
    }

    // 6. User ID extrahieren
    const userId = decoded.userId || decoded.id || decoded.user?.id;
    console.log('   Extracted user ID:', userId);
    
    if (!userId) {
      console.log('❌ AUTH FAIL: No user ID in token');
      return res.status(401).json({ 
        success: false, 
        message: 'Token does not contain valid user ID' 
      });
    }

    // 7. User aus Database laden
    console.log('🔍 LOADING USER from database...');
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('❌ AUTH FAIL: User not found in database');
      console.log('   Searched for user ID:', userId);
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ AUTH SUCCESS: User loaded');
    console.log('   User ID:', user._id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);

    // 8. User an Request anhängen
    req.user = user;
    req.userId = user._id;
    req.token = token;
    
    console.log('✅ AUTH MIDDLEWARE: Request authorized for', user.username);
    next();

  } catch (error) {
    console.error('❌ CRITICAL AUTH MIDDLEWARE ERROR:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error in authentication' 
    });
  }
};

module.exports = auth;
