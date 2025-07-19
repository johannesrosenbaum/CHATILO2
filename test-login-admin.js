const http = require('http');

const postData = JSON.stringify({
  email: 'admin@chatilo.ai',
  password: 'admin123'
});

console.log('Testing login with admin credentials...');

const options = {
  hostname: 'localhost',
  port: 1113,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  res.on('end', () => {
    console.log('Response:', responseBody);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(postData);
req.end();
