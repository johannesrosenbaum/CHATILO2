const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
// 🔥 KORRIGIERT: Verwende 'auth' statt 'authenticateToken'
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// CORRECT IMPORT - Fix the missing function
const { 
  getPreciseLocation, 
  getNearbyPlaces, 
  getStructuredLocationAnalysis 
} = require('../utils/geocoding');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get nearby rooms based on location - KORRIGIERT
router.get('/rooms/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    console.log(`📍 Fetching STRUCTURED rooms for: ${latitude}, ${longitude}`);
    console.log(`🔑 Authenticated user: ${req.user.username} (${req.user._id})`);
    
    // Verwende die korrekt importierte Funktion
    const analysis = await getStructuredLocationAnalysis(
      parseFloat(latitude), 
      parseFloat(longitude)
    );
    
    console.log(`✅ STRUCTURED analysis complete:`);
    console.log(`   Location: ${analysis.location.name}`);
    console.log(`   Places in radius: ${analysis.placesInRadius.length}`);
    console.log(`   Neighborhoods: ${analysis.chatRoomStructure.neighborhoods.length}`);
    
    // Create structured chat rooms based on analysis
    const structuredRooms = [];
    
    // Add neighborhood rooms (up to 5)
    analysis.chatRoomStructure.neighborhoods.slice(0, 5).forEach((place, index) => {
      structuredRooms.push({
        _id: `room_${place.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${index}`,
        name: place.name,
        description: `Lokaler Chat für ${place.name}`,
        location: {
          type: 'Point',
          coordinates: [place.lng, place.lat]
        },
        distance: place.distance,
        distanceKm: Math.round(place.distance / 1000 * 10) / 10,
        participants: Math.floor(Math.random() * 20) + 5, // Simulate participants
        isPublic: true,
        maxParticipants: place.type === 'city' ? 100 : 50,
        radius: place.radius || 2000,
        type: 'location', // Ändere von 'neighborhood' zu 'location'
        placeType: place.type,
        createdAt: new Date(),
        isActive: true
      });
    });
    
    console.log(`🏘️ Created ${structuredRooms.length} structured neighborhood rooms`);
    
    res.json({
      success: true,
      rooms: structuredRooms,
      location: analysis.location,
      totalPlacesFound: analysis.placesInRadius.length,
      searchRadius: analysis.radiusConfig.neighborhood
    });
    
  } catch (error) {
    console.error('❌ Error fetching structured rooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch nearby rooms',
      details: error.message 
    });
  }
});

// NEUE HILFSFUNKTION: Eindeutige Room-ID generieren
function generateRoomId(placeName, type = 'neighborhood') {
  // Normalisiere Ortsnamen zu eindeutigen IDs
  const normalizedName = placeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')  // Alle Sonderzeichen zu Unterstrichen
    .replace(/_+/g, '_')          // Mehrfache Unterstriche reduzieren
    .replace(/^_|_$/g, '');       // Unterstriche am Anfang/Ende entfernen
  
  return `${type}_${normalizedName}`;
}

// NEUE HILFSFUNKTION: Room in DB finden oder erstellen
async function findOrCreateChatRoom(roomData) {
  try {
    const ChatRoom = require('../models/ChatRoom');
    
    // 1. Prüfe ob Room bereits existiert
    let existingRoom = await ChatRoom.findById(roomData._id);
    
    if (existingRoom) {
      console.log(`✅ EXISTING ROOM FOUND: ${roomData.name} (ID: ${roomData._id})`);
      console.log(`   Created: ${existingRoom.createdAt}`);
      console.log(`   Last activity: ${existingRoom.lastActivity || 'never'}`);
      
      // Aktualisiere nur Aktivitätsdaten
      existingRoom.lastActivity = new Date();
      existingRoom.isActive = true;
      
      // Optional: Aktualisiere Teilnehmerzahl basierend auf aktuellen Socket-Verbindungen
      // (Dies könnte durch Socket-Management erfolgen)
      
      await existingRoom.save();
      console.log(`🔄 ROOM UPDATED: ${roomData.name}`);
      
      return {
        _id: existingRoom._id,
        id: existingRoom._id,
        name: existingRoom.name,
        type: existingRoom.type,
        subType: existingRoom.subType,
        participants: existingRoom.participants || 0,
        description: existingRoom.description,
        location: existingRoom.location,
        distance: roomData.distance, // Aktuelle Distanz vom User
        isActive: true,
        createdAt: existingRoom.createdAt,
        lastActivity: existingRoom.lastActivity
      };
    } else {
      console.log(`🆕 CREATING NEW ROOM: ${roomData.name} (ID: ${roomData._id})`);
      
      // 2. Erstelle neuen Room
      const newRoom = new ChatRoom({
        _id: roomData._id,
        name: roomData.name,
        type: roomData.type,
        subType: roomData.subType,
        participants: roomData.participants || 0,
        description: roomData.description,
        location: roomData.location,
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date(),
        createdBy: 'system', // System-generierte Rooms
        maxParticipants: roomData.type === 'city' ? 100 : 50,
        isPublic: true
      });
      
      const savedRoom = await newRoom.save();
      console.log(`✅ NEW ROOM CREATED: ${roomData.name} (DB ID: ${savedRoom._id})`);
      
      return {
        _id: savedRoom._id,
        id: savedRoom._id,
        name: savedRoom.name,
        type: savedRoom.type,
        subType: savedRoom.subType,
        participants: savedRoom.participants,
        description: savedRoom.description,
        location: savedRoom.location,
        distance: roomData.distance,
        isActive: true,
        createdAt: savedRoom.createdAt,
        lastActivity: savedRoom.lastActivity
      };
    }
  } catch (error) {
    console.error(`❌ Error finding/creating room ${roomData.name}:`, error.message);
    console.error('   Error stack:', error.stack);
    
    // Fallback: Gib die ursprünglichen Daten zurück
    return roomData;
  }
}

// POST /api/chat/rooms/nearby - Find nearby rooms - KORRIGIERT FÜR PERSISTENCE
router.post('/rooms/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    console.log(`🔍 Finding nearby rooms for: ${latitude}, ${longitude} (radius: ${radius}m)`);
    console.log(`👤 User: ${req.user.username} (${req.user._id})`);
    
    // Get structured analysis from geocoding
    const analysis = await getStructuredLocationAnalysis(latitude, longitude);
    
    if (!analysis || !analysis.placesInRadius) {
      return res.status(500).json({ error: 'Failed to analyze location' });
    }

    console.log(`📍 Location analysis SUCCESS: ${analysis.location.name}`);
    console.log(`📍 Places found: ${analysis.placesInRadius.length}`);

    // Generate rooms ONLY from real places found in analysis
    const persistentRooms = [];
    
    // 1. Neighborhood rooms (0-5km) - MIT PERSISTENTER SPEICHERUNG
    const neighborhoodPlaces = analysis.placesInRadius.filter(p => p.distance <= 5000);
    
    console.log(`🏘️ Processing ${neighborhoodPlaces.length} neighborhood places:`);
    
    for (const place of neighborhoodPlaces) {
      // 🔥 KRITISCH: Eindeutige Room-ID basierend auf Ortsname
      const roomId = generateRoomId(place.name, 'neighborhood');
      
      console.log(`🔧 Processing place: ${place.name} -> Room ID: ${roomId}`);
      
      const roomData = {
        _id: roomId,
        id: roomId,
        name: `${place.name} Chat`,
        type: 'location',
        subType: 'neighborhood',
        participants: Math.floor(Math.random() * 20) + 1, // Temporär - sollte real aus Socket-Management kommen
        description: `Lokaler Chat für ${place.name}`,
        location: {
          latitude: place.lat,
          longitude: place.lng,
          type: 'Point',
          coordinates: [place.lng, place.lat] // GeoJSON Format [lng, lat]
        },
        distance: Math.round(place.distance / 1000),
        isActive: true
      };
      
      // 🔥 KRITISCH: Verwende findOrCreateChatRoom für Persistence
      const persistentRoom = await findOrCreateChatRoom(roomData);
      persistentRooms.push(persistentRoom);
    }
    
    // 2. Regional rooms (5-20km) - MIT PERSISTENTER SPEICHERUNG
    const regionalPlaces = analysis.placesInRadius.filter(p => p.distance > 5000 && p.distance <= 20000);
    
    console.log(`🌍 Processing ${regionalPlaces.length} regional places:`);
    for (const place of regionalPlaces) {
      const roomId = generateRoomId(place.name, 'regional');
      
      console.log(`🔧 Processing regional place: ${place.name} -> Room ID: ${roomId}`);
      
      const roomData = {
        _id: roomId,
        id: roomId,
        name: `${place.name} Regional`,
        type: 'location',
        subType: 'regional',
        participants: Math.floor(Math.random() * 30) + 1,
        description: `Regionaler Chat für ${place.name}`,
        location: {
          latitude: place.lat,
          longitude: place.lng,
          type: 'Point',
          coordinates: [place.lng, place.lat]
        },
        distance: Math.round(place.distance / 1000),
        isActive: true
      };
      
      const persistentRoom = await findOrCreateChatRoom(roomData);
      persistentRooms.push(persistentRoom);
    }

    console.log(`✅ Generated ${persistentRooms.length} persistent nearby rooms from structured analysis`);
    persistentRooms.forEach(room => {
      console.log(`   📍 ${room.name} (${room.distance}km, ${room.participants} participants) [${room._id}]`);
    });

    res.json(persistentRooms);

  } catch (error) {
    console.error('❌ Error finding nearby rooms:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// NEUE ROUTE: Room-Details abrufen
router.get('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const ChatRoom = require('../models/ChatRoom');
    
    const room = await ChatRoom.findById(roomId);
    
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        error: 'Room not found' 
      });
    }

    console.log(`📍 Room details requested: ${room.name} (${roomId})`);

    res.json({
      success: true,
      room: {
        _id: room._id,
        id: room._id,
        name: room.name,
        type: room.type,
        subType: room.subType,
        description: room.description,
        participants: room.participants || 0,
        location: room.location,
        isActive: room.isActive,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity
      }
    });
  } catch (error) {
    console.error('❌ Error fetching room details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Get chat history for a room
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log(`📜 Fetching messages for room: ${roomId}`);
    console.log(`   Page: ${page}, Limit: ${limit}`);
    console.log(`   User: ${req.user.username} (${req.user._id})`);

    const messages = await Message.find({ chatRoom: roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalMessages = await Message.countDocuments({ chatRoom: roomId });

    console.log(`📜 Found ${messages.length} messages (total: ${totalMessages})`);

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch messages' 
    });
  }
});

// Send message to room (HTTP fallback)
router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message content is required' 
      });
    }

    console.log(`📤 HTTP message to room ${roomId}:`);
    console.log(`   From: ${req.user.username}`);
    console.log(`   Content: ${content}`);

    const message = new Message({
      content: content.trim(),
      sender: req.user._id,
      chatRoom: roomId,
      type: type,
      timestamp: new Date(),
      createdAt: new Date()
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    console.log(`✅ Message saved with ID: ${message._id}`);

    res.json({
      success: true,
      message: {
        _id: message._id,
        content: message.content,
        sender: {
          _id: message.sender._id,
          username: message.sender.username,
          avatar: message.sender.avatar
        },
        chatRoom: message.chatRoom,
        type: message.type,
        timestamp: message.timestamp,
        createdAt: message.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message' 
    });
  }
});

// Upload image for chat
router.post('/upload/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    const imageUrl = `/uploads/images/${req.file.filename}`;
    
    console.log(`📸 Image uploaded: ${imageUrl}`);
    console.log(`   User: ${req.user.username}`);
    console.log(`   File size: ${req.file.size} bytes`);

    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload image' 
    });
  }
});

// Create a new chat room
router.post('/rooms', auth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      type = 'event', 
      isPublic = true, 
      maxParticipants = 50,
      location,
      event 
    } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Room name is required' 
      });
    }

    console.log(`🏗️ Creating new room: ${name}`);
    console.log(`   Type: ${type}`);
    console.log(`   Creator: ${req.user.username}`);

    const roomData = {
      name: name.trim(),
      description: description?.trim() || '',
      type,
      isPublic,
      maxParticipants,
      createdBy: req.user._id,
      participants: 1,
      isActive: true,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    if (location) {
      roomData.location = location;
    }

    if (event) {
      roomData.event = event;
    }

    const room = new ChatRoom(roomData);
    await room.save();

    console.log(`✅ Room created with ID: ${room._id}`);

    res.json({
      success: true,
      room: {
        _id: room._id,
        name: room.name,
        description: room.description,
        type: room.type,
        isPublic: room.isPublic,
        maxParticipants: room.maxParticipants,
        participants: room.participants,
        createdBy: room.createdBy,
        location: room.location,
        event: room.event,
        isActive: room.isActive,
        createdAt: room.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error creating room:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create room' 
    });
  }
});

// Get all public rooms
router.get('/rooms', auth, async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;

    console.log(`📋 Fetching public rooms:`);
    console.log(`   Type filter: ${type || 'all'}`);
    console.log(`   User: ${req.user.username}`);

    const filter = { isPublic: true, isActive: true };
    if (type) {
      filter.type = type;
    }

    const rooms = await ChatRoom.find(filter)
      .populate('createdBy', 'username')
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const totalRooms = await ChatRoom.countDocuments(filter);

    console.log(`📋 Found ${rooms.length} public rooms (total: ${totalRooms})`);

    res.json({
      success: true,
      rooms: rooms.map(room => ({
        _id: room._id,
        name: room.name,
        description: room.description,
        type: room.type,
        participants: room.participants || 0,
        maxParticipants: room.maxParticipants,
        createdBy: {
          _id: room.createdBy._id,
          username: room.createdBy.username
        },
        location: room.location,
        event: room.event,
        isActive: room.isActive,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRooms,
        pages: Math.ceil(totalRooms / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching rooms:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch rooms' 
    });
  }
});

// NEUE HILFSFUNKTION: Room-Teilnehmer verwalten (für Socket-Integration)
async function updateRoomParticipants(roomId, participantCount) {
  try {
    const ChatRoom = require('../models/ChatRoom');
    
    const room = await ChatRoom.findById(roomId);
    if (room) {
      room.participants = participantCount;
      room.lastActivity = new Date();
      await room.save();
      
      console.log(`👥 Room ${roomId} participants updated: ${participantCount}`);
    }
  } catch (error) {
    console.error(`❌ Error updating room participants for ${roomId}:`, error.message);
  }
}

// Export routes and helper functions
module.exports = router;
module.exports.updateRoomParticipants = updateRoomParticipants;
module.exports.findOrCreateChatRoom = findOrCreateChatRoom;
module.exports.generateRoomId = generateRoomId;
