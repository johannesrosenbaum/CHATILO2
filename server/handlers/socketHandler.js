const Message = require('../models/Message');
const User = require('../models/User');

// KORRIGIERTE Message handling mit DATABASE SPEICHERUNG
socket.on('sendMessage', async (messageData) => {
  try {
    console.log('📨 PROCESSING MESSAGE:');
    console.log('   Content:', messageData.content);
    console.log('   Room:', messageData.chatRoom);
    console.log('   User:', socket.userId, socket.username);
    
    if (!socket.userId || !messageData.content?.trim()) {
      console.log('❌ Invalid message data');
      return;
    }

    // 🔥 SPEICHERE MESSAGE IN DATABASE
    console.log('💾 SAVING message to database...');
    
    const newMessage = new Message({
      content: messageData.content.trim(),
      sender: socket.userId,
      chatRoom: messageData.chatRoom,
      type: messageData.type || 'text',
      mediaUrl: messageData.mediaUrl || null
    });

    const savedMessage = await newMessage.save();
    console.log('✅ Message saved with ID:', savedMessage._id);

    // Populate sender information für Response
    await savedMessage.populate('sender', 'username email avatar');
    
    console.log('📤 BROADCASTING message to room:', messageData.chatRoom);
    console.log('   Message ID:', savedMessage._id);
    console.log('   Sender:', savedMessage.sender.username);
    console.log('   Content:', savedMessage.content);
    
    // ERWEITERTE Message für Broadcasting
    const messageForBroadcast = {
      _id: savedMessage._id,
      id: savedMessage._id,
      content: savedMessage.content,
      sender: {
        _id: savedMessage.sender._id,
        id: savedMessage.sender._id,
        username: savedMessage.sender.username,
        email: savedMessage.sender.email,
        avatar: savedMessage.sender.avatar
      },
      user: {
        _id: savedMessage.sender._id,
        id: savedMessage.sender._id,
        username: savedMessage.sender.username
      },
      chatRoom: savedMessage.chatRoom,
      roomId: savedMessage.chatRoom,
      type: savedMessage.type,
      mediaUrl: savedMessage.mediaUrl,
      timestamp: savedMessage.createdAt,
      createdAt: savedMessage.createdAt,
      userId: savedMessage.sender._id, // Für Kompatibilität
      username: savedMessage.sender.username // Für Kompatibilität
    };
    
    // Broadcast an alle in diesem Room
    io.to(messageData.chatRoom).emit('newMessage', messageForBroadcast);
    
    console.log('✅ Message broadcasted successfully');
    
  } catch (error) {
    console.error('❌ CRITICAL MESSAGE ERROR:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Message data:', messageData);
    console.error('   Socket user:', socket.userId, socket.username);
    
    socket.emit('messageError', {
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// KORRIGIERTE Room Join mit MESSAGE LOADING
socket.on('join-room', async (roomId) => {
  try {
    console.log(`🚪 USER JOINING ROOM: ${socket.username} -> ${roomId}`);
    
    // Leave previous room
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      console.log(`👋 Left previous room: ${socket.currentRoom}`);
    }
    
    // Join new room
    socket.join(roomId);
    socket.currentRoom = roomId;
    
    // 🔥 LADE EXISTING MESSAGES aus Database
    console.log('📚 LOADING existing messages from database...');
    
    const existingMessages = await Message.find({ 
      chatRoom: roomId,
      isDeleted: false 
    })
    .populate('sender', 'username email avatar')
    .sort({ createdAt: 1 }) // Älteste zuerst
    .limit(50) // Letzte 50 Messages
    .lean();

    console.log(`📚 LOADED ${existingMessages.length} existing messages for room ${roomId}`);
    
    // KONVERTIERE Messages für Client
    const messagesForClient = existingMessages.map(msg => ({
      _id: msg._id,
      id: msg._id,
      content: msg.content,
      sender: {
        _id: msg.sender._id,
        id: msg.sender._id,
        username: msg.sender.username,
        email: msg.sender.email,
        avatar: msg.sender.avatar
      },
      user: {
        _id: msg.sender._id,
        id: msg.sender._id,
        username: msg.sender.username
      },
      chatRoom: msg.chatRoom,
      roomId: msg.chatRoom,
      type: msg.type || 'text',
      mediaUrl: msg.mediaUrl,
      timestamp: msg.createdAt,
      createdAt: msg.createdAt,
      userId: msg.sender._id,
      username: msg.sender.username
    }));
    
    if (messagesForClient.length > 0) {
      console.log('📚 SENDING existing messages to client:');
      messagesForClient.forEach((msg, i) => {
        console.log(`   ${i+1}. ${msg.sender.username}: ${msg.content} (${msg._id})`);
      });
    }
    
    // Get current user count
    const roomSockets = await io.in(roomId).fetchSockets();
    const userCount = roomSockets.length;
    
    console.log(`✅ Room joined successfully: ${roomId} (${userCount} users)`);
    
    socket.emit('joined-room', {
      roomId: roomId,
      messages: messagesForClient, // SENDE EXISTING MESSAGES
      userCount: userCount
    });
    
    // Notify others
    socket.to(roomId).emit('user-joined', {
      username: socket.username,
      userCount: userCount
    });
    
  } catch (error) {
    console.error('❌ ROOM JOIN ERROR:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Room ID:', roomId);
    console.error('   User:', socket.username);
    
    socket.emit('join-room-error', {
      error: 'Failed to join room',
      details: error.message
    });
  }
});