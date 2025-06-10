const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Standard-Einstellungen
const defaultSettings = {
  'radius.regional': { value: 20000, description: 'Regional chat radius in meters' },
  'radius.neighborhood': { value: 5000, description: 'Neighborhood chat radius in meters (reduced to 5km)' },
  'radius.events': { value: 15000, description: 'Event discovery radius in meters' },
  'radius.city': { value: 8000, description: 'City chat radius in meters' },
  'location.cacheMinutes': { value: 5, description: 'Minutes to cache user location before re-checking' },
  'location.accuracyThreshold': { value: 500, description: 'GPS accuracy threshold in meters for room updates' },
  'location.maxDriftDistance': { value: 1000, description: 'Maximum allowed location drift in meters before re-evaluation' },
  'chat.maxRoomsPerUser': { value: 20, description: 'Maximum rooms per user' },
  'events.maxDuration': { value: 30, description: 'Maximum event duration in days' },
  'admin.accessToken': { value: 'chatilo_admin_2024', description: 'Admin access token for settings panel' }
};

// Initialisiere Standard-Einstellungen
adminSettingsSchema.statics.initializeDefaults = async function() {
  for (const [key, config] of Object.entries(defaultSettings)) {
    const exists = await this.findOne({ key });
    if (!exists) {
      await this.create({
        key,
        value: config.value,
        description: config.description
      });
    }
  }
};

// Hol Einstellung (mit Cache)
adminSettingsSchema.statics.getSetting = async function(key, defaultValue = null) {
  try {
    const setting = await this.findOne({ key }).lean();
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
