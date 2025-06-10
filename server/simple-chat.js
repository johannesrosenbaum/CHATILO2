const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

const User = require('./models/User');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message'); // ADD THIS MISSING IMPORT!

// Simple in-memory storage for messages only
const rooms = new Map(); // roomId -> { users: Set, messages: Array }
const users = new Map(); // socketId -> { id, username, currentRoom }

function initSimpleChat(server) {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:1234', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  console.log('🚀 Simple Chat Server initialized');

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Authentication Event - FIXED
    socket.on('auth', (authData) => {
      socket.userId = authData.userId;
      socket.username = authData.username;
      
      console.log(`🔐 User auth: ${socket.username} (${socket.userId})`);
      socket.emit('auth-success');
    });

    // Join Room Event - FIXED für DB-Räume
    socket.on('join-room', async (roomId) => {
      const username = socket.username || 'Anonymous';
      console.log(`🚪 ${username} joining room: ${roomId}`);
      
      socket.join(roomId);
      
      // Update user count
      const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      
      console.log(`✅ ${username} joined room ${roomId}. Users: ${userCount}`);
      
      try {
        let messages = [];
        
        // 1. Versuche echte DB-Messages zu laden
        if (roomId.match(/^[0-9a-fA-F]{24}$/)) {
          // MongoDB ObjectId - lade echte Messages
          messages = await Message.find({ chatRoom: roomId })
            .populate('sender', 'username')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        } else {
          // Generierte Room-ID - lade Messages mit roomId als String
          messages = await Message.find({ roomId: roomId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        }
        
        messages.reverse();
        console.log(`📬 Loaded ${messages.length} messages for room ${roomId}`);
        
        // 2. Aktualisiere ChatRoom participant count in DB
        await ChatRoom.findByIdAndUpdate(
          roomId, 
          { 
            participants: userCount,
            lastActivity: new Date()
          },
          { upsert: false }
        );
        
        // Send to user
        socket.emit('joined-room', {
          roomId,
          messages,
          userCount
        });
        
        // Broadcast user count update
        io.to(roomId).emit('userCountUpdate', {
          roomId,
          userCount
        });
        
      } catch (error) {
        console.error('❌ Error in join-room:', error.message);
        socket.emit('joined-room', {
          roomId,
          messages: [],
          userCount
        });
      }
    });

    // Send Message Event - FIXED für DB-Storage
    socket.on('sendMessage', async ({ content }) => {
      const username = socket.username || 'Anonymous';
      
      if (!content || content.trim() === '') {
        console.warn('❌ Empty message from', username);
        return;
      }
      
      const currentRoomId = Array.from(socket.rooms)[1]; // Erstes Room nach socket.id
      console.log(`📤 ${username} sending message: "${content}" to room: ${currentRoomId}`);
      
      try {
        // Speichere Message in DB
        const newMessage = new Message({
          content: content.trim(),
          userId: socket.userId,
          username: username,
          roomId: currentRoomId, // String-basierte roomId für generierte Räume
          sender: socket.userId,
          createdAt: new Date()
        });
        
        const savedMessage = await newMessage.save();
        console.log(`💾 Message saved to DB: ${savedMessage._id}`);
        
        //
        const messageData = {
          _id: savedMessage._id,
          content: savedMessage.content,
          userId: savedMessage.userId,
          username: savedMessage.username,
          timestamp: savedMessage.createdAt,
          createdAt: savedMessage.createdAt,
          roomId: savedMessage.roomId
        };
        
        io.to(currentRoomId).emit('newMessage', messageData);
        console.log(`📡 Message broadcasted to room: ${currentRoomId}`);
        
      } catch (error) {
        console.error('❌ Error saving message:', error.message);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (user) {
        console.log(`🔌 ${user.username} disconnected`);

        if (user.currentRoom) {
          const room = rooms.get(user.currentRoom);
          if (room) {
            room.users.delete(socket.id);
          }
        }

        users.delete(socket.id);
      } else {
        console.log(`🔌 Unknown user disconnected: ${socket.id}`);
      }
    });
  });

  return io;
}

module.exports = initSimpleChat;
