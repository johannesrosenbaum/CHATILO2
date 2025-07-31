const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');

// GET /admin/stats - Übersichtliche Statistiken
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const chatRoomCount = await ChatRoom.countDocuments();
    const messageCount = await Message.countDocuments();
    const activeRooms = await ChatRoom.find({ active: true }).countDocuments();
    res.json({
      userCount,
      chatRoomCount,
      messageCount,
      activeRooms
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
