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

// Configure multer for media uploads (images, videos, GIFs)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir;
    
    // Verschiedene Ordner für verschiedene Medientypen
    if (file.mimetype.startsWith('image/')) {
      uploadDir = path.join(__dirname, '../uploads/images');
    } else if (file.mimetype.startsWith('video/')) {
      uploadDir = path.join(__dirname, '../uploads/videos');
    } else {
      uploadDir = path.join(__dirname, '../uploads/files');
    }
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = file.mimetype.startsWith('image/') ? 'image' :
                    file.mimetype.startsWith('video/') ? 'video' : 'file';
    cb(null, baseName + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit für Videos
  },
  fileFilter: function (req, file, cb) {
    // Akzeptiere Bilder, Videos und GIFs
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilder, Videos und GIFs sind erlaubt!'), false);
    }
  }
});

// Get nearby rooms based on location - KORRIGIERT
router.get('/rooms/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }
    console.log(`📍 [GET] Fetching persistent nearby rooms for: ${latitude}, ${longitude}`);
    // Verwende die gleiche Analyse wie im POST
    const analysis = await getStructuredLocationAnalysis(parseFloat(latitude), parseFloat(longitude));
    if (!analysis || !analysis.placesInRadius) {
      return res.status(500).json({ error: 'Failed to analyze location' });
    }
    // Generiere die gleichen Room-IDs wie im POST
    const ChatRoom = require('../models/ChatRoom');
    const neighborhoodPlaces = analysis.placesInRadius.filter(p => p.distance <= 5000);
    const regionalPlaces = analysis.placesInRadius.filter(p => p.distance > 5000 && p.distance <= 20000);
    const roomIds = [
      ...neighborhoodPlaces.map(place => generateRoomId(place.name, 'neighborhood')),
      ...regionalPlaces.map(place => generateRoomId(place.name, 'regional')),
      'global_de'
    ];
    // Für jede roomId: existiert sie nicht, dann anlegen
    let rooms = [];
    for (const roomId of roomIds) {
      let place = analysis.placesInRadius.find(p => generateRoomId(p.name, 'neighborhood') === roomId || generateRoomId(p.name, 'regional') === roomId);
      let roomData = {
        _id: roomId,
        id: roomId,
        name: place ? place.name : 'Deutschland-Chat',
        type: roomId === 'global_de' ? 'global' : (roomId.startsWith('regional') ? 'location' : 'location'),
        subType: roomId === 'global_de' ? 'global' : (roomId.startsWith('regional') ? 'regional' : 'neighborhood'),
        participants: 0,
        description: place ? `Chat für ${place.name}` : 'Überregionaler Chat für ganz Deutschland',
        location: place ? { latitude: place.latitude, longitude: place.longitude } : null,
        distance: place ? place.distance : null,
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date()
      };
      // Raum anlegen, falls nicht vorhanden
      const room = await findOrCreateChatRoom(roomData);
      rooms.push(room);
    }
    // Debug-Logging
    console.log('➡️ Räume, die zurückgegeben werden:', rooms);
    console.log('➡️ Raum-Namen:', rooms.map(r => r && r.name));
    console.log('➡️ Raum-IDs:', rooms.map(r => r && r._id));
    console.log('🟡 [BACKEND-DEBUG] typeof rooms:', typeof rooms);
    console.log('🟡 [BACKEND-DEBUG] Array.isArray(rooms):', Array.isArray(rooms));
    console.log('🟡 [BACKEND-DEBUG] rooms.length:', rooms.length);
    console.log('🟡 [BACKEND-DEBUG] Object.keys(rooms):', Object.keys(rooms));
    console.log('🟡 [BACKEND-DEBUG] rooms.constructor:', rooms && rooms.constructor && rooms.constructor.name);
    if (!Array.isArray(rooms)) {
      console.error('❌ [BACKEND-DEBUG] rooms ist KEIN Array!');
      try {
        console.error('❌ [BACKEND-DEBUG] rooms als Array:', Array.from(rooms));
      } catch (e) {
        console.error('❌ [BACKEND-DEBUG] Fehler bei Array.from(rooms):', e);
      }
    }
    // location-Feld für globale Räume robust auf null oder POJO setzen
    rooms = rooms.map(room => {
      let location = room.location;
      try {
        if (!location || typeof location !== 'object') {
          location = null;
        } else if (location && typeof location.toObject === 'function') {
          location = location.toObject();
        } else if (location.constructor && location.constructor.name !== 'Object') {
          location = null;
        }
      } catch (e) {
        console.error('❌ Fehler beim Serialisieren von location:', e);
        location = null;
      }
      return { ...room, location };
    });
    res.json({ rooms });
  } catch (error) {
    console.error('❌ Error fetching persistent nearby rooms:', error);
    res.status(500).json({ error: 'Failed to fetch persistent nearby rooms', details: error.message });
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
        createdBy: null, // System-generierte Rooms
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
        participants: global.getRoomParticipantCount ? global.getRoomParticipantCount(roomId) : 0, // Real participants
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
        participants: global.getRoomParticipantCount ? global.getRoomParticipantCount(roomId) : 0,
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
    // GLOBALER RAUM: Deutschland-Chat immer anhängen, falls nicht vorhanden
    if (!persistentRooms.some(r => r.type === 'global')) {
      persistentRooms.push({
        _id: 'global_de',
        id: 'global_de',
        name: 'Deutschland-Chat',
        type: 'global',
        subType: 'global',
        participants: 0,
        description: 'Überregionaler Chat für ganz Deutschland',
        isActive: true,
        location: null,
        distance: null,
        createdAt: new Date(),
        lastActivity: new Date()
      });
    }

    console.log(`✅ Generated ${persistentRooms.length} persistent nearby rooms from structured analysis`);
    persistentRooms.forEach(room => {
      console.log(`   📍 ${room.name} (${room.distance}km, ${room.participants} participants) [${room._id}]`);
    });
    // DEBUG: Response-Format explizit loggen
    console.log('➡️ [POST] rooms (Array):', persistentRooms);
    console.log('➡️ [POST] typeof rooms:', typeof persistentRooms);
    console.log('➡️ [POST] Array.isArray(rooms):', Array.isArray(persistentRooms));
    console.log('➡️ [POST] rooms.length:', persistentRooms.length);
    console.log('➡️ [POST] Object.keys(rooms):', Object.keys(persistentRooms));
    console.log('➡️ [POST] rooms.constructor:', persistentRooms && persistentRooms.constructor && persistentRooms.constructor.name);
    res.json({ rooms: persistentRooms });

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

  } catch (error) {
    console.error('❌ Error fetching room messages:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Chatraum beitreten (HTTP)
router.post('/rooms/:roomId/join', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    // Prüfe, ob der Raum existiert
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Füge den User zu den Teilnehmern hinzu (optional: doppelte vermeiden)
    if (!room.participants) room.participants = [];
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      await room.save();
    }

    res.json({ success: true, room });
  } catch (error) {
    console.error('❌ Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room', details: error.message });
  }
});

module.exports = router;
    