const axios = require('axios');

async function testNearbyRoomsAPI() {
  console.log('🧪 DIRECT API TEST - NEARBY ROOMS');
  console.log('================================\n');

  const API_BASE = 'http://localhost:1113';
  
  try {
    // 1. Test Health Endpoint
    console.log('1. Testing Health Endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/api/health`);
    console.log('✅ Health OK:', healthResponse.data);
    
    // 2. Test Auth with TEST USER
    console.log('\n2. Testing Auth...');
    const authResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'test@chatilo.com',
      password: 'test123'
    });
    console.log('✅ Auth OK, got token');
    const token = authResponse.data.token;
    
    // 3. Test nearby rooms DIREKT
    console.log('\n3. Testing POST /api/rooms/nearby...');
    const nearbyResponse = await axios.post(`${API_BASE}/api/rooms/nearby`, {
      latitude: 50.4662,
      longitude: 7.2297,
      radius: 10000
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS! Nearby rooms response:');
    console.log(`Found ${nearbyResponse.data.length} rooms:`);
    nearbyResponse.data.forEach((room, index) => {
      console.log(`  ${index + 1}. ${room.name} (${room.distance}km, ${room.participants} users)`);
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.status, error.response?.statusText);
    console.error('Response data:', error.response?.data);
    console.error('URL attempted:', error.config?.url);
  }
}

async function testChatRoute() {
  console.log('\n🧪 TESTING /api/chat/rooms/nearby');
  console.log('=================================\n');

  const API_BASE = 'http://localhost:1113';
  
  try {
    // Get token with test user
    const authResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'test@chatilo.com',
      password: 'test123'
    });
    const token = authResponse.data.token;
    console.log('✅ Authenticated with test user');
    
    // Test chat route
    const chatResponse = await axios.post(`${API_BASE}/api/chat/rooms/nearby`, {
      latitude: 50.4662,
      longitude: 7.2297,
      radius: 10000
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS! Chat route response:');
    console.log(`Found ${chatResponse.data.length} rooms via chat route`);
    
  } catch (error) {
    console.error('❌ Chat route ERROR:', error.response?.status);
    console.error('Response:', error.response?.data);
  }
}

// Run tests
(async () => {
  await testNearbyRoomsAPI();
  await testChatRoute();
})();
