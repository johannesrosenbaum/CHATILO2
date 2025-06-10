const axios = require('axios');

const BASE_URL = 'http://localhost:1113';
const TEST_COORDS = {
  lat: 50.4662,
  lng: 7.2297
};

console.log('🔍 DEBUG: Testing API calls...');

// Teste Login und Token
async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'johannes.rosenbaum92@gmail.com',
      password: 'dein-passwort' // ÄNDERE DAS!
    });
    
    if (response.data.token) {
      console.log('✅ Login successful, token received');
      return response.data.token;
    } else {
      console.log('❌ No token in response');
      return null;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Teste Rooms API DIREKT
async function testRoomsAPI(token) {
  try {
    console.log('🏠 Testing rooms API...');
    console.log(`🔗 URL: ${BASE_URL}/api/chat/rooms/nearby?latitude=${TEST_COORDS.lat}&longitude=${TEST_COORDS.lng}`);
    
    const response = await axios.get(`${BASE_URL}/api/chat/rooms/nearby`, {
      params: {
        latitude: TEST_COORDS.lat,
        longitude: TEST_COORDS.lng
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Rooms API successful!');
    console.log('📦 Response:', JSON.stringify(response.data, null, 2));
    
    // Prüfe die Room-Daten
    if (response.data.rooms) {
      console.log('🔍 Room distances:');
      response.data.rooms.forEach(room => {
        console.log(`   📍 ${room.name}: ${room.distance}km (type: ${room.type}, subType: ${room.subType})`);
      });
    }
    
  } catch (error) {
    console.log('❌ Rooms API failed:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Token issue detected!');
    }
  }
}

// Teste Location Name API
async function testLocationAPI(token) {
  try {
    console.log('📍 Testing location API...');
    
    const response = await axios.get(`${BASE_URL}/api/location/name`, {
      params: {
        lat: TEST_COORDS.lat,
        lng: TEST_COORDS.lng
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Location API successful!');
    console.log('📍 Location:', response.data);
    
  } catch (error) {
    console.log('❌ Location API failed:', error.response?.status, error.response?.data || error.message);
  }
}

// HAUPTFUNKTION
async function runDebug() {
  console.log('🚀 Starting API Debug...');
  console.log('🎯 Server:', BASE_URL);
  console.log('📍 Test Coordinates:', TEST_COORDS);
  console.log('');
  
  // 1. Login Test
  const token = await testLogin();
  if (!token) {
    console.log('❌ Cannot continue without token');
    return;
  }
  
  console.log('');
  
  // 2. Location API Test
  await testLocationAPI(token);
  
  console.log('');
  
  // 3. Rooms API Test (DAS IST DER KRITISCHE TEST!)
  await testRoomsAPI(token);
}

// RUN
runDebug().catch(console.error);
