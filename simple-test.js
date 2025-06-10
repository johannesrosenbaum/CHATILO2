const https = require('https');
const http = require('http');

console.log('🔍 Simple API Test without axios...');

// Test ohne komplexe Dependencies
async function testAPI() {
  try {
    console.log('🔗 Testing: http://localhost:1113/api/chat/rooms/nearby?latitude=50.4662&longitude=7.2297');
    
    const options = {
      hostname: 'localhost',
      port: 1113,
      path: '/api/chat/rooms/nearby?latitude=50.4662&longitude=7.2297',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Ersetze mit echtem Token
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`📥 Status: ${res.statusCode}`);
      console.log(`📥 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Response:', JSON.stringify(jsonData, null, 2));
          
          if (jsonData.rooms) {
            console.log('🔍 Room types:');
            jsonData.rooms.forEach(room => {
              console.log(`   📦 ${room.name}: type=${room.type}, subType=${room.subType}, distance=${room.distance}`);
            });
          }
        } catch (e) {
          console.log('📄 Raw response:', data);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request error:', err);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAPI();
