// Create regional room with extended properties
const createRegionalRoom = async (regionName) => {
  const roomData = {
    name: `${regionName}`,
    description: `Allgemeiner Chat für die Region ${regionName}`,
    type: 'location',
    subType: 'regional', // ADD THIS
    isGlobal: false,
    isActive: true,
    maxParticipants: 200,
    participants: 0,
    distance: null, // Will be calculated per user
    location: {
      type: 'Point',
      coordinates: [0, 0], // Will be set based on region
      name: regionName
    }
  };

  const room = new ChatRoom(roomData);
  await room.save();
  console.log(`✅ Created new regional room: ${roomData.name}`);
  return room;
};

// Create neighborhood room with extended properties
const createNeighborhoodRoom = async (placeName, lat, lng, type = 'village') => {
  const subType = type === 'city' ? 'city' : 'neighborhood';
  
  const roomData = {
    name: `${placeName} Chat`,
    description: `Lokaler Chat für ${placeName}`,
    type: 'location',
    subType: subType, // ADD THIS
    isGlobal: false,
    isActive: true,
    maxParticipants: type === 'city' ? 100 : 50,
    participants: 0,
    distance: null, // Will be calculated per user
    location: {
      type: 'Point',
      coordinates: [lng, lat],
      name: placeName
    }
  };

  const room = new ChatRoom(roomData);
  await room.save();
  console.log(`✅ Created neighborhood room: ${roomData.name}`);
  return room;
};

// Create city room with extended properties
const createCityRoom = async (cityName, lat, lng) => {
  const roomData = {
    name: `${cityName} Stadt`,
    description: `Stadtweiter Chat für ${cityName}`,
    type: 'location',
    subType: 'city', // ADD THIS
    isGlobal: false,
    isActive: true,
    maxParticipants: 150,
    participants: 0,
    distance: null, // Will be calculated per user
    location: {
      type: 'Point',
      coordinates: [lng, lat],
      name: cityName
    }
  };

  const room = new ChatRoom(roomData);
  await room.save();
  console.log(`✅ Created city room: ${roomData.name}`);
  return room;
};

// ...existing code...