// Browser-Konsole Debug-Script für Chatilo
// Kopiere und füge dieses Script in die Browser-Konsole ein

console.log('🔧 ROUTING DEBUG: Starting manual test...');

// 1. Aktuelle URL prüfen
console.log('📍 Current URL:', window.location.href);
console.log('📍 Current pathname:', window.location.pathname);

// 2. React Router Zustand prüfen (falls verfügbar)
if (window.React && window.React.__ReactDevTools) {
  console.log('🔧 React DevTools available');
}

// 3. Simuliere einen Raum-Join mit verbesserter Navigation
function testRoomJoin(roomId) {
  console.log('🚪 Testing room join for:', roomId);
  
  // Navigiere direkt zur Room-URL
  const targetUrl = `/chat/${roomId}`;
  console.log('🔗 Navigating to:', targetUrl);
  
  // Verwende window.history.pushState für sofortige Navigation
  window.history.pushState({}, '', targetUrl);
  
  // Trigger PopState Event für React Router
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  
  // Überprüfe nach kurzer Zeit
  setTimeout(() => {
    console.log('📍 URL after navigation:', window.location.href);
    console.log('📍 Pathname after navigation:', window.location.pathname);
    
    // Prüfe, ob ChatInterface geladen wurde
    const chatInterface = document.querySelector('[class*="ChatInterface"]') || 
                         document.querySelector('[class*="chat-interface"]') ||
                         document.querySelector('input[placeholder*="nachricht"]') ||
                         document.querySelector('input[placeholder*="message"]');
    
    const aiWelcome = document.querySelector('[class*="AIWelcome"]') ||
                     document.querySelector('[class*="ai-welcome"]') ||
                     document.querySelector('*:contains("Chatilo KI-Assistent")');
    
    console.log('🔍 Elements found:');
    console.log('   ChatInterface present:', !!chatInterface);
    console.log('   AIWelcome present:', !!aiWelcome);
    
    if (chatInterface) {
      console.log('✅ SUCCESS: ChatInterface is showing');
      console.log('   Input field:', chatInterface);
    } else if (aiWelcome) {
      console.log('❌ PROBLEM: Still showing AIWelcome instead of ChatInterface');
      console.log('   Debug: Check if roomId param is correctly parsed');
      
      // Force trigger React Router update
      console.log('🔄 Trying to force React Router update...');
      window.dispatchEvent(new Event('hashchange'));
      window.dispatchEvent(new Event('popstate'));
      
      // Try different navigation approach
      setTimeout(() => {
        if (window.history && window.history.go) {
          console.log('🔄 Trying history.go(0) to force refresh...');
          window.history.go(0);
        }
      }, 200);
    } else {
      console.log('⚠️ UNKNOWN: Neither component clearly identified');
    }
  }, 500);
}

// 4. Führe Test aus
console.log('🧪 Testing with room: neighborhood_dedenbach');
testRoomJoin('neighborhood_dedenbach');

// 5. Alternative direkte Navigation
function directNavigationTest() {
  console.log('🔄 Trying direct navigation...');
  window.location.href = '/chat/neighborhood_dedenbach';
}

// 6. Neue Funktion: Klick auf ersten Chat-Raum simulieren
function simulateRoomClick() {
  console.log('🖱️ Simulating click on first chat room...');
  
  // Finde den ersten Chat-Raum Button
  const roomButton = document.querySelector('[class*="ListItemButton"]') ||
                    document.querySelector('[data-testid*="room"]') ||
                    document.querySelector('li button') ||
                    document.querySelector('[role="button"]');
  
  if (roomButton) {
    console.log('📍 Found room button:', roomButton);
    roomButton.click();
    
    setTimeout(() => {
      console.log('📍 URL after click:', window.location.href);
    }, 200);
  } else {
    console.log('❌ No room button found');
  }
}

// Zeige verfügbare Funktionen
console.log('🛠️ Available test functions:');
console.log('   testRoomJoin("neighborhood_dedenbach") - Test room join');
console.log('   directNavigationTest() - Test direct navigation');
console.log('   simulateRoomClick() - Simulate click on first room');
