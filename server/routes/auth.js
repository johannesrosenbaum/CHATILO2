const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const auth = require('../middleware/auth'); // Import auth middleware
const authController = require('../controllers/authController'); // Import auth controller
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bild-Dateien sind erlaubt!'), false);
    }
  }
});

// 🔥 KORRIGIERT: Verwende authController für ALLE Auth-Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// GET /api/auth/me - Get current user
router.get('/me', auth, authController.getMe);

// Profil-Update für eingeloggten User
router.put('/me', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email, firstName, lastName, bio, preferences } = req.body;
    const update = {};
    
    if (username) update.username = username;
    if (email) update.email = email;
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;
    if (bio) update.bio = bio;
    if (preferences) {
      // Handle preferences as JSON string or object
      if (typeof preferences === 'string') {
        try {
          update.preferences = JSON.parse(preferences);
        } catch (e) {
          update.preferences = preferences;
        }
      } else {
        update.preferences = preferences;
      }
    }

    // Optional: Validierung (z.B. E-Mail-Format, Username-Länge)
    if (username && username.length < 3) {
      return res.status(400).json({ success: false, message: 'Benutzername muss mindestens 3 Zeichen lang sein' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      update, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User nicht gefunden' });
    }
    
    console.log(`👤 Profile updated for user: ${req.user.username}`);
    console.log(`   Updated fields: ${Object.keys(update).join(', ')}`);
    
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/avatar - Upload avatar
router.post('/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Keine Avatar-Datei bereitgestellt' 
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Update user avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        avatar: avatarUrl,
        avatarMetadata: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          uploadedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');

    console.log(`👤 Avatar uploaded for user: ${req.user.username}`);
    console.log(`   Avatar URL: ${avatarUrl}`);
    console.log(`   File size: ${req.file.size} bytes`);

    res.json({
      success: true,
      avatar: avatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Hochladen des Avatars',
      details: error.message 
    });
  }
});

// NEU: Favoriten-System Routen

// GET /api/auth/favorites - Get user's favorite chat rooms
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorites',
        populate: {
          path: 'createdBy',
          select: 'username'
        }
      })
      .select('favorites');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Benutzer nicht gefunden' 
      });
    }

    console.log(`⭐ Favorites retrieved for user: ${req.user.username}`);
    console.log(`   Number of favorites: ${user.favorites.length}`);

    res.json({
      success: true,
      favorites: user.favorites
    });

  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Abrufen der Favoriten',
      details: error.message 
    });
  }
});

// POST /api/auth/favorites/:roomId - Add chat room to favorites
router.post('/favorites/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Prüfe ob der Chatraum existiert (String-ID)
    const ChatRoom = require('../models/ChatRoom');
    const chatRoom = await ChatRoom.findOne({ _id: roomId });
    
    if (!chatRoom) {
      return res.status(404).json({ 
        success: false, 
        error: 'Chatraum nicht gefunden' 
      });
    }

    // Prüfe ob der Chatraum bereits in den Favoriten ist
    const user = await User.findById(req.user._id);
    if (user.favorites.includes(roomId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chatraum ist bereits in den Favoriten' 
      });
    }

    // Füge Chatraum zu Favoriten hinzu
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $addToSet: { favorites: roomId },
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
      path: 'favorites',
      populate: {
        path: 'createdBy',
        select: 'username'
      }
    });

    console.log(`⭐ Chatroom ${chatRoom.name} added to favorites for user: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Chatraum zu Favoriten hinzugefügt',
      favorites: updatedUser.favorites
    });

  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Hinzufügen zu Favoriten',
      details: error.message 
    });
  }
});

// DELETE /api/auth/favorites/:roomId - Remove chat room from favorites
router.delete('/favorites/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Entferne Chatraum aus Favoriten
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        $pull: { favorites: roomId },
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
      path: 'favorites',
      populate: {
        path: 'createdBy',
        select: 'username'
      }
    });

    console.log(`⭐ Chatroom ${roomId} removed from favorites for user: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Chatraum aus Favoriten entfernt',
      favorites: updatedUser.favorites
    });

  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Fehler beim Entfernen aus Favoriten',
      details: error.message 
    });
  }
});

module.exports = router;
