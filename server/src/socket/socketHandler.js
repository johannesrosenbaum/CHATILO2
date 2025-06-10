const socketHandler = (io) => {
  console.log('🔧 DEBUG: Socket handler initializing...');
  console.log('   Socket.IO server ready');
  console.log('   Server ready for connections');
  
  io.on('connection', (socket) => {
    console.log('👤 DETAILED Socket connection established:');
    console.log('   Socket ID:', socket.id);
    console.log('   Client IP:', socket.handshake.address);
    console.log('   User Agent:', socket.handshake.headers['user-agent']);
    console.log('   Transport:', socket.conn.transport.name);
    console.log('   Connection time:', new Date().toISOString());
    
    // UNIVERSAL EVENT LISTENER - FÄNGT ALLE EVENTS AB
    socket.onAny((eventName, ...args) => {
      console.log('📡 RECEIVED ANY EVENT:', eventName);
      console.log('   Socket ID:', socket.id);
      console.log('   Event args:', JSON.stringify(args, null, 2));
      console.log('   Timestamp:', new Date().toISOString());
      console.log('   User from socket:', socket.userId || 'Not authenticated');
    });

    // Authentication Handler mit erweiterten Debugging
    socket.on('auth', (data) => {
      console.log('🔐 DETAILED Auth event received:');
      console.log('   Data:', JSON.stringify(data, null, 2));
      console.log('   Socket ID:', socket.id);
      console.log('   Timestamp:', new Date().toISOString());
      
      if (data && (data.userId || data.username)) {
        socket.userId = data.userId;
        socket.username = data.username;
        console.log('✅ Auth SUCCESS - User stored on socket:');
        console.log('   User ID:', socket.userId);
        console.log('   Username:', socket.username);
        socket.emit('auth-success', { message: 'Authentication successful' });
      } else {
        console.error('❌ Auth FAILED - Invalid data:', data);
        socket.emit('auth-error', { message: 'Invalid authentication data' });
      }
    });

    // JOIN ROOM Handler mit maximalen Debugging
    socket.on('join-room', async (roomId) => {
      console.log('🚪 DETAILED Join-room event received:');
      console.log('   Room ID:', roomId);
      console.log('   Socket ID:', socket.id);
      console.log('   User ID:', socket.userId);
      console.log('   Username:', socket.username);
      console.log('   Timestamp:', new Date().toISOString());
      
      try {
        if (!roomId) {
          console.error('❌ Join-room FAILED: No room ID provided');
          socket.emit('error', { message: 'Room ID is required' });
          return;
        }

        // Join the room
        socket.join(roomId);
        console.log(`✅ Socket ${socket.id} joined room: ${roomId}`);

        // Get room info
        const room = io.sockets.adapter.rooms.get(roomId);
        const userCount = room ? room.size : 1;
        console.log(`👥 Room ${roomId} now has ${userCount} users`);

        // Load messages - VEREINFACHT FÜR DEBUGGING
        let messages = [];
        console.log(`📨 Loading messages for room ${roomId}...`);

        // Send confirmation to user - MEHRERE EVENTS FÜR KOMPATIBILITÄT
        const responseData = {
          roomId: roomId,
          messages: messages,
          userCount: userCount,
          success: true,
          timestamp: new Date().toISOString()
        };
        
        console.log('📤 Sending join confirmation:', JSON.stringify(responseData, null, 2));
        socket.emit('joined-room', responseData);
        socket.emit('joinedRoom', responseData);
        socket.emit('room-joined', responseData);
        socket.emit('room-data', responseData);
        socket.emit('messages-loaded', messages);
        
        // Notify others in room
        socket.to(roomId).emit('userCountUpdate', { roomId, userCount });
        console.log(`✅ Join-room complete for ${socket.id} -> ${roomId}`);
        
      } catch (error) {
        console.error('❌ CRITICAL Join-room error:', error);
        socket.emit('error', { message: 'Failed to join room', details: error.message });
      }
    });

    // SEND MESSAGE Handler - MIT MAXIMALEM DEBUGGING
    socket.on('sendMessage', async (messageData) => {
      console.log('📨 🔥 SENDMESSAGE EVENT RECEIVED! 🔥');
      console.log('   Socket ID:', socket.id);
      console.log('   Timestamp:', new Date().toISOString());
      console.log('   Raw messageData:', JSON.stringify(messageData, null, 2));
      console.log('   User from socket - ID:', socket.userId);
      console.log('   User from socket - Username:', socket.username);
      
      try {
        // SOFORTIGE VALIDATION
        if (!messageData) {
          console.error('❌ SENDMESSAGE FAILED: No message data');
          socket.emit('error', { message: 'Message data is required', code: 'NO_DATA' });
          return;
        }
        
        if (!messageData.content) {
          console.error('❌ SENDMESSAGE FAILED: No content');
          console.error('   Available keys in messageData:', Object.keys(messageData));
          socket.emit('error', { message: 'Message content is required', code: 'NO_CONTENT' });
          return;
        }
        
        if (!messageData.chatRoom) {
          console.error('❌ SENDMESSAGE FAILED: No chatRoom');
          console.error('   Available keys in messageData:', Object.keys(messageData));
          socket.emit('error', { message: 'ChatRoom is required', code: 'NO_ROOM' });
          return;
        }
        
        if (!socket.userId) {
          console.error('❌ SENDMESSAGE FAILED: User not authenticated');
          console.error('   Socket userId:', socket.userId);
          console.error('   Socket username:', socket.username);
          socket.emit('error', { message: 'User not authenticated', code: 'NOT_AUTH' });
          return;
        }

        console.log('✅ SENDMESSAGE validation passed!');
        console.log('   Content:', messageData.content);
        console.log('   ChatRoom:', messageData.chatRoom);
        console.log('   Sender ID:', socket.userId);
        console.log('   Sender Username:', socket.username);

        // MOCK MESSAGE ERSTELLEN (OHNE DB FÜR DEBUGGING)
        const mockMessage = {
          _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: messageData.content.trim(),
          sender: {
            _id: socket.userId,
            id: socket.userId,
            username: socket.username || 'Unknown User'
          },
          chatRoom: {
            _id: messageData.chatRoom,
            name: messageData.chatRoom
          },
          timestamp: new Date(),
          createdAt: new Date(),
          type: 'text'
        };
        
        console.log('📤 🔥 BROADCASTING MOCK MESSAGE:');
        console.log('   Message ID:', mockMessage._id);
        console.log('   Content:', mockMessage.content);
        console.log('   Sender:', mockMessage.sender.username);
        console.log('   Room:', mockMessage.chatRoom._id);
        console.log('   Full message:', JSON.stringify(mockMessage, null, 2));
        
        // BROADCAST AN ALLE CLIENTS IM ROOM
        console.log(`🚀 Broadcasting to room: ${messageData.chatRoom}`);
        io.to(messageData.chatRoom).emit('newMessage', mockMessage);
        
        // BESTÄTIGUNG AN SENDER
        const confirmation = { 
          success: true, 
          messageId: mockMessage._id,
          message: mockMessage,
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ 🔥 SENDING CONFIRMATION TO SENDER:');
        console.log('   Confirmation:', JSON.stringify(confirmation, null, 2));
        socket.emit('messageSent', confirmation);
        
        console.log('🎉 SENDMESSAGE PROCESSING COMPLETE!');
        
      } catch (error) {
        console.error('❌ 🔥 CRITICAL SENDMESSAGE ERROR:');
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
        console.error('   Message data was:', messageData);
        
        socket.emit('error', { 
          message: 'Failed to send message',
          details: error.message,
          code: 'SEND_ERROR'
        });
      }
    });

    // DISCONNECT Handler
    socket.on('disconnect', (reason) => {
      console.log('🔌 DETAILED Socket disconnected:');
      console.log('   Socket ID:', socket.id);
      console.log('   User ID:', socket.userId);
      console.log('   Username:', socket.username);
      console.log('   Reason:', reason);
      console.log('   Disconnect time:', new Date().toISOString());
    });

    // ERROR Handler
    socket.on('error', (error) => {
      console.error('❌ Socket error occurred:');
      console.error('   Socket ID:', socket.id);
      console.error('   Error:', error);
      console.error('   Timestamp:', new Date().toISOString());
    });

    console.log('✅ All socket event handlers registered for socket:', socket.id);
    console.log('   Registered events: auth, join-room, sendMessage, disconnect, error');
    console.log('   Universal listener: onAny active');
  });

  console.log('✅ Socket handler initialization complete');
  console.log('   Ready to accept connections on all transports');
};

module.exports = socketHandler;