const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const connectedUsers = new Map();

// Function to get real participant count for a room
const getRoomParticipantCount = (io, roomId) => {
  const room = io.sockets.adapter.rooms.get(roomId);
  return room ? room.size : 0;
};

// Function to get all room participant counts
const getAllRoomParticipantCounts = (io) => {
  const counts = {};
  for (const [roomId, room] of io.sockets.adapter.rooms) {
    // Skip personal socket rooms (they have the same ID as socket ID)
    if (!roomId.includes('socket:')) {
      counts[roomId] = room.size;
    }
  }
  return counts;
};

// Export functions for use in routes
module.exports.getRoomParticipantCount = getRoomParticipantCount;
module.exports.getAllRoomParticipantCounts = getAllRoomParticipantCounts;

const socketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.username} connected`);
    
    // Add user to connected users
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user
    });

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    // Join user to appropriate rooms
    const userRooms = await getUserRooms(socket.user);
    socket.emit('chatRooms', userRooms);

    // Handle joining a room
    socket.on('joinRoom', async (roomId) => {
      try {
        socket.join(roomId);
        
        // Load messages for the room
        let messages = [];
        try {
          messages = await Message.find({ chatRoom: roomId })
            .populate('sender', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
          messages.reverse();
        } catch (error) {
          console.log(`📧 Could not load messages for room ${roomId}:`, error.message);
        }
        
        const userCount = socket.adapter.rooms.get(roomId)?.size || 0;
        
        socket.emit('joined-room', {
          roomId,
          messages,
          userCount
        });
        
      } catch (error) {
        console.error('❌ Error joining room:', error);
        socket.emit('joined-room', { roomId, messages: [], userCount: 0 });
      }
    });

    // Handle leaving a room
    socket.on('leaveRoom', async (roomId) => {
      try {
        socket.leave(roomId);
        console.log(`User ${socket.user.username} left room ${roomId}`);

        // Notify room about user leaving
        socket.to(roomId).emit('userLeft', {
          userId: socket.userId,
          username: socket.user.username
        });

      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { content, roomId } = data;

        if (!content?.trim()) {
          return socket.emit('error', { message: 'Nachricht darf nicht leer sein' });
        }

        const message = new Message({
          content: content.trim(),
          sender: socket.userId,
          chatRoom: roomId
        });

        await message.save();
        await message.populate('sender', 'username avatar');

        // Send message to all users in the room
        io.to(roomId).emit('newMessage', {
          id: message._id,
          content: message.content,
          sender: {
            id: message.sender._id,
            username: message.sender.username,
            avatar: message.sender.avatar
          },
          chatRoom: message.chatRoom,
          likes: [],
          likesCount: 0,
          createdAt: message.createdAt
        });

        // Update room's last message
        await ChatRoom.findByIdAndUpdate(roomId, {
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt
          }
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Fehler beim Senden der Nachricht' });
      }
    });

    // Handle message likes
    socket.on('likeMessage', async (messageId) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Nachricht nicht gefunden' });
        }

        const userLikeIndex = message.likes.findIndex(
          like => like.user.toString() === socket.userId
        );

        if (userLikeIndex > -1) {
          // Unlike
          message.likes.splice(userLikeIndex, 1);
        } else {
          // Like
          message.likes.push({
            user: socket.userId,
            createdAt: new Date()
          });
        }

        message.likesCount = message.likes.length;
        await message.save();
        await message.populate('sender', 'username avatar');

        // Broadcast updated message to room
        io.to(message.chatRoom.toString()).emit('messageUpdate', {
          id: message._id,
          content: message.content,
          sender: {
            id: message.sender._id,
            username: message.sender.username,
            avatar: message.sender.avatar
          },
          chatRoom: message.chatRoom,
          likes: message.likes.map(like => like.user.toString()),
          likesCount: message.likesCount,
          createdAt: message.createdAt,
          media: message.media
        });

      } catch (error) {
        console.error('Like message error:', error);
        socket.emit('error', { message: 'Fehler beim Liken der Nachricht' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify all rooms about user going offline
      const onlineUsers = Array.from(connectedUsers.keys());
      socket.broadcast.emit('onlineUsers', onlineUsers);
    });
  });
};

// Helper function to get user's available rooms
const getUserRooms = async (user) => {
  let rooms = [];

  if (user.locationEnabled && user.location.coordinates[0] !== 0) {
    // Get location-based rooms
    const nearbyRooms = await ChatRoom.find({
      type: 'location',
      isActive: true,
      location: {
        $near: {
          $geometry: user.location,
          $maxDistance: 20000
        }
      }
    });
    rooms = [...nearbyRooms];
  }

  // Add global room
  const globalRoom = await ChatRoom.findOne({ type: 'global' });
  if (globalRoom) rooms.push(globalRoom);

  // Add active event rooms
  const eventRooms = await ChatRoom.find({
    type: 'event',
    isActive: true,
    eventEndDate: { $gt: new Date() }
  });
  rooms = [...rooms, ...eventRooms];

  return rooms.map(room => ({
    id: room._id,
    name: room.name,
    type: room.type,
    participants: room.participants.length
  }));
};

module.exports = socketHandler;
