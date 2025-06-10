const mongoose = require('mongoose');
const User = require('../models/User');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database indexes...');
    
    // Drop old problematic indexes
    try {
      await User.collection.dropIndex('lastLocation_2dsphere');
      console.log('✅ Dropped old location index');
    } catch (error) {
      console.log('ℹ️ No old index to drop');
    }
    
    // Create proper 2dsphere index
    await User.collection.createIndex({ lastLocation: '2dsphere' });
    console.log('✅ Created proper GeoJSON index');
    
    // Fix existing users with invalid location data
    const usersWithInvalidLocation = await User.find({
      'lastLocation.coordinates': { $exists: false }
    });
    
    console.log(`🔧 Found ${usersWithInvalidLocation.length} users with invalid location data`);
    
    for (const user of usersWithInvalidLocation) {
      user.lastLocation = {
        type: 'Point',
        coordinates: [0, 0]
      };
      await user.save();
      console.log(`✅ Fixed location for user: ${user.username}`);
    }
    
    console.log('✅ Database setup complete');
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
}

module.exports = { setupDatabase };
