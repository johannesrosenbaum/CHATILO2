// Service Worker für Push Notifications
console.log('🔧 [SW] Service Worker loaded');

// Push Notification Event Handler
self.addEventListener('push', function(event) {
  console.log('🔔 [SW] Push notification received:', event);
  
  if (!event.data) {
    console.log('❌ [SW] No data in push event');
    return;
  }

  const data = event.data.json();
  console.log('📄 [SW] Push data:', data);

  const options = {
    body: data.body,
    icon: data.icon || '/icons/chatilo-icon-192.png',
    badge: data.badge || '/icons/chatilo-badge-72.png',
    tag: data.tag || 'chatilo-notification',
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: [200, 100, 200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event Handler
self.addEventListener('notificationclick', function(event) {
  console.log('👆 [SW] Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    console.log('❌ [SW] User chose to close notification');
    return;
  }

  if (event.action === 'open' || !event.action) {
    const data = event.notification.data;
    const url = data && data.url ? data.url : '/';
    
    console.log('🌐 [SW] Opening URL:', url);

    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(function(clients) {
        // Prüfe ob bereits ein Tab offen ist
        for (const client of clients) {
          if (client.url.includes(window.location.origin) && 'focus' in client) {
            console.log('🔄 [SW] Focusing existing window');
            return client.focus().then(() => {
              // Navigiere zum Chat-Raum
              if (data && data.roomId) {
                client.postMessage({
                  type: 'NAVIGATE_TO_ROOM',
                  roomId: data.roomId
                });
              }
            });
          }
        }
        
        // Öffne neuen Tab
        console.log('🆕 [SW] Opening new window');
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Push Subscription Change Event
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('🔄 [SW] Push subscription changed');
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BPpO9pd7r_WIE5z3TqTqztHFes3KjgU1CBnFghuGhTozNbMah2F3EJJdn4GuQ41kWCqKsGVyahzzQHLhW3G5FPY'
    }).then(function(newSubscription) {
      console.log('✅ [SW] New subscription created');
      
      // Sende neue Subscription an Server
      return fetch('/api/chat/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTokenFromStorage()}`
        },
        body: JSON.stringify({
          subscription: newSubscription
        })
      });
    })
  );
});

// Hilfsfunktion um Token aus LocalStorage zu holen
function getTokenFromStorage() {
  try {
    // Simuliere Token-Abruf - in echtem Code müsste das anders gelöst werden
    return localStorage.getItem('token') || '';
  } catch (error) {
    console.error('❌ [SW] Error getting token:', error);
    return '';
  }
}

console.log('✅ [SW] Service Worker initialized');
