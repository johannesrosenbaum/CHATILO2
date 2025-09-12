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

// 🔔 Push Notification Service
const PushService = require('../services/PushService');

// 🌲 Helper function to build Reddit-style comment tree
async function buildCommentTree(postId, parentId = null, maxLevel = 3) {
  const query = {
    $or: [
      { threadId: postId, parentMessage: parentId },
      { parentMessage: postId } // Direct replies to post
    ],
    isDeleted: { $ne: true }
  };

  if (parentId === null) {
    // Top-level comments (direct replies to post)
    query.$or = [{ parentMessage: postId }];
  }

  const comments = await Message.find(query)
    .populate('sender', 'username avatar')
    .sort({ createdAt: 1, score: -1 })
    .limit(maxLevel > 0 ? 100 : 5) // Weniger tiefe Kommentare bei tiefer Verschachtelung
    .lean();

  // Recursively build tree for each comment
  const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
    let replies = [];
    
    if (comment.level < maxLevel && comment.childrenCount > 0) {
      replies = await buildCommentTree(postId, comment._id, maxLevel - 1);
    }

    return {
      ...comment,
      replies: replies,
      replyCount: comment.childrenCount || 0,
      netScore: (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)
    };
  }));

  return commentsWithReplies;
}

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
      console.log(`🆕 CREATING NEW ROOM: ${roomData.name} (ID: ${roomData.roomId || 'auto-generated'})`);
      
      // 2. Erstelle neuen Room
      const newRoom = new ChatRoom({
        roomId: roomData.roomId || `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: roomData.name,
        type: roomData.type,
        subType: roomData.subType,
        participants: [req.user.id], // Benutzer als Teilnehmer hinzufügen
        description: roomData.description,
        location: roomData.location,
        isActive: true,
        createdAt: new Date(),
        lastActivity: new Date(),
        createdBy: req.user.id, // Benutzer als Ersteller
        settings: {
          isPublic: true,
          allowMedia: true,
          allowImages: true,
          allowVideos: true,
          allowFiles: true
        }
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

// Get all rooms that the user has access to - MOVED BEFORE :roomId route
router.get('/rooms/user', auth, async (req, res) => {
  try {
    console.log(`👤 [GET] /api/chat/rooms/user - Fetching all user rooms for: ${req.user.id}`);
    console.log(`   User object:`, req.user);
    
    // Get all rooms the user is a participant of or created
    const userRooms = await ChatRoom.find({
      $or: [
        { createdBy: req.user.id },
        { participants: req.user.id }
      ]
    })
    .populate('createdBy', 'username')
    .populate('participants', 'username')
    .sort({ lastActivity: -1 })
    .lean();

    console.log(`   Found ${userRooms.length} raw rooms`);

    // Add additional info
    const roomsWithInfo = userRooms.map(room => ({
      ...room,
      memberCount: room.participants ? room.participants.length : 0,
      isOwner: room.createdBy && room.createdBy._id.toString() === req.user.id
    }));

    console.log(`✅ [GET] /api/chat/rooms/user - Success: ${roomsWithInfo.length} rooms for user`);
    
    res.json({
      success: true,
      rooms: roomsWithInfo,
      count: roomsWithInfo.length
    });

  } catch (error) {
    console.error('❌ [GET] /api/chat/rooms/user - Error fetching user rooms:', error);
    console.error('   Error details:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user rooms', 
      details: error.message 
    });
  }
});

// NEUE ROUTE: Room-Details abrufen (MOVED AFTER /rooms/user)
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

// 🌲 Get chat history - Reddit-Style Posts & Comments
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 20, sortBy = 'latest' } = req.query;
    console.log(`📜 [DEBUG] Fetching Reddit-style posts for room: ${roomId}`);
    console.log(`   Page: ${page}, Limit: ${limit}, Sort: ${sortBy}`);
    console.log(`   User: ${req.user.username} (${req.user._id})`);

    // 1. Zuerst alle Posts (Level 0) laden
    let sortQuery = {};
    switch (sortBy) {
      case 'hot':
        sortQuery = { score: -1, createdAt: -1 };
        break;
      case 'top':
        sortQuery = { score: -1 };
        break;
      case 'latest':
      default:
        sortQuery = { createdAt: -1 };
        break;
    }

    const posts = await Message.find({ 
      chatRoom: roomId, 
      isPost: true,
      isDeleted: { $ne: true }
    })
      .populate('sender', 'username avatar')
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    console.log(`   [DEBUG] Found ${posts.length} posts`);

    // 2. Für jeden Post die Kommentare laden (hierarchisch)
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await buildCommentTree(post._id);
      
      return {
        ...post,
        comments: comments,
        commentCount: await Message.countDocuments({ 
          threadId: post._id,
          isPost: false,
          isDeleted: { $ne: true }
        })
      };
    }));

    const totalPosts = await Message.countDocuments({ 
      chatRoom: roomId, 
      isPost: true,
      isDeleted: { $ne: true }
    });

    console.log(`   [DEBUG] totalPosts: ${totalPosts}`);
    console.log(`   [DEBUG] postsWithComments.length: ${postsWithComments.length}`);
    
    res.json({
      posts: postsWithComments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / parseInt(limit)),
        totalPosts,
        hasNextPage: (parseInt(page) * parseInt(limit)) < totalPosts,
        hasPreviousPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('❌ [ERROR] fetching room messages:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// 🌲 Post/Kommentar in einen Raum senden (Reddit-Style)
router.post('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, type = 'text', parentMessageId, replyToUser } = req.body;
    const userId = req.user._id;

    if (!content || !roomId) {
      return res.status(400).json({ error: 'Content and roomId are required' });
    }

    let messageData = {
      content,
      type,
      sender: userId,
      chatRoom: roomId,
      createdAt: new Date()
    };

    // 🌲 Kommentar-Logik: Parent-Child-Beziehung
    if (parentMessageId) {
      const parentMessage = await Message.findById(parentMessageId);
      if (!parentMessage) {
        return res.status(404).json({ error: 'Parent message not found' });
      }

      // Bestimme Level und ThreadId
      messageData.parentMessage = parentMessageId;
      messageData.level = parentMessage.level + 1;
      messageData.threadId = parentMessage.threadId || parentMessage._id;
      messageData.isPost = false;

      // Maximale Verschachtelungstiefe prüfen
      if (messageData.level > 10) {
        return res.status(400).json({ error: 'Maximum nesting level reached' });
      }

      // Parent Message childrenCount erhöhen
      await Message.findByIdAndUpdate(parentMessageId, {
        $inc: { childrenCount: 1 }
      });
    } else {
      // Neuer Post
      messageData.isPost = true;
      messageData.level = 0;
    }

    // Erstelle die Nachricht
    const message = await Message.create(messageData);

    // ThreadId für neue Posts setzen
    if (messageData.isPost) {
      message.threadId = message._id;
      await message.save();
    }

    // Optional: Nachricht mit Userdaten zurückgeben
    await message.populate('sender', 'username avatar');

    // 🔔 PUSH NOTIFICATIONS: Sende an alle User die diesen Raum als Favorit haben
    try {
      console.log(`🔔 [PUSH] Processing push notifications for room ${roomId}`);
      
      // Hole alle User die diesen Raum als Favorit haben (außer dem Sender)
      const usersWithFavorite = await User.find({
        favoriteRooms: roomId,
        _id: { $ne: userId }, // Nicht an den Sender senden
        'notificationSettings.pushEnabled': { $ne: false }
      });

      console.log(`🔔 [PUSH] Found ${usersWithFavorite.length} users with room as favorite`);

      // Hole Room-Details für Notification
      const room = await ChatRoom.findById(roomId);
      const roomName = room ? room.name : 'Chat';

      // Sende Push-Notifications asynchron (nicht blockierend)
      const notificationPromises = usersWithFavorite.map(async (user) => {
        try {
          const result = await PushService.sendNotification(user._id, roomId, roomName);
          console.log(`🔔 [PUSH] Notification result for user ${user.username}:`, result.success ? 'SUCCESS' : result.reason);
          return { userId: user._id, username: user.username, result };
        } catch (error) {
          console.error(`❌ [PUSH] Error sending to user ${user.username}:`, error.message);
          return { userId: user._id, username: user.username, error: error.message };
        }
      });

      // Warte nicht auf alle Notifications (non-blocking)
      Promise.all(notificationPromises).then(results => {
        const successCount = results.filter(r => r.result?.success).length;
        console.log(`🔔 [PUSH] Notifications completed: ${successCount}/${results.length} successful`);
      }).catch(error => {
        console.error(`❌ [PUSH] Error in notification batch:`, error);
      });

    } catch (pushError) {
      console.error('❌ [PUSH] Error processing push notifications:', pushError);
      // Fehler bei Push-Notifications sollen nicht die Nachricht blockieren
    }

    res.json({ message });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
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

    // 🔄 PUSH NOTIFICATIONS: Reset notification trigger für diesen User/Room
    try {
      const resetResult = await PushService.resetRoomNotification(userId, roomId);
      console.log(`🔄 [PUSH] Reset notification trigger:`, resetResult.success ? 'SUCCESS' : resetResult.error);
    } catch (pushError) {
      console.error('❌ [PUSH] Error resetting notification trigger:', pushError);
      // Fehler beim Reset soll nicht das Join blockieren
    }

    res.json({ success: true, room });
  } catch (error) {
    console.error('❌ Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room', details: error.message });
  }
});

// Initialize local chat rooms for user location
router.post('/rooms/initialize-local', auth, async (req, res) => {
  try {
    console.log(`🌍 [POST] /api/chat/rooms/initialize-local - Starting...`);
    console.log(`   User: ${req.user.id}`);
    console.log(`   Body:`, req.body);
    
    const { latitude, longitude, address } = req.body;
    
    if (!latitude || !longitude) {
      console.log(`❌ [POST] /api/chat/rooms/initialize-local - Missing coordinates`);
      return res.status(400).json({ 
        success: false,
        error: 'Latitude and longitude required' 
      });
    }

    console.log(`🌍 [POST] /api/chat/rooms/initialize-local - Initializing local rooms for: ${latitude}, ${longitude}`);
    
    // Get structured location analysis
    console.log(`   Calling getStructuredLocationAnalysis...`);
    const analysis = await getStructuredLocationAnalysis(parseFloat(latitude), parseFloat(longitude));
    console.log(`   Analysis result:`, analysis ? 'SUCCESS' : 'FAILED');
    
    if (!analysis || !analysis.placesInRadius) {
      console.log(`❌ [POST] /api/chat/rooms/initialize-local - Analysis failed`);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to analyze location' 
      });
    }

    console.log(`   Found ${analysis.placesInRadius.length} places in radius`);
    let createdRooms = 0;
    let existingRooms = 0;

    // Create local rooms for each place
    for (const place of analysis.placesInRadius) {
      const roomId = `room_${place.type}_${place.lat.toFixed(4)}_${place.lng.toFixed(4)}`;
      
      // Check if room already exists
      let existingRoom = await ChatRoom.findOne({ roomId });
      
      if (!existingRoom) {
        // Create new room
        const newRoom = new ChatRoom({
          roomId,
          name: place.name,
          description: `${place.type} in ${place.address?.city || 'der Nähe'}`,
          type: 'location',
          location: {
            latitude: place.lat,
            longitude: place.lng,
            address: place.address?.street || '',
            city: place.address?.city || '',
            postalCode: place.address?.postcode || '',
            country: place.address?.country || 'Deutschland',
            radius: 2000
          },
          createdBy: req.user.id,
          participants: [req.user.id],
          settings: {
            isPublic: true,
            allowMedia: true,
            allowImages: true,
            allowVideos: true,
            allowFiles: true
          }
        });

        await newRoom.save();
        createdRooms++;
        console.log(`✅ Created room: ${place.name}`);
      } else {
        // Add user to existing room if not already a participant
        if (!existingRoom.participants.includes(req.user.id)) {
          existingRoom.participants.push(req.user.id);
          await existingRoom.save();
        }
        existingRooms++;
        console.log(`📍 Joined existing room: ${place.name}`);
      }
    }

    console.log(`🎯 Local rooms initialized: ${createdRooms} created, ${existingRooms} existing`);
    
    res.json({
      success: true,
      message: 'Local rooms initialized successfully',
      created: createdRooms,
      existing: existingRooms,
      total: analysis.placesInRadius.length
    });

  } catch (error) {
    console.error('❌ Error initializing local rooms:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to initialize local rooms', 
      details: error.message 
    });
  }
});

// 📸 MEDIA UPLOAD ROUTE - Fehlende Upload-Route hinzufügen
router.post('/upload/media', auth, upload.single('media'), async (req, res) => {
  try {
    console.log('📸 [UPLOAD] Media upload request received');
    console.log('   User:', req.user?.username || 'Unknown');
    console.log('   File:', req.file?.filename || 'No file');
    console.log('   Mimetype:', req.file?.mimetype || 'Unknown');
    console.log('   Body:', req.body);
    
    if (!req.file) {
      console.log('❌ [UPLOAD] No file uploaded');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const { roomId, type = 'image', content = '' } = req.body;
    
    if (!roomId) {
      console.log('❌ [UPLOAD] No roomId provided');
      return res.status(400).json({ 
        success: false,
        error: 'Room ID required' 
      });
    }

    // Generate file URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_URL 
      : 'http://localhost:1113';
    
    let fileUrl;
    if (req.file.mimetype.startsWith('image/')) {
      fileUrl = `${baseUrl}/uploads/images/${req.file.filename}`;
    } else if (req.file.mimetype.startsWith('video/')) {
      fileUrl = `${baseUrl}/uploads/videos/${req.file.filename}`;
    } else {
      fileUrl = `${baseUrl}/uploads/files/${req.file.filename}`;
    }

    // Create message with media
    const Message = require('../models/Message');
    const User = require('../models/User');
    
    const message = new Message({
      content: content || `Medien-Upload: ${req.file.originalname}`,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 
            req.file.mimetype.startsWith('video/') ? 'video' : 'file',
      sender: req.user.id,
      chatRoom: roomId,
      mediaUrl: fileUrl,
      media: {
        type: req.file.mimetype.startsWith('image/') ? 'image' : 
              req.file.mimetype.startsWith('video/') ? 'video' : 'file',
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      },
      createdAt: new Date()
    });

    await message.save();
    
    // Populate user data
    await message.populate('sender', 'username avatar');

    console.log('✅ [UPLOAD] File uploaded and message created:', fileUrl);

    res.json({
      success: true,
      message: message,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });

  } catch (error) {
    console.error('❌ [UPLOAD] Error uploading media:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload media', 
      details: error.message 
    });
  }
});

// ✨ GET ROOM USERS - Alle Benutzer eines Chatraums abrufen
router.get('/rooms/:roomId/users', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    console.log('👥 [USERS] Fetching users for room:', roomId);
    
    // Finde den Raum
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        error: 'Chatraum nicht gefunden' 
      });
    }
    
    // Hole alle Benutzer des Raums mit aktuellen Online-Status
    const users = await User.find({
      _id: { $in: room.members }
    }, {
      username: 1,
      avatar: 1,
      isActive: 1,
      lastSeen: 1,
      createdAt: 1
    }).sort({ isActive: -1, lastSeen: -1 });
    
    console.log('✅ [USERS] Found users:', users.length);
    
    res.json(users);
  } catch (error) {
    console.error('❌ [USERS] Error fetching room users:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch room users',
      details: error.message 
    });
  }
});

// ✨ GET ROOM GALLERY - Alle Medien eines Chatraums für Galerie
router.get('/rooms/:roomId/gallery', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    console.log('🖼️ [GALLERY] Fetching gallery for room:', roomId);
    
    // Get all media messages (images and videos)
    const mediaMessages = await Message.find({
      chatRoom: roomId,
      type: { $in: ['image', 'video'] },
      $or: [
        { mediaUrl: { $exists: true, $ne: null } },
        { 'media.url': { $exists: true, $ne: null } }
      ]
    })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 });

    // Transform to gallery format
    const galleryItems = mediaMessages.map(message => ({
      _id: message._id,
      messageId: message._id,
      url: message.mediaUrl || message.media?.url,
      filename: message.media?.originalName || message.filename || 'media',
      user: {
        _id: message.sender._id,
        username: message.sender.username,
        avatar: message.sender.avatar
      },
      likes: (message.likes || []).map(like => like.user?.toString() || like.toString()),
      likesCount: (message.likes || []).length,
      comments: [], // Comments werden später implementiert
      commentsCount: 0,
      createdAt: message.createdAt,
      type: message.type
    }));

    console.log('✅ [GALLERY] Found media items:', galleryItems.length);

    res.json(galleryItems);
  } catch (error) {
    console.error('❌ [GALLERY] Error fetching gallery:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch gallery',
      details: error.message 
    });
  }
});

// ✨ LIKE GALLERY ITEM - Like/Unlike für Galerie-Element
router.post('/gallery/:messageId/like', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    console.log('👍 [LIKE] Toggle like for message:', messageId);

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        error: 'Message not found' 
      });
    }

    // Initialize likes array if it doesn't exist
    if (!message.likes) {
      message.likes = [];
    }

    // Toggle like - check if user already liked
    const existingLikeIndex = message.likes.findIndex(
      like => (like.user?.toString() || like.toString()) === userId
    );
    
    if (existingLikeIndex > -1) {
      message.likes.splice(existingLikeIndex, 1);
      console.log('👎 [LIKE] Removed like');
    } else {
      message.likes.push({ user: userId, timestamp: new Date() });
      console.log('👍 [LIKE] Added like');
    }

    await message.save();

    res.json({ 
      success: true, 
      likes: message.likes.map(like => like.user?.toString() || like.toString()),
      likesCount: message.likes.length 
    });
  } catch (error) {
    console.error('❌ [LIKE] Error toggling like:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to toggle like',
      details: error.message 
    });
  }
});

// ✨ ADD COMMENT TO GALLERY ITEM - Kommentar zu Bild/Video hinzufügen
// TODO: Implement comments system with separate Comment model
router.post('/gallery/:messageId/comment', auth, async (req, res) => {
  try {
    // Placeholder - comments feature to be implemented later
    res.status(501).json({ 
      success: false, 
      error: 'Comments feature not yet implemented' 
    });
  } catch (error) {
    console.error('❌ [COMMENT] Error adding comment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add comment',
      details: error.message 
    });
  }
});

// ===== PUSH NOTIFICATION ROUTES =====

// 📱 Push-Subscription hinzufügen
router.post('/push/subscribe', auth, async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid subscription required' 
      });
    }

    console.log(`📱 [PUSH] Adding subscription for user ${req.user.username}`);
    
    const result = await PushService.addSubscription(req.user._id, subscription);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Push subscription added successfully',
        subscriptionCount: result.subscriptionCount
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('❌ [PUSH] Error adding subscription:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add subscription',
      details: error.message 
    });
  }
});

// 🗑️ Push-Subscription entfernen
router.post('/push/unsubscribe', auth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ 
        success: false, 
        error: 'Endpoint required' 
      });
    }

    console.log(`🗑️ [PUSH] Removing subscription for user ${req.user.username}`);
    
    const result = await PushService.removeSubscription(req.user._id, endpoint);
    
    res.json(result);
  } catch (error) {
    console.error('❌ [PUSH] Error removing subscription:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove subscription',
      details: error.message 
    });
  }
});

// ⭐ Raum zu Favoriten hinzufügen
router.post('/rooms/:roomId/favorite', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    console.log(`⭐ [FAVORITE] Adding room ${roomId} to favorites for user ${req.user.username}`);

    // Prüfe ob Raum existiert
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({ 
        success: false, 
        error: 'Room not found' 
      });
    }

    // Füge zu Favoriten hinzu
    const user = await User.findById(userId);
    if (!user.favoriteRooms) {
      user.favoriteRooms = [];
    }

    if (!user.favoriteRooms.includes(roomId)) {
      user.favoriteRooms.push(roomId);
      await user.save();
      console.log(`✅ [FAVORITE] Room added to favorites`);
    } else {
      console.log(`ℹ️ [FAVORITE] Room already in favorites`);
    }

    res.json({ 
      success: true, 
      message: 'Room added to favorites',
      favoriteCount: user.favoriteRooms.length 
    });

  } catch (error) {
    console.error('❌ [FAVORITE] Error adding to favorites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add to favorites',
      details: error.message 
    });
  }
});

// ❌ Raum aus Favoriten entfernen
router.delete('/rooms/:roomId/favorite', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    console.log(`❌ [FAVORITE] Removing room ${roomId} from favorites for user ${req.user.username}`);

    const user = await User.findById(userId);
    if (user.favoriteRooms) {
      const beforeCount = user.favoriteRooms.length;
      user.favoriteRooms = user.favoriteRooms.filter(id => id !== roomId);
      
      if (user.favoriteRooms.length < beforeCount) {
        await user.save();
        console.log(`✅ [FAVORITE] Room removed from favorites`);
      }
    }

    res.json({ 
      success: true, 
      message: 'Room removed from favorites',
      favoriteCount: user.favoriteRooms ? user.favoriteRooms.length : 0
    });

  } catch (error) {
    console.error('❌ [FAVORITE] Error removing from favorites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to remove from favorites',
      details: error.message 
    });
  }
});

// 📋 User Favoriten abrufen
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const favoriteRooms = user.favoriteRooms || [];

    // Hole Details für alle Favoriten-Räume
    const rooms = await ChatRoom.find({
      _id: { $in: favoriteRooms }
    }).lean();

    console.log(`📋 [FAVORITES] Found ${rooms.length} favorite rooms for user ${req.user.username}`);

    res.json({
      success: true,
      favorites: favoriteRooms,
      rooms: rooms,
      count: favoriteRooms.length
    });

  } catch (error) {
    console.error('❌ [FAVORITES] Error fetching favorites:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch favorites',
      details: error.message 
    });
  }
});

// 🔔 Push-Notification Test senden
router.post('/push/test', auth, async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Room ID required' 
      });
    }

    console.log(`🔔 [PUSH] Sending test notification for user ${req.user.username}`);
    
    const room = await ChatRoom.findById(roomId);
    const roomName = room ? room.name : 'Test Room';
    
    const result = await PushService.sendNotification(req.user._id, roomId, roomName);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test notification sent' : 'Failed to send test notification',
      details: result
    });

  } catch (error) {
    console.error('❌ [PUSH] Error sending test notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test notification',
      details: error.message 
    });
  }
});

// ===== REDDIT-STYLE VOTING & COMMENTS =====

// 👍 Upvote/Downvote a message
router.post('/messages/:messageId/vote', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { voteType } = req.body; // 'up', 'down', 'remove'
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Remove existing votes first
    message.upvotes = message.upvotes.filter(vote => !vote.user.equals(userId));
    message.downvotes = message.downvotes.filter(vote => !vote.user.equals(userId));

    // Add new vote
    if (voteType === 'up') {
      message.upvotes.push({ user: userId, timestamp: new Date() });
    } else if (voteType === 'down') {
      message.downvotes.push({ user: userId, timestamp: new Date() });
    }

    // Update score
    message.score = message.upvotes.length - message.downvotes.length;
    await message.save();

    res.json({
      success: true,
      score: message.score,
      upvotes: message.upvotes.length,
      downvotes: message.downvotes.length,
      userVote: voteType === 'remove' ? null : voteType
    });

  } catch (error) {
    console.error('❌ Error voting:', error);
    res.status(500).json({ error: 'Failed to vote', details: error.message });
  }
});

// 💬 Reply to a message (create comment)
router.post('/messages/:messageId/reply', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const parentMessage = await Message.findById(messageId);
    if (!parentMessage) {
      return res.status(404).json({ error: 'Parent message not found' });
    }

    // Create reply
    const replyData = {
      content: content.trim(),
      sender: userId,
      chatRoom: parentMessage.chatRoom,
      parentMessage: messageId,
      level: parentMessage.level + 1,
      threadId: parentMessage.threadId || parentMessage._id,
      isPost: false
    };

    if (replyData.level > 10) {
      return res.status(400).json({ error: 'Maximum nesting level reached' });
    }

    const reply = await Message.create(replyData);
    await reply.populate('sender', 'username avatar');

    // Update parent's children count
    await Message.findByIdAndUpdate(messageId, {
      $inc: { childrenCount: 1 }
    });

    res.json({
      success: true,
      reply: reply
    });

  } catch (error) {
    console.error('❌ Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply', details: error.message });
  }
});

// 🔗 Get single message thread
router.get('/messages/:messageId/thread', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .lean();
      
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // If it's a comment, get the root post
    let rootPost = message;
    if (!message.isPost) {
      rootPost = await Message.findById(message.threadId)
        .populate('sender', 'username avatar')
        .lean();
    }

    // Build comment tree
    const comments = await buildCommentTree(rootPost._id);

    res.json({
      success: true,
      post: rootPost,
      comments: comments,
      focusedMessage: message.isPost ? null : message
    });

  } catch (error) {
    console.error('❌ Error fetching thread:', error);
    res.status(500).json({ error: 'Failed to fetch thread', details: error.message });
  }
});

// 💬 Reply to a message/post
router.post('/messages/:messageId/reply', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id || req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Find parent message
    const parentMessage = await Message.findById(messageId);
    if (!parentMessage) {
      return res.status(404).json({ error: 'Parent message not found' });
    }

    // Determine level and threadId
    const level = Math.min(parentMessage.level + 1, 10);
    const threadId = parentMessage.threadId || parentMessage._id;

    // Create reply
    const reply = new Message({
      content: content.trim(),
      sender: userId,
      chatRoom: parentMessage.chatRoom,
      parentMessage: messageId,
      level: level,
      threadId: threadId,
      isPost: false
    });

    await reply.save();

    // Update parent's children count
    await Message.findByIdAndUpdate(messageId, {
      $inc: { childrenCount: 1 }
    });

    // Populate reply for response
    await reply.populate('sender', 'username avatar');

    console.log(`💬 Reply created: ${reply._id} -> parent: ${messageId}, level: ${level}`);

    res.status(201).json({
      success: true,
      message: reply
    });

  } catch (error) {
    console.error('❌ Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply', details: error.message });
  }
});

// ===== END REDDIT-STYLE FEATURES =====

module.exports = router;
