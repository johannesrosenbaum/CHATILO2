const webpush = require('web-push');

// Generiere VAPID Keys für Push-Notifications
const vapidKeys = webpush.generateVAPIDKeys();

console.log('📧 VAPID Keys für Web Push Notifications:');
console.log('=====================================');
console.log('');
console.log('🔑 Public Key:');
console.log(vapidKeys.publicKey);
console.log('');
console.log('🔐 Private Key:');
console.log(vapidKeys.privateKey);
console.log('');
console.log('📝 Füge diese Keys zu deiner .env Datei hinzu:');
console.log('===============================================');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('');
console.log('ℹ️  Der Public Key wird auch im Frontend benötigt für Service Worker Registration');
