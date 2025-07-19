// Debug script to check navigation behavior
console.log('🔍 NAVIGATION DEBUG SCRIPT');

// Check current URL
console.log('Current URL:', window.location.href);
console.log('Current pathname:', window.location.pathname);

// Check React Router location
if (window.React && window.ReactRouterDOM) {
  console.log('React Router available');
} else {
  console.log('React Router not available in window');
}

// Check if navigation functions work
const testNavigation = () => {
  console.log('Testing navigation...');
  
  // Test 1: Direct URL change
  console.log('Test 1: Changing URL to /chat/test_room');
  history.pushState(null, '', '/chat/test_room');
  console.log('New URL:', window.location.href);
  console.log('New pathname:', window.location.pathname);
  
  // Test 2: Check if React Router detects the change
  setTimeout(() => {
    console.log('After timeout - URL:', window.location.href);
    console.log('After timeout - pathname:', window.location.pathname);
  }, 100);
};

// Run test
testNavigation();

// Listen for navigation events
window.addEventListener('popstate', (event) => {
  console.log('🔄 PopState event:', event);
  console.log('New URL:', window.location.href);
});

// Listen for React Router location changes
const originalPushState = history.pushState;
history.pushState = function() {
  console.log('🔄 History.pushState called with:', arguments);
  originalPushState.apply(this, arguments);
  console.log('New URL after pushState:', window.location.href);
};

console.log('🔍 Debug script loaded. Check navigation behavior.');
