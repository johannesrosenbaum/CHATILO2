const http = require('http');

// Neuen User erstellen und gleich testen
const registerData = JSON.stringify({
  username: 'testuser456',
  email: 'test456@test.com',
  password: 'test123'
});

console.log('1. Registering new user with fixed password hashing...');

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
    
    if (res.statusCode === 201) {
      // Dann sofort einloggen
      const loginData = JSON.stringify({
        email: 'test456@test.com',
        password: 'test123'
      });

      console.log('\n2. Testing login with the same credentials...');
      
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
          if (res.statusCode === 200) {
            console.log('\n✅ Authentication works! Problem is fixed.');
          } else {
            console.log('\n❌ Login still failing.');
          }
          process.exit(0);
        });
      });

      loginReq.on('error', (e) => {
        console.error('Login error:', e.message);
        process.exit(1);
      });

      loginReq.write(loginData);
      loginReq.end();
    } else {
      console.log('Registration failed, skipping login test.');
      process.exit(1);
    }
  });
});

registerReq.on('error', (e) => {
  console.error('Register error:', e.message);
  process.exit(1);
});

registerReq.write(registerData);
registerReq.end();
