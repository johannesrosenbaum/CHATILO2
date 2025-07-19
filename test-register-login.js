const http = require('http');

// Erst registrieren
const registerData = JSON.stringify({
  username: 'testuser123',
  email: 'test@test.com',
  password: 'test123'
});

console.log('1. Registering new user...');

const registerOptions = {
  hostname: 'localhost',
  port: 1113,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(registerData)
  }
};

const registerReq = http.request(registerOptions, (res) => {
  console.log('Register Status:', res.statusCode);
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  res.on('end', () => {
    console.log('Register Response:', responseBody);
    
    // Dann einloggen
    const loginData = JSON.stringify({
      email: 'test@test.com',
      password: 'test123'
    });

    console.log('\n2. Testing login...');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 1113,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginReq = http.request(loginOptions, (res) => {
      console.log('Login Status:', res.statusCode);
      let loginResponseBody = '';
      res.on('data', (chunk) => {
        loginResponseBody += chunk;
      });
      res.on('end', () => {
        console.log('Login Response:', loginResponseBody);
        process.exit(0);
      });
    });

    loginReq.on('error', (e) => {
      console.error('Login error:', e.message);
      process.exit(1);
    });

    loginReq.write(loginData);
    loginReq.end();
  });
});

registerReq.on('error', (e) => {
  console.error('Register error:', e.message);
  process.exit(1);
});

registerReq.write(registerData);
registerReq.end();
