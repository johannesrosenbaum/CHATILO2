const express = require('express');
const router = express.Router();
const { getPreciseLocation } = require('../utils/geocoding');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/location/name - MIT ERWEITERTEN DEBUGGING
router.get('/name', async (req, res) => {
  try {
    console.log('🔧 DEBUG: Location name request received');
    console.log('   Query params:', req.query);
    console.log('   Headers:', req.headers);
    
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      console.error('❌ DETAILED: Missing coordinates');
      console.error('   Received lat:', lat);
      console.error('   Received lng:', lng);
      console.error('   Query object:', req.query);
      return res.status(400).json({ 
        message: 'Latitude and longitude required',
        received: { lat, lng },
        debug: 'Missing required coordinates'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    console.log(`📍 DETAILED Location processing:`);
    console.log(`   Raw lat: "${lat}" -> Parsed: ${latitude}`);
    console.log(`   Raw lng: "${lng}" -> Parsed: ${longitude}`);
    console.log(`   Is valid numbers: lat=${!isNaN(latitude)}, lng=${!isNaN(longitude)}`);

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error('❌ DETAILED: Invalid coordinate format');
      return res.status(400).json({ 
        message: 'Invalid coordinate format',
        received: { lat, lng },
        parsed: { latitude, longitude },
        debug: 'Coordinates must be valid numbers'
      });
    }

    console.log(`🚀 Calling getPreciseLocation with: ${latitude}, ${longitude}`);
    const startTime = Date.now();
    
    const locationData = await getPreciseLocation(latitude, longitude);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ getPreciseLocation completed in ${processingTime}ms`);
    console.log(`📍 Location result:`, JSON.stringify(locationData, null, 2));

    const response = {
      success: true,
      name: locationData.name,
      fullAddress: locationData.fullAddress,
      type: locationData.type,
      confidence: locationData.confidence,
      debug: {
        processingTime: `${processingTime}ms`,
        coordinates: { latitude, longitude },
        source: locationData.source,
        accuracy: locationData.accuracy
      }
    };

    console.log(`📤 Sending response:`, JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('❌ DETAILED Location name error:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Error object:', error);
    
    res.status(500).json({ 
      message: 'Error fetching location name',
      error: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        stack: error.stack
      }
    });
  }
});

// PUT /api/location - Speichert den Standort des Nutzers
router.put('/', auth, async (req, res) => {
  try {
    console.log('🌍 [DEBUG] PUT /api/location aufgerufen');
    console.log('   Body:', req.body);
    console.log('   Authentifizierter User:', req.user?._id, req.user?.username);
    const { latitude, longitude, address } = req.body;
    if (!latitude || !longitude) {
      console.log('❌ [DEBUG] Fehlende Koordinaten:', latitude, longitude);
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ [DEBUG] User nicht gefunden:', req.user?._id);
      return res.status(404).json({ message: 'User not found' });
    }
    user.lastLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
      address: address || null,
      updatedAt: new Date()
    };
    await user.save();
    console.log('✅ [DEBUG] Standort erfolgreich gespeichert für User:', user.username);
    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('❌ [DEBUG] Fehler beim Speichern des Standorts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
