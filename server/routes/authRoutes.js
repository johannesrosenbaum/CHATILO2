const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    // Dummy User für Testing wenn keine DB verfügbar
    if (email === 'johannes.rosenbaum92@gmail.com' && password === 'test123') {
      const token = jwt.sign(
        { id: '683df6ed0bfafd5f833666b1', email: email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      console.log('✅ Login successful for:', email);
      
      return res.json({
        success: true,
        token,
        user: {
          id: '683df6ed0bfafd5f833666b1',
          _id: '683df6ed0bfafd5f833666b1',
          username: 'testrr',
          email: email,
          locationEnabled: true
        }
      });
    }
    
    // TODO: Echte DB-Implementierung hier
    return res.status(401).json({ 
      success: false, 
      message: 'Use johannes.rosenbaum92@gmail.com / test123 for testing' 
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    console.log('📝 Registration attempt for:', email);
    
    // TODO: Echte DB-Implementierung
    res.status(501).json({ 
      success: false, 
      message: 'Registration not implemented yet' 
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get Current User Route
router.get('/me', auth, async (req, res) => {
  try {
    // Dummy User Response
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: 'testrr',
        email: req.user.email,
        locationEnabled: true
      }
    });
    
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
