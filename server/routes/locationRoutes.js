const express = require('express');
const router = express.Router();
const { getPreciseLocation } = require('../utils/geocoding');

// GET /api/location/name - Hole Standort-Namen für Koordinaten
router.get('/name', async (req, res) => {
  try {
    const { lat, lng, accuracy } = req.query;
    
    console.log(`📍 Location name request: ${lat}, ${lng}`);
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const gpsAccuracy = accuracy ? parseFloat(accuracy) : null;
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude or longitude'
      });
    }
    
    // Hole präzise Standort-Information
    const locationData = await getPreciseLocation(latitude, longitude, gpsAccuracy);
    
    console.log(`📍 Location name response: ${locationData.name}`);
    
    res.json({
      success: true,
      name: locationData.name,
      fullAddress: locationData.fullAddress,
      coordinates: locationData.coordinates,
      coordinatesDMS: locationData.coordinatesDMS,
      type: locationData.type,
      confidence: locationData.confidence,
      accuracy: locationData.accuracy,
      source: locationData.source
    });
    
  } catch (error) {
    console.error('❌ Location name error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/location/reverse - Reverse Geocoding (erweitert)
router.post('/reverse', async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    
    console.log(`🔍 Reverse geocoding request: ${latitude}, ${longitude}`);
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }
    
    const locationData = await getPreciseLocation(latitude, longitude, accuracy);
    
    res.json({
      success: true,
      location: locationData
    });
    
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
