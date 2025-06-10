const express = require('express');
const router = express.Router();
const AdminSettings = require('../models/AdminSettings');

// Admin-Authentifizierung Middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers['admin-token'] || req.query.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Admin token required' });
    }

    const validToken = await AdminSettings.getSetting('admin.accessToken', 'chatilo_admin_2024');
    
    if (token !== validToken) {
      return res.status(403).json({ message: 'Invalid admin token' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Admin auth error', error: error.message });
  }
};

// Alle Admin-Einstellungen abrufen
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await AdminSettings.find({}).lean();
    console.log('📊 Admin viewing settings');
    res.json(settings);
  } catch (error) {
    console.error('❌ Error fetching admin settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Einzelne Einstellung abrufen
router.get('/settings/:key', adminAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const value = await AdminSettings.getSetting(key);
    
    if (value === null) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json({ key, value });
  } catch (error) {
    console.error('❌ Error getting setting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Einstellung aktualisieren
router.put('/settings/:key', adminAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const setting = await AdminSettings.findOneAndUpdate(
      { key },
      { value, updatedBy: 'admin', updatedAt: new Date() },
      { new: true, upsert: true }
    );

    console.log(`⚙️ Admin updated setting: ${key} = ${value}`);
    res.json(setting);
  } catch (error) {
    console.error('❌ Error updating setting:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// System-Status für Admin
router.get('/status', adminAuth, async (req, res) => {
  try {
    const ChatRoom = require('../models/ChatRoom');
    const User = require('../models/User');
    const Message = require('../models/Message');

    const [roomCount, userCount, messageCount] = await Promise.all([
      ChatRoom.countDocuments({}),
      User.countDocuments({}),
      Message.countDocuments({})
    ]);

    const status = {
      timestamp: new Date().toISOString(),
      rooms: roomCount,
      users: userCount,
      messages: messageCount,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    console.log('📊 Admin checking system status');
    res.json(status);
  } catch (error) {
    console.error('❌ Error getting system status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
