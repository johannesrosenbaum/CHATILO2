require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import routes and handlers - NUR EINMAL!
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const roomRoutes = require('./routes/rooms'); // KORRIGIERT: Dieser Import sollte funktionieren
const locationRoutes = require('./routes/location');
const adminRoutes = require('./routes/admin');
const healthRoutes = require('./routes/health');
const socketHandler = require('./sockets/socketHandler');

// Create databaseSetup function inline
async function setupDatabase() {
  console.log('🔧 Setting up database...');
  try {
    const User = require('./models/User');
    
    // Create proper 2dsphere index
    await User.collection.createIndex({ lastLocation: '2dsphere' });
    console.log('✅ Database indexes created');
    
  } catch (error) {
    console.log('ℹ️ Database setup completed (indexes may already exist)');
  }
}

console.log('🚀 SERVER STARTUP DEBUG:');
console.log('   Node Version:', process.version);
console.log('   Platform:', process.platform);
console.log('   Current Working Directory:', process.cwd());
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Available environment variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_')));

console.log('✅ All modules imported successfully');

// Express App Setup
const app = express();
const server = http.createServer(app);

console.log('🔧 DEBUG: Express app and HTTP server created');

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:1234',
    'http://localhost:3000',
    'http://192.168.178.82:1234'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:1234',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

console.log('🔧 DEBUG: Socket.IO server created with CORS:', {
  origins: ['http://localhost:1234', 'http://localhost:3000'],
  transports: ['websocket', 'polling']
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/admin', adminRoutes);

// Debug route information
app._router.stack.forEach((middleware, index) => {
  if (middleware.route) {
    console.log(`📁 Route ${index}: ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`📁 Router ${index}: ${middleware.regexp}`);
    if (middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((route, routeIndex) => {
        if (route.route) {
          const methods = Object.keys(route.route.methods);
          console.log(`  📍 Sub-route ${routeIndex}: ${route.route.path} [ ${methods.join(', ')} ]`);
        }
      });
    }
  }
});

// Socket Handler Initialization - NUR EINMAL!
console.log('🔧 DEBUG: Importing socket handler...');
console.log('🔧 DEBUG: Initializing socket handler...');

if (typeof socketHandler === 'function') {
  socketHandler(io);
  console.log('✅ Socket handler initialized');
} else {
  console.error('❌ Socket handler is not a function:', typeof socketHandler);
}

// MongoDB Configuration
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatilo';

console.log('🔌 Connecting to MongoDB...');

// MongoDB Connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected:', mongoose.connection.host);
  console.log('📊 Database:', mongoose.connection.name);
  
  // Database Setup aufrufen
  await setupDatabase();
  
  console.log('✅ Database connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('💥 Express error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Server Start
const PORT = process.env.PORT || 1113;

server.listen(PORT, () => {
  console.log(`🚀 CHATILO Server running on port ${PORT}`);
  console.log('🔧 DEBUG: Server startup complete');
  console.log(`   Server address: http://localhost:${PORT}`);
  console.log('   Socket.IO ready for connections');
  console.log('   CORS origins:', corsOptions.origin);
  console.log('   Process ID:', process.pid);
  console.log('   Memory usage:', process.memoryUsage());
  console.log('   Uptime:', process.uptime(), 'seconds');
  console.log('   Static uploads folder:', path.join(__dirname, 'uploads'));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔌 MongoDB disconnected');
  mongoose.connection.close(() => {
    console.log('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🔌 MongoDB disconnected');
  mongoose.connection.close(() => {
    console.log('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  });
});
