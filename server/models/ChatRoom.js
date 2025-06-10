const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['location', 'event', 'global'],
    default: 'location'
  },
  subType: {
    type: String,
    enum: ['neighborhood', 'regional', 'city', 'general'],
    default: 'general'
  },
  participants: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Index für Geo-Queries
chatRoomSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
chatRoomSchema.index({ type: 1, subType: 1 });
chatRoomSchema.index({ isActive: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
