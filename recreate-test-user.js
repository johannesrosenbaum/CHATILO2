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

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function recreateTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/chatilo');
    console.log('✅ Connected to database');

    // Delete existing test user
    console.log('🗑️ Deleting existing test user...');
    await User.deleteOne({ email: 'test@chatilo.com' });
    console.log('✅ Existing test user deleted');

    // Create new test user
    console.log('👤 Creating fresh test user...');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = new User({
      username: 'testuser',
      email: 'test@chatilo.com', 
      password: hashedPassword,
      locationEnabled: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    
    // Test the password comparison
    console.log('🔍 Testing password comparison...');
    const isMatch = await testUser.comparePassword('test123');
    console.log('   Password test result:', isMatch ? '✅ PASS' : '❌ FAIL');
    
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('   Email: test@chatilo.com');
    console.log('   Password: test123');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('🔌 Disconnected from database');
    await mongoose.disconnect();
  }
}

recreateTestUser();
