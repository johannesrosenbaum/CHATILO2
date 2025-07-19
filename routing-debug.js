// Browser Debug Script für Routing-Problem
// Im Browser-Console ausführen

console.log('🔧 ROUTING DEBUG:');
console.log('Current URL:', window.location.href);
console.log('Pathname:', window.location.pathname);
console.log('Search:', window.location.search);
console.log('Hash:', window.location.hash);

// URL manuell parsen
const pathParts = window.location.pathname.split('/');
console.log('Path parts:', pathParts);
console.log('Expected roomId from URL:', pathParts[2]);

// React Router Status prüfen
if (window.React) {
  console.log('React available');
  // Prüfe ob useParams funktioniert
} else {
  console.log('React nicht verfügbar');
}

// Teste Navigation
function testNavigation(roomId) {
  const targetUrl = `/chat/${roomId}`;
  console.log('🚀 Testing navigation to:', targetUrl);
  window.history.pushState({}, '', targetUrl);
  console.log('🔗 New URL:', window.location.href);
  console.log('🔗 New pathname:', window.location.pathname);
  
  // Check nach kurzer Verzögerung
  setTimeout(() => {
    console.log('🔧 After navigation:');
    console.log('URL:', window.location.href);
    console.log('Path parts:', window.location.pathname.split('/'));
    console.log('Expected roomId:', window.location.pathname.split('/')[2]);
  }, 100);
}

// Test-Funktionen
window.debugRouting = {
  testNavigation,
  getCurrentRoomId: () => window.location.pathname.split('/')[2],
  goToRoom: (roomId) => testNavigation(roomId)
};

console.log('🎯 Debug functions available:');
console.log('- debugRouting.testNavigation(roomId)');
console.log('- debugRouting.getCurrentRoomId()');
console.log('- debugRouting.goToRoom(roomId)');

// Sofortiger Test
testNavigation('neighborhood_dedenbach');
