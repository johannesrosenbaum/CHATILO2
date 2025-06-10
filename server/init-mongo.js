// MongoDB initialization script
db = db.getSiblingDB('chatilo');

// Create collections
db.createCollection('users');
db.createCollection('chatrooms');
db.createCollection('messages');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.chatrooms.createIndex({ "location": "2dsphere" });
db.messages.createIndex({ "chatRoom": 1, "createdAt": -1 });

// Insert default chat rooms for Koblenz region
db.chatrooms.insertMany([
  {
    name: "Koblenz Zentral",
    description: "Hauptchat für die Innenstadt von Koblenz",
    location: {
      type: "Point",
      coordinates: [7.5890, 50.3569]
    },
    isPublic: true,
    maxParticipants: 100,
    radius: 5000,
    createdAt: new Date()
  },
  {
    name: "Vallendar Community",
    description: "Chat für Vallendar und Umgebung",
    location: {
      type: "Point",
      coordinates: [7.6156, 50.3972]
    },
    isPublic: true,
    maxParticipants: 50,
    radius: 3000,
    createdAt: new Date()
  },
  {
    name: "Bendorf Nachbarschaft",
    description: "Lokaler Chat für Bendorf",
    location: {
      type: "Point",
      coordinates: [7.5703, 50.4297]
    },
    isPublic: true,
    maxParticipants: 50,
    radius: 3000,
    createdAt: new Date()
  },
  {
    name: "Neuwied Regional",
    description: "Regional Chat für Neuwied und Umgebung",
    location: {
      type: "Point",
      coordinates: [7.4606, 50.4283]
    },
    isPublic: true,
    maxParticipants: 75,
    radius: 4000,
    createdAt: new Date()
  }
]);

print('✅ MongoDB initialized with default chat rooms for Koblenz region');
