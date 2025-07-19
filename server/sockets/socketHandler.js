// Socket.IO Handler - Simple Chat Implementation

// Function to get real participant count for a room
const getRoomParticipantCount = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? room.size : 0;
};

// Function to get all room participant counts
const getAllRoomParticipantCounts = (io) => {
  const counts = {};
  for (const [roomId, room] of io.sockets.adapter.rooms) {
    // Skip personal socket rooms (they start with socket ID patterns)
    if (!roomId.match(/^[A-Za-z0-9_-]{20,}$/)) {
      counts[roomId] = room.size;
    }
  }
  return counts;
};

module.exports = (io) => {
  console.log('🔧 DEBUG: Socket handler initializing...');
  console.log('   Socket.IO server ready');
  console.log('   Server ready for connections');

  // Make participant count functions available globally
  global.getRoomParticipantCount = (roomId) => getRoomParticipantCount(io, roomId);
  global.getAllRoomParticipantCounts = () => getAllRoomParticipantCounts(io);

  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);
    
    // Auth
    socket.on('auth', (data) => {
      console.log('🔐 Auth received:', data);
      socket.userId = data.userId;
      socket.username = data.username;
      socket.emit('auth-success');
    });

    // Join Room
    socket.on('join-room', (roomId) => {
      console.log(`🚪 User ${socket.username} joining room: ${roomId}`);
      socket.join(roomId);
      socket.currentRoom = roomId;
      
      const userCount = getRoomParticipantCount(io, roomId);
      
      socket.emit('joined-room', {
        roomId,
        messages: [],
        userCount: userCount,
        success: true,
        timestamp: new Date().toISOString()
      });
      
      // Notify all users in room about updated participant count
      io.to(roomId).emit('room-participants-updated', {
        roomId,
        count: userCount
      });
    });

    // Send Message
    socket.on('sendMessage', (data) => {
      console.log('📨 Message received:', data);
      
      const message = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: data.content,
        sender: {
          _id: socket.userId,
          id: socket.userId,
          username: socket.username
        },
        chatRoom: {
          _id: data.chatRoom,
          name: data.chatRoom
        },
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: 'text'
      };

      // Broadcast to room
      io.to(data.chatRoom).emit('newMessage', message);
      
      // Send confirmation
      socket.emit('messageSent', {
        success: true,
        messageId: message._id,
        message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });

  console.log('✅ Socket handler initialization complete');
  console.log('   Ready to accept connections on all transports');
};
