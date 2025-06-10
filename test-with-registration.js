const axios = require('axios');

async function testWithRegistration() {
  console.log('🧪 TEST WITH NEW USER REGISTRATION');
  console.log('===================================\n');

  const API_BASE = 'http://localhost:1113';
  const testUser = {
    username: 'testuser' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'test123',
    locationEnabled: true
  };
  
  try {
    // 1. Register new user
    console.log('1. Registering new user...');
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}`);
    
    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, testUser);
    console.log('✅ Registration successful');
    
    // 2. Login with new user
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, got token');
    
    // 3. Test nearby rooms
    console.log('\n3. Testing nearby rooms...');
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
    
    console.log('✅ SUCCESS! Nearby rooms found:');
    console.log(`   Count: ${nearbyResponse.data.length}`);
    nearbyResponse.data.forEach((room, index) => {
      console.log(`   ${index + 1}. ${room.name} (${room.distance}km, ${room.participants} users)`);
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error.response?.status, error.response?.statusText);
    console.error('Response data:', error.response?.data);
  }
}

testWithRegistration();
