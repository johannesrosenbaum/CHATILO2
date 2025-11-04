const axios = require('axios');

const API_URL = 'https://chatilo.de/api';
const TEST_EMAIL = 'test@chatilo.com';
const TEST_PASSWORD = 'test123';

async function checkRoomLocations() {
  console.log('\n🔍 Checking room location data...\n');
  
  let token;
  
  // Login
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    token = loginResponse.data.token;
    console.log(`✅ Logged in as ${loginResponse.data.user.username}`);
  } catch (error) {
    console.error('❌ Login failed');
    return;
  }
  
  // Get all user rooms
  try {
    console.log('\n📍 Fetching all user rooms...\n');
    const response = await axios.get(`${API_URL}/chat/rooms/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const rooms = response.data.rooms || [];
    console.log(`Found ${rooms.length} total rooms\n`);
    
    // Check location data
    rooms.slice(0, 10).forEach((room, i) => {
      console.log(`${i+1}. ${room.name}`);
      console.log(`   _id: ${room._id}`);
      console.log(`   type: ${room.type}`);
      if (room.location) {
        console.log(`   location.latitude: ${room.location.latitude}`);
        console.log(`   location.longitude: ${room.location.longitude}`);
        console.log(`   location.city: ${room.location.city || 'N/A'}`);
        console.log(`   location.country: ${room.location.country || 'N/A'}`);
      } else {
        console.log(`   location: ❌ MISSING!`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkRoomLocations();
