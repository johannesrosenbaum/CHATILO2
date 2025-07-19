// Test script for Chatilo features
console.log('🧪 Chatilo Feature Tests');

// Test 1: Check if upload directories exist
const testUploadDirectories = () => {
  console.log('📁 Testing upload directories...');
  
  // These directories should be created by the server
  const expectedDirs = [
    '/uploads',
    '/uploads/images', 
    '/uploads/videos',
    '/uploads/files',
    '/uploads/avatars'
  ];
  
  expectedDirs.forEach(dir => {
    fetch(`http://localhost:1113${dir}`)
      .then(response => {
        console.log(`📁 ${dir}: ${response.status === 200 ? '✅ Available' : '❌ Not found'}`);
      })
      .catch(error => {
        console.log(`📁 ${dir}: ❌ Error - ${error.message}`);
      });
  });
};

// Test 2: Check API endpoints
const testApiEndpoints = () => {
  console.log('🔌 Testing API endpoints...');
  
  const endpoints = [
    '/api/health',
    '/api/auth/me',
    '/api/chat/rooms'
  ];
  
  endpoints.forEach(endpoint => {
    fetch(`http://localhost:1113${endpoint}`)
      .then(response => {
        console.log(`🔌 ${endpoint}: ${response.status} ${response.statusText}`);
      })
      .catch(error => {
        console.log(`🔌 ${endpoint}: ❌ Error - ${error.message}`);
      });
  });
};

// Test 3: Socket.IO connection
const testSocketConnection = () => {
  console.log('🔗 Testing Socket.IO connection...');
  
  // This would normally be done with socket.io-client
  // For now, just check if the server responds to socket requests
  fetch('http://localhost:1113/socket.io/')
    .then(response => {
      console.log(`🔗 Socket.IO: ${response.status === 200 ? '✅ Available' : '❌ Not available'}`);
    })
    .catch(error => {
      console.log(`🔗 Socket.IO: ❌ Error - ${error.message}`);
    });
};

// Run tests
if (typeof window !== 'undefined') {
  // Browser environment
  setTimeout(() => {
    testUploadDirectories();
    testApiEndpoints(); 
    testSocketConnection();
  }, 1000);
} else {
  // Node environment
  console.log('Run this script in the browser console for testing');
}

export {
  testUploadDirectories,
  testApiEndpoints,
  testSocketConnection
};
