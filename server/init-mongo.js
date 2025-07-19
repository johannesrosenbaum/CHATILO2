// MongoDB initialization script for CHATILO
db = db.getSiblingDB('chatilo');

// Create collections
db.createCollection('users');
db.createCollection('chatrooms');
db.createCollection('messages');
db.createCollection('events');
db.createCollection('schools');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "location": "2dsphere" });
db.users.createIndex({ "createdAt": -1 });

db.chatrooms.createIndex({ "location": "2dsphere" });
db.chatrooms.createIndex({ "type": 1 });
db.chatrooms.createIndex({ "isActive": 1 });
db.chatrooms.createIndex({ "createdAt": -1 });

db.messages.createIndex({ "chatRoomId": 1 });
db.messages.createIndex({ "userId": 1 });
db.messages.createIndex({ "createdAt": -1 });
db.messages.createIndex({ "type": 1 });

db.events.createIndex({ "location": "2dsphere" });
db.events.createIndex({ "startDate": 1 });
db.events.createIndex({ "endDate": 1 });
db.events.createIndex({ "isActive": 1 });

db.schools.createIndex({ "location": "2dsphere" });
db.schools.createIndex({ "type": 1 });
db.schools.createIndex({ "isActive": 1 });

db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "isRead": 1 });
db.notifications.createIndex({ "createdAt": -1 });

// Insert sample data for testing
db.users.insertOne({
  _id: ObjectId(),
  email: "admin@chatilo.de",
  username: "admin",
  firstName: "Admin",
  lastName: "User",
  profileImage: null,
  bio: "System Administrator",
  location: {
    type: "Point",
    coordinates: [13.4050, 52.5200] // Berlin coordinates
  },
  address: {
    city: "Berlin",
    country: "Germany"
  },
  preferences: {
    notifications: true,
    privacy: "public",
    theme: "dark"
  },
  createdAt: new Date(),
  lastSeen: new Date(),
  isOnline: true,
  isVerified: true
});

db.chatrooms.insertOne({
  _id: ObjectId(),
  name: "Berlin Zentrum",
  description: "Chatraum für das Berliner Zentrum",
  type: "local",
  category: "district",
  location: {
    type: "Point",
    coordinates: [13.4050, 52.5200]
  },
  radius: 5000,
  address: {
    city: "Berlin",
    country: "Germany"
  },
  createdAt: new Date(),
  isActive: true,
  memberCount: 1,
  settings: {
    allowImages: true,
    allowVideos: true,
    allowAudio: true,
    requireLocation: true,
    maxMessageLength: 1000
  },
  tags: ["Berlin", "Zentrum", "Lokal"]
});

print("✅ MongoDB initialized successfully for CHATILO!");
print("📊 Collections created: users, chatrooms, messages, events, schools, notifications");
print("🔍 Indexes created for optimal performance");
print("👤 Sample admin user created: admin@chatilo.de");
print("🏠 Sample chatroom created: Berlin Zentrum");
