const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
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
  
  // KORRIGIERT: Proper GeoJSON Schema
  lastLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  
  // Location Settings
  locationEnabled: {
    type: Boolean,
    default: true
  },
  locationAccuracy: {
    type: Number,
    default: null
  },
  currentLocationName: {
    type: String,
    default: 'Unknown Location'
  },
  
  // User Settings
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  
  // Profile Data
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Chat Related
  joinedRooms: [{
    type: String
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatische createdAt/updatedAt
});

// KORRIGIERT: Geospatial Index für lastLocation
userSchema.index({ lastLocation: '2dsphere' });

// Middleware um updatedAt zu setzen
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance Methods
userSchema.methods.updateLocation = function(latitude, longitude, accuracy = null, locationName = null) {
  this.lastLocation = {
    type: 'Point',
    coordinates: [longitude, latitude] // MongoDB erwartet [lng, lat]
  };
  this.locationAccuracy = accuracy;
  if (locationName) {
    this.currentLocationName = locationName;
  }
  this.updatedAt = Date.now();
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password; // Password nie zurückgeben
  return user;
};

// Static Methods
userSchema.statics.findNearby = function(longitude, latitude, maxDistance = 10000) {
  return this.find({
    lastLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model('User', userSchema);
