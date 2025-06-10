const express = require('express');
const router = express.Router();
const { getStructuredLocationAnalysis } = require('../utils/geocoding');
const auth = require('../middleware/auth');

// FÜGE GANZ OBEN EIN EINZIGARTIGES LOG HINZU
console.log('🚨🚨🚨 ROUTE FILE LOADED AT:', new Date().toISOString());
console.log('🚨🚨🚨 THIS IS THE CORRECT UPDATED FILE VERSION 3.0');

// Nearby Chat Rooms Route
router.get('/rooms/nearby', auth, async (req, res) => {
  console.log('🚨🚨🚨 FORCE ROUTE HIT - VERSION 3.0 - TIMESTAMP:', new Date().toISOString());
  console.log('🔥 THIS SHOULD ALWAYS APPEAR IF ROUTE IS CALLED!');
  
  try {
    console.log('🚨 USING UPDATED ROUTE - VERSION 3.0 - TIMESTAMP:', new Date().toISOString());
    
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      });
    }

    console.log(`🏘️ Creating structured neighborhood rooms for: ${lat}, ${lng}`);

    // Verwende die strukturierte Standortanalyse
    const locationAnalysis = await getStructuredLocationAnalysis(lat, lng);
    
    // Erstelle strukturierte Chat-Rooms
    const rooms = [];
    
    // 1. REGIONAL CHAT (immer erstellen)
    const regionalName = locationAnalysis.location.name.includes('Region') 
      ? locationAnalysis.location.name 
      : `Region ${locationAnalysis.location.name.split(' ')[0]}`;
    
    rooms.push({
      _id: `room_regional_${regionalName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`,
      name: `🌍 ${regionalName}`,
      description: `Regionaler Chat für ${regionalName} und Umgebung`,
      type: 'location',
      subType: 'regional',
      participants: Math.floor(Math.random() * 25) + 5, // 5-30 Teilnehmer
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      distance: 0,
      isActive: true
    });

    // 2. NACHBARSCHAFTS-CHATS mit ECHTEN Daten - KORRIGIERE DISTANZ ENDGÜLTIG
    const neighborhoods = locationAnalysis.placesInRadius.slice(0, 4);
    
    neighborhoods.forEach((place, index) => {
      const roomId = `room_${place.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${index}`;
      
      // DEBUG: Was bekommt der Server wirklich?
      console.log(`🔢 DISTANCE DEBUG for ${place.name}:`);
      console.log(`   Raw place.distance: ${place.distance} meters`);
      
      // ECHTE Distanz-Berechnung
      const distanceKm = place.distance / 1000; // 1891m -> 1.891km
      const finalDistance = Math.round(distanceKm * 10) / 10; // -> 1.9km
      
      console.log(`🎯 FIXED: ${place.distance}m -> ${finalDistance}km`);
      
      console.log(`🚨 BEFORE PUSH: type='location', subType='neighborhood'`); // <- DEBUG
      
      rooms.push({
        _id: roomId,
        name: place.name,
        description: `Chat für ${place.name} und direkte Nachbarschaft`,
        type: 'location',        // FIXED!
        subType: 'neighborhood', // FIXED!
        participants: Math.floor(Math.random() * 15) + 2,
        location: {
          type: 'Point',
          coordinates: [place.lng, place.lat]
        },
        distance: finalDistance,
        isActive: true
      });
      
      console.log(`🚨 AFTER PUSH: ${JSON.stringify({type: 'location', subType: 'neighborhood'})}`); // <- DEBUG
    });

    console.log(`🏘️ Created ${rooms.length} structured neighborhood rooms`);
    console.log('🔢 Final room distances:', rooms.map(r => `${r.name}: ${r.distance}km`));
    
    res.json({
      success: true,
      rooms: rooms,
      location: locationAnalysis.location,
      totalPlacesFound: locationAnalysis.placesInRadius.length,
      searchRadius: locationAnalysis.radiusConfig.neighborhood
    });

  } catch (error) {
    console.error('❌ Error creating nearby rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ÜBERSCHREIBE ALLE ANDEREN ROUTEN - SETZE PRIORITÄT
router.all('/rooms/nearby', auth, async (req, res) => {
  console.log('🚨🚨🚨 FORCE OVERRIDE ROUTE HIT - VERSION 3.0 - METHOD:', req.method);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  console.log('🔥 THIS IS THE CORRECT ROUTE EXECUTING NOW!');
  
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      });
    }

    console.log(`🏘️ Creating structured neighborhood rooms for: ${lat}, ${lng}`);

    // Verwende die strukturierte Standortanalyse
    const locationAnalysis = await getStructuredLocationAnalysis(lat, lng);
    
    // Erstelle strukturierte Chat-Rooms
    const rooms = [];
    
    // 1. REGIONAL CHAT (immer erstellen)
    const regionalName = locationAnalysis.location.name.includes('Region') 
      ? locationAnalysis.location.name 
      : `Region ${locationAnalysis.location.name.split(' ')[0]}`;
    
    rooms.push({
      _id: `room_regional_${regionalName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`,
      name: `🌍 ${regionalName}`,
      description: `Regionaler Chat für ${regionalName} und Umgebung`,
      type: 'location',
      subType: 'regional',
      participants: Math.floor(Math.random() * 25) + 5, // 5-30 Teilnehmer
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      distance: 0,
      isActive: true
    });

    // 2. NACHBARSCHAFTS-CHATS mit ECHTEN Daten - KORRIGIERE DISTANZ ENDGÜLTIG
    const neighborhoods = locationAnalysis.placesInRadius.slice(0, 4);
    
    neighborhoods.forEach((place, index) => {
      const roomId = `room_${place.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}_${index}`;
      
      // DEBUG: Was bekommt der Server wirklich?
      console.log(`🔢 DISTANCE DEBUG for ${place.name}:`);
      console.log(`   Raw place.distance: ${place.distance} meters`);
      
      // ECHTE Distanz-Berechnung
      const distanceKm = place.distance / 1000; // 1891m -> 1.891km
      const finalDistance = Math.round(distanceKm * 10) / 10; // -> 1.9km
      
      console.log(`🎯 FIXED: ${place.distance}m -> ${finalDistance}km`);
      
      console.log(`🚨 BEFORE PUSH: type='location', subType='neighborhood'`); // <- DEBUG
      
      rooms.push({
        _id: roomId,
        name: place.name,
        description: `Chat für ${place.name} und direkte Nachbarschaft`,
        type: 'location',        // FIXED!
        subType: 'neighborhood', // FIXED!
        participants: Math.floor(Math.random() * 15) + 2,
        location: {
          type: 'Point',
          coordinates: [place.lng, place.lat]
        },
        distance: finalDistance,
        isActive: true
      });
      
      console.log(`🚨 AFTER PUSH: ${JSON.stringify({type: 'location', subType: 'neighborhood'})}`); // <- DEBUG
    });

    console.log(`🏘️ Created ${rooms.length} structured neighborhood rooms`);
    console.log('🔢 Final room distances:', rooms.map(r => `${r.name}: ${r.distance}km`));
    
    res.json({
      success: true,
      rooms: rooms,
      location: locationAnalysis.location,
      totalPlacesFound: locationAnalysis.placesInRadius.length,
      searchRadius: locationAnalysis.radiusConfig.neighborhood
    });

  } catch (error) {
    console.error('❌ Error creating nearby rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Zusätzliche Fallback-Routen
router.get('/nearby', auth, async (req, res) => {
  console.log('🚨 FALLBACK ROUTE /nearby called');
  return res.redirect(`/api/chat/rooms/nearby?${req.url.split('?')[1] || ''}`);
});

router.get('/rooms', auth, async (req, res) => {
  console.log('🚨 FALLBACK ROUTE /rooms called');
  return res.redirect(`/api/chat/rooms/nearby?${req.url.split('?')[1] || ''}`);
});

module.exports = router;
