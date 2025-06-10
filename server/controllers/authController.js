// c:\Users\Johannes\CHATILO2\chatilo-app\src\controllers\authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      locationEnabled: true
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Response ohne password
    const userResponse = {
      _id: user._id,
      id: user._id,
      username: user.username,
      email: user.email,
      locationEnabled: user.locationEnabled,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login - KORRIGIERT MIT DEBUGGING
const login = async (req, res) => {
  try {
    console.log('🔐 LOGIN ATTEMPT for:', req.body.email);
    
    const { email, password } = req.body;

    // User finden
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ LOGIN FAIL: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Password prüfen
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ LOGIN FAIL: Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 🔥 KORRIGIERTE TOKEN GENERIERUNG mit DEBUGGING
    console.log('🔐 GENERATING TOKEN...');
    console.log('   User ID:', user._id);
    console.log('   Username:', user.username);
    console.log('   JWT Secret available:', !!process.env.JWT_SECRET);
    console.log('   JWT Secret length:', process.env.JWT_SECRET?.length || 0);

    // KORRIGIERTE Token Payload - KONSISTENT mit Middleware
    const tokenPayload = {
      userId: user._id,  // WICHTIG: userId (nicht id)
      username: user.username,
      email: user.email
    };
    
    console.log('   Token payload:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { 
        expiresIn: '24h',  // 24 Stunden Token-Gültigkeit
        issuer: 'chatilo-app',
        audience: 'chatilo-users'
      }
    );

    console.log('✅ TOKEN GENERATED successfully');
    console.log('   Token length:', token.length);
    console.log('   Token preview:', token.substring(0, 20) + '...');

    // User ohne Password
    const userWithoutPassword = {
      _id: user._id,
      id: user._id,  // Für Kompatibilität
      username: user.username,
      email: user.email,
      locationEnabled: user.locationEnabled,
      createdAt: user.createdAt
    };

    console.log('✅ LOGIN SUCCESS for:', user.username);
    console.log('   Response user object:', userWithoutPassword);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ CRITICAL LOGIN ERROR:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get current user - KORRIGIERT MIT DEBUGGING
const getMe = async (req, res) => {
  try {
    console.log('🔧 getMe: Processing /auth/me request');
    console.log('   User from middleware:', req.user?.username);
    console.log('   User ID from middleware:', req.user?._id);
    
    if (!req.user) {
      console.log('❌ getMe: No user attached to request');
      return res.status(401).json({ 
        success: false, 
        message: 'User not found in request' 
      });
    }

    // 🔥 KORRIGIERT: Detaillierte User-Response mit ALLEN nötigen Feldern
    const userResponse = {
      _id: req.user._id,
      id: req.user._id, // 🔥 WICHTIG: id-Feld hinzufügen für Frontend
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      locationEnabled: req.user.locationEnabled !== false, // 🔥 Default true
      notificationsEnabled: req.user.notificationsEnabled !== false, // Default true
      isActive: req.user.isActive !== false, // Default true
      lastSeen: req.user.lastSeen || new Date(),
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    console.log('🔧 getMe: Sending user response:');
    console.log('   Response _id:', userResponse._id);
    console.log('   Response id:', userResponse.id);
    console.log('   Response username:', userResponse.username);
    console.log('   Response locationEnabled:', userResponse.locationEnabled);

    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('❌ getMe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};