const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/location');
const chatRoutes = require('./routes/chat');
const initSimpleChat = require('./simple-chat');

// Initialize app
const app = express();
const PORT = process.env.PORT || 1113;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:1234'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 CHATILO Server running on port ${PORT}`);
});

// Connect to database
connectDB();

// Initialize simple chat - CLEAN AND SIMPLE
const io = initSimpleChat(server);

console.log('✅ Simple Chat initialized successfully');
