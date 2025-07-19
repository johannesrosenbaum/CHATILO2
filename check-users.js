const mongoose = require('mongoose');
const User = require('./server/models/User');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chatilo');
    console.log('Connected to MongoDB');
    
    const users = await User.find({}).limit(10);
    console.log('Found', users.length, 'users:');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User:`, {
        _id: user._id,
        username: user.username,
        email: user.email
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
