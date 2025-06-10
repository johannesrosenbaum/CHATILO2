// Socket.IO Handler - Simple Chat Implementation
module.exports = (io) => {
  console.log('🔧 DEBUG: Socket handler initializing...');
  console.log('   Socket.IO server ready');
  console.log('   Server ready for connections');

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
      
      socket.emit('joined-room', {
        roomId,
        messages: [],
        userCount: 1,
        success: true,
        timestamp: new Date().toISOString()
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
