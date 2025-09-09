// Push Notification Service für Frontend
import api from './api';

// VAPID Public Key (muss aus .env oder Config kommen)
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BNpQ9_example_public_key';

class PushNotificationService {
  public isSupported: boolean;
  public isSubscribed: boolean;
  public subscription: PushSubscription | null;
  public registration: ServiceWorkerRegistration | null;

  constructor() {
    this.isSupported = false;
    this.isSubscribed = false;
    this.subscription = null;
    this.registration = null;
    this.init();
  }

  /**
   * 🔧 Initialisiert Push Notification Support
   */
  async init() {
    try {
      // Prüfe Browser Support
      if (!('serviceWorker' in navigator)) {
        console.log('❌ [PUSH] Service Worker not supported');
        return;
      }

      if (!('PushManager' in window)) {
        console.log('❌ [PUSH] Push notifications not supported');
        return;
      }

      console.log('✅ [PUSH] Push notifications supported');
      this.isSupported = true;

      // Registriere Service Worker
      await this.registerServiceWorker();
      
      // Prüfe aktuelle Subscription
      await this.checkSubscription();

    } catch (error) {
      console.error('❌ [PUSH] Error initializing push service:', error);
    }
  }

  /**
   * 📝 Registriert Service Worker
   */
  async registerServiceWorker() {
    try {
      console.log('📝 [PUSH] Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ [PUSH] Service worker registered:', registration);
      this.registration = registration;

      // Höre auf Messages vom Service Worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));

      return registration;
    } catch (error) {
      console.error('❌ [PUSH] Service worker registration failed:', error);
      throw error;
    }
  }

  /**
   * 📨 Behandelt Messages vom Service Worker
   */
  handleServiceWorkerMessage(event) {
    console.log('📨 [PUSH] Message from service worker:', event.data);
    
    if (event.data.type === 'NAVIGATE_TO_ROOM') {
      // Navigiere zum angegebenen Raum
      const roomId = event.data.roomId;
      if (roomId && window.location) {
        window.location.href = `/chat/${roomId}`;
      }
    }
  }

  /**
   * 🔍 Prüft aktuelle Push Subscription
   */
  async checkSubscription() {
    try {
      if (!this.registration) {
        console.log('❌ [PUSH] No service worker registration');
        return;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('✅ [PUSH] Active subscription found');
        this.isSubscribed = true;
        this.subscription = subscription;
      } else {
        console.log('ℹ️ [PUSH] No active subscription');
        this.isSubscribed = false;
        this.subscription = null;
      }

      return subscription;
    } catch (error) {
      console.error('❌ [PUSH] Error checking subscription:', error);
      return null;
    }
  }

  /**
   * 🔔 Fordert Push-Berechtigung an und erstellt Subscription
   */
  async requestPermission() {
    try {
      console.log('🔔 [PUSH] Requesting permission...');

      if (!this.isSupported) {
        throw new Error('Push notifications not supported');
      }

      // Fordere Berechtigung an
      const permission = await Notification.requestPermission();
      console.log('📋 [PUSH] Permission result:', permission);

      if (permission !== 'granted') {
        throw new Error('Push notifications permission denied');
      }

      // Erstelle Subscription
      const subscription = await this.createSubscription();
      
      if (subscription) {
        // Sende Subscription an Server
        await this.sendSubscriptionToServer(subscription);
        console.log('✅ [PUSH] Push notifications enabled successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [PUSH] Error requesting permission:', error);
      throw error;
    }
  }

  /**
   * 📄 Erstellt Push Subscription
   */
  async createSubscription() {
    try {
      if (!this.registration) {
        throw new Error('No service worker registration');
      }

      console.log('📄 [PUSH] Creating subscription...');

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      console.log('✅ [PUSH] Subscription created:', subscription);
      
      this.isSubscribed = true;
      this.subscription = subscription;
      
      return subscription;
    } catch (error) {
      console.error('❌ [PUSH] Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * 📤 Sendet Subscription an Server
   */
  async sendSubscriptionToServer(subscription) {
    try {
      console.log('📤 [PUSH] Sending subscription to server...');

      const response = await api.post('/chat/push/subscribe', {
        subscription: subscription
      });

      if (response.data.success) {
        console.log('✅ [PUSH] Subscription sent to server successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to save subscription');
      }
    } catch (error) {
      console.error('❌ [PUSH] Error sending subscription to server:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Entfernt Push Subscription
   */
  async unsubscribe() {
    try {
      console.log('🗑️ [PUSH] Unsubscribing...');

      if (!this.subscription) {
        console.log('ℹ️ [PUSH] No active subscription to remove');
        return true;
      }

      // Entferne Subscription lokal
      const unsubscribed = await this.subscription.unsubscribe();
      
      if (unsubscribed) {
        // Informiere Server
        await api.post('/chat/push/unsubscribe', {
          endpoint: this.subscription.endpoint
        });

        this.isSubscribed = false;
        this.subscription = null;
        
        console.log('✅ [PUSH] Unsubscribed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [PUSH] Error unsubscribing:', error);
      throw error;
    }
  }

  /**
   * ⭐ Fügt Raum zu Favoriten hinzu
   */
  async addToFavorites(roomId) {
    try {
      console.log(`⭐ [PUSH] Adding room ${roomId} to favorites...`);

      const response = await api.post(`/chat/rooms/${roomId}/favorite`);
      
      if (response.data.success) {
        console.log('✅ [PUSH] Room added to favorites');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to add to favorites');
      }
    } catch (error) {
      console.error('❌ [PUSH] Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * ❌ Entfernt Raum aus Favoriten
   */
  async removeFromFavorites(roomId) {
    try {
      console.log(`❌ [PUSH] Removing room ${roomId} from favorites...`);

      const response = await api.delete(`/chat/rooms/${roomId}/favorite`);
      
      if (response.data.success) {
        console.log('✅ [PUSH] Room removed from favorites');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('❌ [PUSH] Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * 📋 Holt User Favoriten
   */
  async getFavorites() {
    try {
      const response = await api.get('/chat/favorites');
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('❌ [PUSH] Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * 🧪 Sendet Test-Benachrichtigung
   */
  async sendTestNotification(roomId) {
    try {
      console.log('🧪 [PUSH] Sending test notification...');

      const response = await api.post('/chat/push/test', { roomId });
      
      if (response.data.success) {
        console.log('✅ [PUSH] Test notification sent');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('❌ [PUSH] Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * 🔧 Hilfsfunktion: Konvertiert VAPID Key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * 📊 Status abrufen
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      isSubscribed: this.isSubscribed,
      permission: Notification.permission,
      hasSubscription: !!this.subscription
    };
  }
}

// Singleton Export
const pushService = new PushNotificationService();
export default pushService;
