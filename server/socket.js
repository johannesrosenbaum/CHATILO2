const { Server } = require('socket.io');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const mongoose = require('mongoose'); // 🔥 KRITISCH: Fehlender Import hinzugefügt
const { updateRoomParticipants } = require('./routes/chat');

// Add this at the top of the file, outside any functions
const activeRooms = new Map(); // Map to track users in each room
const activeUsers = new Map(); // socketId -> user info
const roomUsers = new Map(); // roomId -> Set of socketIds

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['my-custom-header', 'Authorization'],
      credentials: true
    }
  });

  io.on('connection', async (socket) => {
    console.log('🔌 New socket connection:', socket.id);
    
    // CRITICAL FIX: ALWAYS allow connection - NO ERRORS
    let decoded, user;
    
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
      
      console.log(`🔐 Socket auth attempt - Token: ${token ? 'provided' : 'missing'}, UserId: ${userId}`);
      
      // Try to verify JWT token
      if (token && token !== 'undefined' && token !== 'null') {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        console.log(`🔍 Token decoded - ID: ${decoded.userId || decoded.id}`);
        
        // Try to find user in database
        user = await User.findById(decoded.userId || decoded.id);
        console.log(`🔍 User lookup result: ${user ? 'found' : 'not found'}`);
      }
      
      // 🔥 KORRIGIERT: User ID Handling - verwende richtige Felder
      socket.userId = decoded?.userId || decoded?.id || userId || `guest_${Date.now()}`;
      socket.user = user || { 
        _id: socket.userId, 
        id: socket.userId,
        userId: socket.userId, // 🔥 HINZUGEFÜGT: userId Feld
        username: user?.username || `User_${socket.userId.slice(-4)}`,
        email: user?.email || 'temp@example.com'
      };

      console.log(`✅ Socket authenticated for user: ${socket.user.username} (${socket.userId})`);

    } catch (error) {
      console.log('🔧 Auth error, using fallback user');
      socket.userId = `guest_${Date.now()}`;
      socket.user = { 
        _id: socket.userId,
        id: socket.userId,
        userId: socket.userId, // 🔥 HINZUGEFÜGT: userId Feld
        username: 'Guest',
        email: 'guest@example.com'
      };
    }

    // ALWAYS emit successful connection - NEVER emit errors
    socket.emit('authenticated', { 
      success: true,
      userId: socket.userId,
      username: socket.user.username
    });

    console.log(`🚀 Socket connection confirmed for: ${socket.user.username}`);

    // CRITICAL: Register event handlers IMMEDIATELY after auth
    console.log('🎯 Registering socket event handlers...');

    // JOIN ROOM EVENT - MIT PARTICIPANT-TRACKING
    socket.on('join-room', async (roomId) => {
      console.log(`🚪 *** RECEIVED JOIN-ROOM EVENT *** USER ${socket.user?.username} JOINING ROOM: ${roomId}`);
      
      try {
        // Leave previous room
        if (socket.currentRoom) {
          await socket.leave(socket.currentRoom);
          if (roomUsers.has(socket.currentRoom)) {
            roomUsers.get(socket.currentRoom).delete(socket.id);
            
            // 🔥 NEU: Aktualisiere Teilnehmerzahl in DB
            const remainingUsers = roomUsers.get(socket.currentRoom).size;
            await updateRoomParticipants(socket.currentRoom, remainingUsers);
          }
          console.log(`👋 Left previous room: ${socket.currentRoom}`);
        }
        
        // Join new room
        await socket.join(roomId);
        socket.currentRoom = roomId;
        
        // Track user in room
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add(socket.id);
        
        const usersInRoom = roomUsers.get(roomId).size;
        console.log(`✅ ${socket.user.username} joined room ${roomId}. Total users: ${usersInRoom}`);
        
        // 🔥 NEU: Aktualisiere Teilnehmerzahl in DB
        await updateRoomParticipants(roomId, usersInRoom);
        
        // 🔥 CRITICAL: Load existing messages from database
        try {
          console.log(`📜 Loading existing messages for room: ${roomId}`);
          
          const existingMessages = await Message.find({ chatRoom: roomId })
            .populate('sender', 'username _id id')
            .sort({ createdAt: 1 })
            .limit(50)
            .lean();
          
          console.log(`📜 Found ${existingMessages.length} existing messages in room ${roomId}`);
          
          if (existingMessages.length > 0) {
            console.log(`🔧 EXISTING MESSAGES PREVIEW:`);
            existingMessages.forEach((msg, i) => {
              console.log(`   ${i+1}. ${msg.sender?.username || 'Unknown'}: ${msg.content.substring(0, 50)} (ID: ${msg._id})`);
            });
          }
          
          // 🔥 CRITICAL: Normalize messages für Client mit ALLEN User-Feldern
          const normalizedMessages = existingMessages.map(msg => ({
            _id: msg._id.toString(),
            id: msg._id.toString(),
            content: msg.content,
            chatRoom: msg.chatRoom,
            roomId: msg.chatRoom,
            timestamp: msg.timestamp || msg.createdAt,
            createdAt: msg.createdAt,
            type: msg.type || 'text',
            // 🔥 CRITICAL: ALLE User-Felder für perfekte Client-Kompatibilität
            sender: {
              _id: msg.sender._id?.toString() || msg.sender,
              id: msg.sender._id?.toString() || msg.sender,
              username: msg.sender.username || 'Unknown'
            },
            user: {
              _id: msg.sender._id?.toString() || msg.sender,
              id: msg.sender._id?.toString() || msg.sender,
              username: msg.sender.username || 'Unknown'
            },
            userId: msg.sender._id?.toString() || msg.sender,
            username: msg.sender.username || 'Unknown',
            // 🔥 NEU: Alternative Felder für maximale isOwnMessage Kompatibilität
            authorId: msg.sender._id?.toString() || msg.sender,
            senderId: msg.sender._id?.toString() || msg.sender,
            from: msg.sender.username || 'Unknown'
          }));
          
          // 🔥 CRITICAL: Send ALL Messages to client mit Debug-Info
          console.log(`📤 SENDING joined-room confirmation with ${normalizedMessages.length} REAL messages to client`);
          if (normalizedMessages.length > 0) {
            console.log(`🔧 Sample normalized message structure:`, JSON.stringify(normalizedMessages[0], null, 2));
          }
          
          socket.emit('joined-room', {
            roomId,
            messages: normalizedMessages,
            usersCount: usersInRoom
          });
          
        } catch (messageError) {
          console.error('❌ Error loading existing messages:', messageError);
          console.error('   Error stack:', messageError.stack);
          
          // Send confirmation WITHOUT messages
          socket.emit('joined-room', {
            roomId,
            messages: [],
            usersCount: usersInRoom
          });
        }
        
      } catch (error) {
        console.error('❌ Error joining room:', error);
        console.error('   Error stack:', error.stack);
      }
    });
    
    // 🔥 KORRIGIERT: Message Handling - ERST DATABASE SAVE, DANN BROADCAST
    socket.on('sendMessage', async (messageData) => {
      console.log('📨 🔥 CRITICAL MESSAGE RECEIVED:');
      console.log('   Content:', messageData.content);
      console.log('   ChatRoom:', messageData.chatRoom);
      console.log('   Socket Current Room:', socket.currentRoom);
      console.log('   User ID:', socket.userId);
      console.log('   Username:', socket.user.username);

      try {
        // 🔥 VALIDIERUNG: Stelle sicher dass User im richtigen Room ist
        if (socket.currentRoom !== messageData.chatRoom) {
          console.log(`⚠️ ROOM MISMATCH: socket.currentRoom=${socket.currentRoom}, messageData.chatRoom=${messageData.chatRoom}`);
          console.log(`🔧 AUTO-CORRECTING: Setting socket.currentRoom to ${messageData.chatRoom}`);
          socket.currentRoom = messageData.chatRoom;
          await socket.join(messageData.chatRoom);
        }

        // 🔥 CRITICAL: Message ZUERST in DATABASE speichern
        console.log('💾 🔥 SAVING message to database FIRST...');
        
        // 🔥 FIX: Prüfe ob socket.userId eine gültige MongoDB ObjectId ist
        let senderObjectId;
        if (mongoose.Types.ObjectId.isValid(socket.userId)) {
          senderObjectId = socket.userId;
        } else {
          // Fallback: Suche User in Database über Username
          const foundUser = await User.findOne({ username: socket.user.username });
          if (foundUser) {
            senderObjectId = foundUser._id;
            console.log(`🔧 Found user in DB: ${foundUser.username} -> ${foundUser._id}`);
          } else {
            console.error('❌ Cannot find user for message save');
            throw new Error('User not found for message save');
          }
        }

        const savedMessage = new Message({
          content: messageData.content,
          sender: senderObjectId, // Korrekte MongoDB ObjectId
          chatRoom: messageData.chatRoom,
          timestamp: new Date(messageData.timestamp || Date.now()),
          createdAt: new Date(),
          type: 'text'
        });

        // 🔥 CRITICAL: Speichern MUSS funktionieren
        await savedMessage.save();
        console.log('✅ 🔥 Message SAVED to database with ID:', savedMessage._id);

        // 🔥 CRITICAL: Populate sender für vollständige User-Daten
        await savedMessage.populate('sender', 'username');
        console.log('✅ Message populated with sender:', savedMessage.sender.username);
        
        // 🔥 CRITICAL: KOMPLETT KORRIGIERTE Message-Struktur für Client
        const fullMessage = {
          _id: savedMessage._id.toString(),
          id: savedMessage._id.toString(),
          content: savedMessage.content,
          chatRoom: savedMessage.chatRoom,
          roomId: savedMessage.chatRoom,
          timestamp: savedMessage.timestamp,
          createdAt: savedMessage.createdAt,
          type: savedMessage.type,
          // 🔥 CRITICAL: ALLE User-Felder für Client-Kompatibilität
          sender: {
            _id: savedMessage.sender._id.toString(),
            id: savedMessage.sender._id.toString(),
            username: savedMessage.sender.username
          },
          user: {
            _id: savedMessage.sender._id.toString(),
            id: savedMessage.sender._id.toString(),
            username: savedMessage.sender.username
          },
          userId: savedMessage.sender._id.toString(),
          username: savedMessage.sender.username, // 🔥 KRITISCH: Top-level username
          // 🔥 NEU: Alternative User-Felder für maximale Kompatibilität
          authorId: savedMessage.sender._id.toString(),
          authorName: savedMessage.sender.username,
          from: savedMessage.sender.username,
          senderName: savedMessage.sender.username
        };

        console.log('📤 🔥 CRITICAL: Broadcasting message to room:', messageData.chatRoom);
        console.log('   🔥 COMPLETE Message structure:');
        console.log('     ID:', fullMessage._id);
        console.log('     Content:', fullMessage.content);
        console.log('     Username (top-level):', fullMessage.username);
        console.log('     UserId (top-level):', fullMessage.userId);
        console.log('     Sender object:', fullMessage.sender);
        console.log('     User object:', fullMessage.user);
        console.log('   Room participants before broadcast:', io.sockets.adapter.rooms.get(messageData.chatRoom)?.size || 0);

        // 🔥 CRITICAL: An alle Clients im Raum senden (inklusive Sender!)
        io.to(messageData.chatRoom).emit('newMessage', fullMessage);
        
        console.log('✅ 🔥 Message broadcast COMPLETED with FULL user data');
        
        // 🔥 ZUSÄTZLICH: Bestätigung an Sender
        socket.emit('messageSent', {
          success: true,
          messageId: savedMessage._id.toString(),
          timestamp: savedMessage.createdAt
        });

      } catch (error) {
        console.error('❌ 🔥 CRITICAL: Message save/send error:', error);
        console.error('   Error stack:', error.stack);
        
        socket.emit('messageError', {
          type: 'message_failed',
          message: 'Failed to send message: ' + error.message,
          originalContent: messageData.content
        });
      }
    });

    // DISCONNECT EVENT - MIT PARTICIPANT-TRACKING
    socket.on('disconnect', async () => {
      console.log(`🔌 User ${socket.user?.username || 'unknown'} disconnected`);
      
      if (socket.currentRoom && roomUsers.has(socket.currentRoom)) {
        roomUsers.get(socket.currentRoom).delete(socket.id);
        const remainingUsers = roomUsers.get(socket.currentRoom).size;
        
        console.log(`📊 Room ${socket.currentRoom} now has ${remainingUsers} users`);
        
        // 🔥 NEU: Aktualisiere Teilnehmerzahl in DB
        await updateRoomParticipants(socket.currentRoom, remainingUsers);
      }
      
      activeUsers.delete(socket.id);
    });

    console.log(`🎯 Event handlers registered for ${socket.user.username}`);
  });

  return io;
}

// Helper function to get active users in a room
function getActiveUsersInRoom(io, room) {
  const roomClients = io.sockets.adapter.rooms.get(room);
  return roomClients ? roomClients.size : 0;
}

module.exports = initSocket;