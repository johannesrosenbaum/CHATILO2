const axios = require('axios');

const API_URL = 'https://chatilo.de/api';
const TEST_EMAIL = 'test@chatilo.com';
const TEST_PASSWORD = 'test123';

// Berlin coordinates
const BERLIN_LAT = 52.5200;
const BERLIN_LNG = 13.4050;

const berlinDistricts = [
  { name: 'Berlin-Mitte', lat: 52.5200, lng: 13.4050 },
  { name: 'Berlin-Prenzlauer Berg', lat: 52.5406, lng: 13.4175 },
  { name: 'Berlin-Kreuzberg', lat: 52.4987, lng: 13.3903 },
  { name: 'Berlin-Neukölln', lat: 52.4817, lng: 13.4360 },
  { name: 'Berlin-Charlottenburg', lat: 52.5170, lng: 13.2880 },
  { name: 'Berlin-Friedrichshain', lat: 52.5139, lng: 13.4530 },
  { name: 'Berlin-Wedding', lat: 52.5500, lng: 13.3540 },
  { name: 'Berlin-Schöneberg', lat: 52.4858, lng: 13.3500 },
  { name: 'Berlin-Tempelhof', lat: 52.4667, lng: 13.3833 },
  { name: 'Berlin-Spandau', lat: 52.5333, lng: 13.2000 },
];

async function createBerlinRooms() {
  console.log('\n🏙️  Creating Berlin chat rooms...\n');
  
  let token;
  
  // Login
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    token = loginResponse.data.token;
    console.log(`✅ Logged in as ${loginResponse.data.user.username}\n`);
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return;
  }
  
  // Create Berlin rooms
  console.log('📍 Creating rooms in Berlin...\n');
  
  for (const district of berlinDistricts) {
    try {
      const response = await axios.post(
        `${API_URL}/chat/rooms/initialize-local`,
        {
          latitude: district.lat,
          longitude: district.lng,
          address: {
            city: 'Berlin',
            district: district.name,
            country: 'Deutschland'
          }
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        console.log(`✅ ${district.name} - Created/Found`);
      }
    } catch (error) {
      console.error(`❌ ${district.name} - Error:`, error.response?.data?.message || error.message);
    }
  }
  
  console.log('\n✅ Finished creating Berlin rooms!\n');
  
  // Test nearby query
  console.log('🔍 Testing nearby rooms query with Berlin coordinates...\n');
  try {
    const response = await axios.get(`${API_URL}/chat/rooms/nearby`, {
      params: {
        lat: BERLIN_LAT,
        lng: BERLIN_LNG,
        radius: 20000 // 20km
      },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`📊 Found ${response.data.count} rooms within 20km of Berlin:`);
    response.data.rooms.slice(0, 10).forEach((room, i) => {
      const distance = room.distance ? `${Math.round(room.distance/1000)}km` : 'N/A';
      console.log(`   ${i+1}. ${room.name} - ${distance}`);
    });
  } catch (error) {
    console.error('❌ Error testing nearby:', error.response?.data || error.message);
  }
}

createBerlinRooms();
