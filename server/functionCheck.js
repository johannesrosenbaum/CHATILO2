
const axios = require('axios');
const endpoints = [
  { name: 'Admin Stats', url: 'http://localhost:3000/api/admin/stats', method: 'get' },
  { name: 'Health', url: 'http://localhost:3000/api/health', method: 'get' },
  { name: 'Login', url: 'http://localhost:3000/api/auth/login', method: 'post', data: { username: 'root', password: 'Neogrcz8+' } },
  { name: 'Register', url: 'http://localhost:3000/api/auth/register', method: 'post', data: { username: 'testuser', password: 'test1234' } },
  { name: 'Get Me', url: 'http://localhost:3000/api/auth/me', method: 'get' },
  { name: 'Rooms', url: 'http://localhost:3000/api/rooms', method: 'get' },
  { name: 'Nearby Rooms', url: 'http://localhost:3000/api/rooms/nearby', method: 'get' },
  { name: 'Location Name', url: 'http://localhost:3000/api/location/name', method: 'get' },
  // Weitere Endpunkte nach Bedarf ergänzen
];

async function runChecks() {
  const log = [];
  let token = null;
  for (const ep of endpoints) {
    try {
      let config = {};
      if (token) config.headers = { Authorization: `Bearer ${token}` };
      let res;
      if (ep.method === 'get') {
        res = await axios.get(ep.url, config);
      } else if (ep.method === 'post') {
        res = await axios.post(ep.url, ep.data, config);
        if (ep.name === 'Login' && res.data.token) token = res.data.token;
      }
      log.push({ endpoint: ep.name, status: res.status, data: res.data });
    } catch (err) {
      log.push({ endpoint: ep.name, error: err.message });
    }
  }
  console.log('Funktionscheck Log:', JSON.stringify(log, null, 2));
}

runChecks();
