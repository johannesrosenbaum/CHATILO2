const webpush = require('web-push');
const User = require('../models/User');
const PushNotification = require('../models/PushNotification');

// Web Push Setup (VAPID Keys müssen in .env gesetzt werden)
webpush.setVapidDetails(
  'mailto:admin@chatilo.de',
  process.env.VAPID_PUBLIC_KEY || 'BNpQ9_example_public_key',
  process.env.VAPID_PRIVATE_KEY || 'example_private_key'
);

class PushService {
  
  /**
   * 🔔 Prüft ob User Push-Benachrichtigung erhalten soll
   */
  async shouldSendNotification(userId, roomId) {
    try {
      console.log(`🔔 [PUSH] Checking notification eligibility for user ${userId} in room ${roomId}`);
      
      // 1. Prüfe ob User Push-Subscriptions hat
      const user = await User.findById(userId);
      if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
        console.log(`❌ [PUSH] User has no push subscriptions`);
        return false;
      }

      // 2. Prüfe ob Raum in Favoriten ist
      if (!user.favoriteRooms || !user.favoriteRooms.includes(roomId)) {
        console.log(`❌ [PUSH] Room ${roomId} not in user favorites`);
        return false;
      }

      // 3. Hole oder erstelle Push-Notification Record
      let pushRecord = await PushNotification.findOne({ userId, roomId });
      if (!pushRecord) {
        pushRecord = new PushNotification({ 
          userId, 
          roomId,
          canSendNotification: true 
        });
        await pushRecord.save();
        console.log(`🆕 [PUSH] Created new push record for user ${userId} in room ${roomId}`);
      }

      // 4. Prüfe ob überhaupt senden erlaubt ist
      if (!pushRecord.canSendNotification) {
        console.log(`❌ [PUSH] Notification disabled (user visited room since last notification)`);
        return false;
      }

      const now = new Date();
      
      // 5. Prüfe 24h Cooldown
      if (pushRecord.lastNotificationSent) {
        const timeSinceLastNotification = now - pushRecord.lastNotificationSent;
        const hours24 = 24 * 60 * 60 * 1000; // 24 Stunden in ms
        
        if (timeSinceLastNotification < hours24) {
          console.log(`❌ [PUSH] 24h cooldown active. Last sent: ${pushRecord.lastNotificationSent}`);
          return false;
        } else {
          console.log(`✅ [PUSH] 24h cooldown expired, can send again`);
          // Reset canSendNotification nach 24h
          pushRecord.canSendNotification = true;
          await pushRecord.save();
        }
      }

      console.log(`✅ [PUSH] Notification eligible for user ${userId} in room ${roomId}`);
      return true;

    } catch (error) {
      console.error('❌ [PUSH] Error checking notification eligibility:', error);
      return false;
    }
  }

  /**
   * 🔔 Sendet Push-Benachrichtigung an User
   */
  async sendNotification(userId, roomId, roomName) {
    try {
      console.log(`🔔 [PUSH] Sending notification to user ${userId} for room ${roomId}`);
      
      // 1. Prüfe Berechtigung
      const shouldSend = await this.shouldSendNotification(userId, roomId);
      if (!shouldSend) {
        return { success: false, reason: 'Not eligible for notification' };
      }

      // 2. Hole User mit Push-Subscriptions
      const user = await User.findById(userId);
      if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) {
        return { success: false, reason: 'No push subscriptions' };
      }

      // 3. Erstelle Notification Payload
      const payload = JSON.stringify({
        title: "Neue Nachrichten",
        body: "Siehe nach, was es neues in deinem Local gibt",
        icon: "/icons/chatilo-icon-192.png",
        badge: "/icons/chatilo-badge-72.png",
        tag: `room-${roomId}`,
        data: {
          roomId: roomId,
          roomName: roomName,
          url: `/chat/${roomId}`,
          timestamp: new Date().toISOString(),
          type: 'new_message'
        },
        actions: [
          {
            action: 'open',
            title: 'Chat öffnen',
            icon: '/icons/open-icon.png'
          },
          {
            action: 'close',
            title: 'Schließen',
            icon: '/icons/close-icon.png'
          }
        ],
        requireInteraction: true,
        silent: false
      });

      // 4. Sende an alle Subscriptions des Users
      const notifications = [];
      let successCount = 0;
      
      for (const subscription of user.pushSubscriptions) {
        try {
          const options = {
            TTL: 24 * 60 * 60, // 24 Stunden TTL
            urgency: 'normal',
            headers: {
              'Topic': 'chatilo-messages'
            }
          };
          
          const result = await webpush.sendNotification(subscription, payload, options);
          notifications.push({ success: true, result, endpoint: subscription.endpoint });
          successCount++;
          console.log(`✅ [PUSH] Notification sent successfully to endpoint`);
        } catch (error) {
          console.error(`❌ [PUSH] Failed to send to subscription:`, error.message);
          notifications.push({ success: false, error: error.message, endpoint: subscription.endpoint });
          
          // Entferne ungültige Subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`🗑️ [PUSH] Removing invalid subscription`);
            user.pushSubscriptions = user.pushSubscriptions.filter(
              sub => sub.endpoint !== subscription.endpoint
            );
          }
        }
      }

      // 5. Speichere updated User (falls Subscriptions entfernt wurden)
      if (user.isModified()) {
        await user.save();
      }

      // 6. Update Push-Record nur wenn mindestens eine Notification erfolgreich war
      if (successCount > 0) {
        await PushNotification.findOneAndUpdate(
          { userId, roomId },
          { 
            lastNotificationSent: new Date(),
            canSendNotification: false, // Disable bis User Room besucht
            $inc: { notificationsSent: 1 }
          },
          { upsert: true }
        );
        console.log(`🔔 [PUSH] Push record updated - notifications disabled until room visit`);
      }

      console.log(`🔔 [PUSH] Notification process completed: ${successCount}/${user.pushSubscriptions.length} successful`);
      return { 
        success: successCount > 0, 
        notifications,
        successCount,
        totalAttempts: user.pushSubscriptions.length
      };

    } catch (error) {
      console.error('❌ [PUSH] Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Resettet Push-Trigger wenn User Raum betritt
   */
  async resetRoomNotification(userId, roomId) {
    try {
      console.log(`🔄 [PUSH] Resetting notification trigger for user ${userId} in room ${roomId}`);
      
      const result = await PushNotification.findOneAndUpdate(
        { userId, roomId },
        { 
          lastRoomVisit: new Date(),
          canSendNotification: true, // Erlaube wieder Notifications
          isActive: true
        },
        { upsert: true, new: true }
      );

      console.log(`✅ [PUSH] Notification trigger reset - can send notifications again`);
      return { success: true, pushRecord: result };

    } catch (error) {
      console.error('❌ [PUSH] Error resetting notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📱 User Push-Subscription hinzufügen
   */
  async addSubscription(userId, subscription) {
    try {
      console.log(`🔔 [PUSH] Adding subscription for user ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Initialize array if not exists
      if (!user.pushSubscriptions) {
        user.pushSubscriptions = [];
      }

      // Prüfe ob Subscription bereits existiert
      const exists = user.pushSubscriptions.some(
        sub => sub.endpoint === subscription.endpoint
      );

      if (!exists) {
        // Füge Timestamp hinzu
        subscription.createdAt = new Date();
        user.pushSubscriptions.push(subscription);
        await user.save();
        console.log(`✅ [PUSH] Subscription added successfully`);
      } else {
        console.log(`ℹ️ [PUSH] Subscription already exists`);
      }

      return { success: true, subscriptionCount: user.pushSubscriptions.length };

    } catch (error) {
      console.error('❌ [PUSH] Error adding subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🗑️ User Push-Subscription entfernen
   */
  async removeSubscription(userId, endpoint) {
    try {
      console.log(`🗑️ [PUSH] Removing subscription for user ${userId}`);
      
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.pushSubscriptions) {
        const beforeCount = user.pushSubscriptions.length;
        user.pushSubscriptions = user.pushSubscriptions.filter(
          sub => sub.endpoint !== endpoint
        );
        
        if (user.pushSubscriptions.length < beforeCount) {
          await user.save();
          console.log(`✅ [PUSH] Subscription removed successfully`);
          return { success: true, removed: true };
        }
      }

      console.log(`ℹ️ [PUSH] Subscription not found`);
      return { success: true, removed: false };

    } catch (error) {
      console.error('❌ [PUSH] Error removing subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧹 Cleanup alte Push-Records (täglich via Cron)
   */
  async cleanupOldRecords() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const result = await PushNotification.deleteMany({
        lastNotificationSent: { $lt: thirtyDaysAgo },
        isActive: false
      });

      console.log(`🧹 [PUSH] Cleaned up ${result.deletedCount} old push records`);
      return { success: true, deletedCount: result.deletedCount };

    } catch (error) {
      console.error('❌ [PUSH] Error cleaning up old records:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PushService();
