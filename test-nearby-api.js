const axios = require('axios');

const API_URL = 'https://chatilo.de/api';
const TEST_EMAIL = 'test@chatilo.com';
const TEST_PASSWORD = 'test123';

async function testNearbyRoomsAPI() {
  console.log('\n🔍 Testing /api/chat/rooms/nearby endpoint...\n');
  
  let token;
  
  // Step 1: Login to get fresh token
  try {
    console.log(`🔐 Logging in as ${TEST_EMAIL}...`);
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    token = loginResponse.data.token;
    console.log(`✅ Login successful! Token: ${token.substring(0, 50)}...`);
    console.log(`👤 User: ${loginResponse.data.user.username} (${loginResponse.data.user.email})`);
  } catch (error) {
    console.error('\n❌ Login failed:', error.response?.data || error.message);
    return;
  }
  
  // Step 2: Test nearby rooms with Berlin coordinates
  const berlinLat = 52.464;
  const berlinLng = 13.384;
  
  try {
    console.log(`\n📍 Requesting rooms near Berlin: ${berlinLat}, ${berlinLng}`);
    
    const response = await axios.get(`${API_URL}/chat/rooms/nearby`, {
      params: {
        lat: berlinLat,
        lng: berlinLng,
        radius: 20000 // 20km
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n✅ API Response:', response.status);
    console.log('📊 Success:', response.data.success);
    console.log('📊 Total rooms:', response.data.count);
    
    if (response.data.rooms) {
      console.log(`\n📍 Nearby rooms (within 20km of Berlin):`);
      response.data.rooms.forEach((room, i) => {
        const city = room.location?.city || room.location?.town || room.location?.village || 'Unknown';
        const distance = room.distance ? `${Math.round(room.distance/1000)}km` : 'N/A';
        console.log(`   ${i+1}. ${room.name} (${city}) - ${distance}`);
      });
      
      // Check if Koblenz rooms appear (should NOT)
      const koblenzRooms = response.data.rooms.filter(r => 
        r.name.includes('Koblenz') || r.location?.city?.includes('Koblenz')
      );
      if (koblenzRooms.length > 0) {
        console.log(`\n⚠️  WARNING: Found ${koblenzRooms.length} Koblenz rooms! Filtering not working!`);
      } else {
        console.log(`\n✅ SUCCESS: No Koblenz rooms found! Filtering is working!`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.status, error.response?.statusText);
    console.error('❌ Details:', error.response?.data);
  }
}

testNearbyRoomsAPI();
