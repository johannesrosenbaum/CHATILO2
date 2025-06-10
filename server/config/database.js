const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatilo';
    
    // Fixed connection options - removed deprecated parameters
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, 
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 2,
      // REMOVED: bufferMaxEntries (deprecated)
      // REMOVED: bufferCommands (deprecated)
      // REMOVED: retryWrites (not needed in newer versions)
      // REMOVED: w: 'majority' (not needed here)
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    // Check if MongoDB service is running
    if (error.message.includes('ECONNREFUSED')) {
      console.log('');
      console.log('🔧 MONGODB SETUP REQUIRED:');
      console.log('1. Install MongoDB: https://www.mongodb.com/try/download/community');
      console.log('2. Start MongoDB service:');
      console.log('   - Windows: net start MongoDB');
      console.log('   - Or use MongoDB Compass');
      console.log('3. Or use MongoDB Atlas (cloud): https://cloud.mongodb.com');
      console.log('');
    }
    
    // Don't exit process, allow server to run without DB for development
    console.log('⚠️ Server will run without database connection');
    return null;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during MongoDB shutdown:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
