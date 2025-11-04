const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['neighborhood', 'regional', 'event', 'institution', 'global', 'location', 'school'],
    default: 'neighborhood'
  },
  subType: {
    type: String,
    enum: ['regional', 'city', 'neighborhood', 'general', 'global', 'event', 'school', 'university', 'college'],
    default: 'neighborhood'
  },
  // Erweiterte Location-Informationen
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    radius: Number // Radius in Metern für den Chatraum
  },
  // Event-spezifische Felder
  eventDetails: {
    startDate: Date,
    endDate: Date,
    eventType: String, // 'festival', 'meetup', 'concert', etc.
    organizer: String,
    maxParticipants: Number
  },
  // Tags für Events und allgemeine Kategorisierung
  tags: [{
    type: String,
    trim: true
  }],
  // Cover Image für Events
  coverImage: {
    type: String, // Path zum Bild
    default: null
  },
  // Institution-spezifische Felder
  institutionDetails: {
    name: String,
    type: String, // 'school', 'university', 'library', etc.
    website: String,
    contactInfo: String
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: {
    type: String,
    default: ''
  },
  // Galerie-Informationen
  gallery: {
    totalImages: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    lastMediaUpload: { type: Date, default: Date.now }
  },
  // Chatraum-Einstellungen
  settings: {
    isPublic: { type: Boolean, default: true },
    allowMedia: { type: Boolean, default: true },
    allowImages: { type: Boolean, default: true },
    allowVideos: { type: Boolean, default: true },
    allowFiles: { type: Boolean, default: true },
    maxFileSize: { type: Number, default: 10 * 1024 * 1024 }, // 10MB
    autoArchive: { type: Boolean, default: false }
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
    ref: 'User',
    required: false,
    default: null
  },
  // Statistiken
  stats: {
    totalMessages: { type: Number, default: 0 },
    totalMedia: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index für Geo-Queries und Performance
chatRoomSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
chatRoomSchema.index({ type: 1, subType: 1 });
chatRoomSchema.index({ isActive: 1 });
chatRoomSchema.index({ 'location.city': 1 });
chatRoomSchema.index({ 'eventDetails.startDate': 1, 'eventDetails.endDate': 1 });
chatRoomSchema.index({ createdAt: -1 });
chatRoomSchema.index({ tags: 1 }); // Index für Tag-basierte Suchen

// Virtual für memberCount
chatRoomSchema.virtual('memberCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Ensure virtual fields are serialized
chatRoomSchema.set('toJSON', { virtuals: true });
chatRoomSchema.set('toObject', { virtuals: true });

// Statische Methoden für Chatraum-Erstellung
chatRoomSchema.statics.createNeighborhoodRoom = function(location, city) {
  const roomId = `neighborhood_${city}_${Math.floor(location.latitude * 1000)}_${Math.floor(location.longitude * 1000)}`;
  return this.findOneAndUpdate(
    { roomId: roomId },
    {
      roomId: roomId,
      name: `Nachbarschaft ${city}`,
      type: 'neighborhood',
      subType: 'neighborhood',
      location: {
        ...location,
        city: city,
        radius: 2000 // 2km für Nachbarschaft
      },
      settings: {
        isPublic: true,
        allowMedia: true,
        allowImages: true,
        allowVideos: true,
        allowFiles: true
      }
    },
    { upsert: true, new: true }
  );
};

chatRoomSchema.statics.createRegionalRoom = function(location, city) {
  const roomId = `regional_${city}`;
  return this.findOneAndUpdate(
    { roomId: roomId },
    {
      roomId: roomId,
      name: `Regional ${city}`,
      type: 'regional',
      subType: 'regional',
      location: {
        ...location,
        city: city,
        radius: 25000 // 25km für Region
      },
      settings: {
        isPublic: true,
        allowMedia: true,
        allowImages: true,
        allowVideos: true,
        allowFiles: true
      }
    },
    { upsert: true, new: true }
  );
};

chatRoomSchema.statics.createEventRoom = function(eventData) {
  const roomId = `event_${eventData.name.replace(/\s+/g, '_')}_${Date.now()}`;
  return this.findOneAndUpdate(
    { roomId: roomId },
    {
      roomId: roomId,
      name: eventData.name,
      type: 'event',
      subType: eventData.eventType || 'event',
      location: eventData.location,
      eventDetails: {
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        eventType: eventData.eventType,
        organizer: eventData.organizer,
        maxParticipants: eventData.maxParticipants
      },
      description: eventData.description,
      tags: eventData.tags || [],
      coverImage: eventData.coverImage,
      settings: {
        isPublic: true,
        allowMedia: true,
        allowImages: true,
        allowVideos: true,
        allowFiles: true
      }
    },
    { upsert: true, new: true }
  );
};

chatRoomSchema.statics.createInstitutionRoom = function(institutionData) {
  const roomId = `institution_${institutionData.type}_${institutionData.name.replace(/\s+/g, '_')}`;
  return this.findOneAndUpdate(
    { roomId: roomId },
    {
      roomId: roomId,
      name: institutionData.name,
      type: 'institution',
      subType: 'institution',
      location: institutionData.location,
      institutionDetails: {
        name: institutionData.name,
        type: institutionData.type,
        website: institutionData.website,
        contactInfo: institutionData.contactInfo
      },
      description: institutionData.description,
      settings: {
        isPublic: true,
        allowMedia: true,
        allowImages: true,
        allowVideos: true,
        allowFiles: true
      }
    },
    { upsert: true, new: true }
  );
};

// Helper method to find nearby rooms
chatRoomSchema.statics.findNearbyRooms = async function(latitude, longitude, radius = 5000, limit = 10) {
  return this.find({
    'location.latitude': {
      $gte: latitude - (radius / 111320),
      $lte: latitude + (radius / 111320)
    },
    'location.longitude': {
      $gte: longitude - (radius / (111320 * Math.cos(latitude * Math.PI / 180))),
      $lte: longitude + (radius / (111320 * Math.cos(latitude * Math.PI / 180)))
    },
    isActive: true
  })
  .populate('createdBy', 'username')
  .sort({ lastActivity: -1 })
  .limit(limit);
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
