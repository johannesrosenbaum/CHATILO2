// Test script to verify routing configuration
console.log('🧪 ROUTING TEST SCRIPT');

// Function to test navigation
const testRouting = () => {
  console.log('🔧 Testing React Router navigation...');
  
  // Check if we're in the right context
  if (typeof window === 'undefined') {
    console.log('❌ Not in browser context');
    return;
  }
  
  console.log('✅ Current location:', {
    href: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });
  
  // Test path parsing
  const testPaths = [
    '/chat',
    '/chat/neighborhood_dedenbach',
    '/chat/test_room_123',
    '/chat/another/room'
  ];
  
  console.log('🔧 Testing path parsing:');
  testPaths.forEach(path => {
    const parts = path.split('/').filter(part => part);
    const roomId = parts.length > 1 ? parts[1] : undefined;
    console.log(`  Path: ${path} → Parts: [${parts.join(', ')}] → RoomId: ${roomId || 'undefined'}`);
  });
  
  // Check if React Router is available
  if (window.ReactRouterDOM) {
    console.log('✅ React Router DOM is available');
  } else {
    console.log('⚠️ React Router DOM not found in window');
  }
  
  // Test manual navigation
  console.log('🚀 Testing manual navigation to /chat/test_room...');
  const originalPath = window.location.pathname;
  
  // Use history.pushState to simulate navigation
  history.pushState(null, '', '/chat/test_room');
  console.log('New pathname:', window.location.pathname);
  
  // Restore original path after 2 seconds
  setTimeout(() => {
    history.pushState(null, '', originalPath);
    console.log('Restored pathname:', window.location.pathname);
  }, 2000);
};

// Run the test
testRouting();

// Export for manual calling
window.testRouting = testRouting;
