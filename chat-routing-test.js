// Test das Chat-Routing im Browser
// Diese Funktionen in der Browser-Console ausführen

function testChatRouting() {
  console.log('🧪 TESTING CHAT ROUTING...');
  
  // Test 1: Direkt zu einer Chat-Room URL navigieren
  const testRoomId = 'neighborhood_dedenbach';
  const targetUrl = `/chat/${testRoomId}`;
  
  console.log('🚀 Test 1: Direct navigation to:', targetUrl);
  window.history.pushState({}, '', targetUrl);
  
  setTimeout(() => {
    console.log('🔍 Test 1 Results:');
    console.log('- URL:', window.location.href);
    console.log('- Pathname:', window.location.pathname);
    console.log('- Expected roomId:', window.location.pathname.split('/')[2]);
    
    // Test 2: Triggere React Router update
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    setTimeout(() => {
      console.log('🔍 Test 2 Results (after popstate):');
      console.log('- URL:', window.location.href);
      console.log('- Component should now recognize roomId');
      
      // Test 3: Zurück zur base /chat
      window.history.pushState({}, '', '/chat');
      setTimeout(() => {
        console.log('🔍 Test 3 Results (back to /chat):');
        console.log('- URL:', window.location.href);
        console.log('- Should show AIWelcome again');
      }, 100);
    }, 100);
  }, 100);
}

function simulateRoomClick(roomId = 'neighborhood_dedenbach') {
  console.log('🎭 SIMULATING ROOM CLICK for:', roomId);
  
  // Simuliere das was ChatRoomList.handleRoomClick macht
  const targetPath = `/chat/${roomId}`;
  console.log('🚪 Navigating to:', targetPath);
  
  // Navigation
  window.history.pushState({}, '', targetPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
  
  setTimeout(() => {
    console.log('✅ Navigation complete. URL:', window.location.href);
    console.log('🔧 Expected roomId:', window.location.pathname.split('/')[2]);
  }, 100);
}

function getCurrentRoomInfo() {
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const roomId = parts[2];
  
  console.log('📊 CURRENT ROOM INFO:');
  console.log('- Full URL:', window.location.href);
  console.log('- Pathname:', pathname);
  console.log('- Path parts:', parts);
  console.log('- Extracted roomId:', roomId);
  console.log('- Has roomId:', !!roomId);
  
  return { pathname, parts, roomId, hasRoom: !!roomId };
}

// Mache Funktionen global verfügbar
window.chatRoutingTest = {
  testChatRouting,
  simulateRoomClick,
  getCurrentRoomInfo,
  goToRoom: (roomId) => simulateRoomClick(roomId),
  goToChat: () => {
    window.history.pushState({}, '', '/chat');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
};

console.log('🧪 Chat Routing Test Functions verfügbar:');
console.log('- chatRoutingTest.testChatRouting()');
console.log('- chatRoutingTest.simulateRoomClick(roomId)');
console.log('- chatRoutingTest.getCurrentRoomInfo()');
console.log('- chatRoutingTest.goToRoom(roomId)');
console.log('- chatRoutingTest.goToChat()');

// Auto-run initial test
getCurrentRoomInfo();
