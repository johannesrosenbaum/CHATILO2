const mongoose = require('mongoose');

const pushNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roomId: {
    type: String,
    required: true,
    index: true
  },
  lastNotificationSent: {
    type: Date,
    default: null
  },
  notificationsSent: {
    type: Number,
    default: 0
  },
  lastRoomVisit: {
    type: Date,
    default: null
  },
  canSendNotification: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index für effiziente Abfragen
pushNotificationSchema.index({ userId: 1, roomId: 1 }, { unique: true });

// Index für 24h Cleanup
pushNotificationSchema.index({ lastNotificationSent: 1 });

module.exports = mongoose.model('PushNotification', pushNotificationSchema);
