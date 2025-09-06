const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

async function createTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://admin:chatilo123@localhost:27017/chatilo?authSource=admin');
    console.log('✅ Connected to database');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@chatilo.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log('   Email: test@chatilo.com');
      console.log('   Password: test123');
      await mongoose.disconnect();
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 12);
    const testUser = new User({
      username: 'testuser',
      email: 'test@chatilo.com',
      password: hashedPassword,
      locationEnabled: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('   Email: test@chatilo.com');
    console.log('   Password: test123');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createTestUser();
