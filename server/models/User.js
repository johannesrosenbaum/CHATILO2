const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  // 🔥 KORRIGIERT: locationEnabled standardmäßig TRUE
  locationEnabled: {
    type: Boolean,
    default: true // 🔥 GEÄNDERT von false zu true
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // 🔥 KORRIGIERT: toJSON Transform für konsistente ID-Felder
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id; // 🔥 Stelle sicher dass id-Feld immer da ist
      return ret;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
