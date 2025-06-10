const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// User Schema (kopiert aus dem Model)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  locationEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/chatilo');
    console.log('✅ Connected to database');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@chatilo.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log(`   Email: test@chatilo.com`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Password: test123`);
      return;
    }

    // Create new test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = new User({
      username: 'testuser',
      email: 'test@chatilo.com', 
      password: hashedPassword,
      locationEnabled: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('   Email: test@chatilo.com');
    console.log('   Password: test123');
    console.log('');
    console.log('🧪 Now run: npm run test-api');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

createTestUser();
