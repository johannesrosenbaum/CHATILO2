const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStructuredLocationAnalysis } = require('../utils/geocoding');

// Get nearby rooms based on location
router.get('/rooms/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10000 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }
    
    console.log(`🔍 Finding nearby rooms for: ${latitude}, ${longitude} (radius: ${radius}m)`);
    
    // Use structured location analysis
    const analysis = await getStructuredLocationAnalysis(
      parseFloat(latitude), 
      parseFloat(longitude)
    );
    
    // Convert places to chat rooms
    const nearbyRooms = analysis.placesInRadius.map(place => ({
      _id: `neighborhood_${place.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${Math.floor(place.distance)}`,
      id: `neighborhood_${place.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${Math.floor(place.distance)}`,
      name: `${place.name} Chat`,
      type: 'location',
      subType: 'neighborhood',
      participants: Math.floor(Math.random() * 20) + 5, // Mock participants
      distance: Math.floor(place.distance / 1000), // Distance in km
      location: {
        type: 'Point',
        coordinates: [place.lng, place.lat],
        address: place.name,
        city: place.name,
        radius: place.radius || 1000
      },
      description: `Chat für ${place.name} und Umgebung`,
      isActive: true,
      lastActivity: new Date().toISOString()
    }));
    
    console.log(`📍 Found ${nearbyRooms.length} nearby rooms`);
    res.json(nearbyRooms);
    
  } catch (error) {
    console.error('❌ Error finding nearby rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all rooms (fallback)
router.get('/rooms', auth, async (req, res) => {
  try {
    console.log('📍 Getting all rooms...');
    
    // Return some default rooms
    const defaultRooms = [
      {
        _id: 'general_chat',
        id: 'general_chat',
        name: 'Allgemeiner Chat',
        type: 'global',
        subType: 'general',
        participants: 150,
        description: 'Für alle Themen',
        isActive: true,
        lastActivity: new Date().toISOString()
      },
      {
        _id: 'koblenz_general',
        id: 'koblenz_general',
        name: 'Koblenz Allgemein',
        type: 'location',
        subType: 'city',
        participants: 89,
        description: 'Koblenz Stadt Chat',
        isActive: true,
        lastActivity: new Date().toISOString()
      }
    ];
    
    res.json(defaultRooms);
    
  } catch (error) {
    console.error('❌ Error getting rooms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get messages for a specific room
router.get('/rooms/:roomId/messages', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`📬 Getting messages for room: ${roomId}`);
    
    // Return empty messages array for now
    res.json([]);
    
  } catch (error) {
    console.error('❌ Error getting room messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Image upload endpoint
router.post('/upload-image', auth, async (req, res) => {
  try {
    console.log('📷 Image upload request');
    
    // TODO: Implement image upload
    res.status(501).json({ message: 'Image upload not implemented yet' });
    
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
