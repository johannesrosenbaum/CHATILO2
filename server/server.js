require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

// Import routes and handlers - NUR EINMAL!
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const roomRoutes = require('./routes/rooms'); // KORRIGIERT: Dieser Import sollte funktionieren
const locationRoutes = require('./routes/location');
const adminRoutes = require('./routes/admin');
const adminStatsRoutes = require('./routes/adminStats');
const healthRoutes = require('./routes/health');
const eventRoutes = require('./routes/events'); // NEW: Event routes
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

// Upload-Ordner erstellen falls sie nicht existieren
const createUploadDirectories = () => {
  const directories = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/images'),
    path.join(__dirname, 'uploads/videos'),
    path.join(__dirname, 'uploads/files'),
    path.join(__dirname, 'uploads/avatars'),
    path.join(__dirname, 'uploads/events') // NEW: Event cover images
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created upload directory: ${dir}`);
    }
  });
};

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
// Admin-Login und Dashboard
const bodyParser = require('body-parser');
const session = require('express-session');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'adminSecret', resave: false, saveUninitialized: true }));

const ADMIN_USER = 'root';
const ADMIN_PASS = 'Neogrcz8+';

app.get('/admin/login', (req, res) => {
  res.send(`
    <form method="POST" action="/admin/login">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = true;
    res.redirect('/admin');
  } else {
    res.send('Login fehlgeschlagen!');
  }
});

app.use('/admin', (req, res, next) => {
  if (!req.session.admin && req.path !== '/login') return res.redirect('/admin/login');
  next();
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

console.log('🔧 DEBUG: Express app and HTTP server created');

// CORS Configuration für Production mit Domain
const allowedOrigins = [
  'https://chatilo.de',
  'http://chatilo.de', 
  'https://www.chatilo.de',
  'http://www.chatilo.de',
  'https://api.chatilo.de',
  'http://api.chatilo.de',
  // Development
  'http://localhost:1234',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://82.165.140.194:1234',
  'http://82.165.140.194:1113'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('🔍 CORS Check - Origin:', origin);
    // TEMPORÄR: Alle Origins erlauben für Debugging
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ]
};

app.use(cors(corsOptions));

// Socket.IO Configuration - Updated to match CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Same logic as Express CORS
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/)) {
        return callback(null, true);
      }
      
      if (origin.match(/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\d+\.\d+(:\d+)?$/)) {
        return callback(null, true);
      }
      
      return callback(null, false);
    },
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

console.log('🔧 DEBUG: Socket.IO server created with dynamic CORS');
console.log('🔧 DEBUG: Allowed origins:', allowedOrigins);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('📁 Serving static files from /uploads directory');

// Call upload directory creation
createUploadDirectories();

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminStatsRoutes);
app.use('/api/ai', require('./routes/ai'));
app.use('/api/events', eventRoutes); // NEW: Event API routes

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
  console.log('   CORS origins:', allowedOrigins);
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
