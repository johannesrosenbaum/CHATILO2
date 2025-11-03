const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

/**
 * GET /api/schools/nearby
 * Get nearby schools and universities within a specified radius
 * Query params: lat, lng, radius (in meters, default 20000)
 */
router.get('/nearby', auth, async (req, res) => {
  try {
    const { lat, lng, radius = 20000 } = req.query;

    console.log(`🏫 [GET] /api/schools/nearby - Request for lat: ${lat}, lng: ${lng}, radius: ${radius}m`);

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      });
    }

    console.log(`   Querying Overpass API for schools/universities...`);

    // Use different radius for schools vs universities
    const schoolRadius = 15000; // 15km for schools
    const universityRadius = 25000; // 25km for universities and colleges

    // Overpass API query for schools, universities, and colleges
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="school"](around:${schoolRadius},${latitude},${longitude});
        way["amenity"="school"](around:${schoolRadius},${latitude},${longitude});
        relation["amenity"="school"](around:${schoolRadius},${latitude},${longitude});
        node["amenity"="university"](around:${universityRadius},${latitude},${longitude});
        way["amenity"="university"](around:${universityRadius},${latitude},${longitude});
        relation["amenity"="university"](around:${universityRadius},${latitude},${longitude});
        node["amenity"="college"](around:${universityRadius},${latitude},${longitude});
        way["amenity"="college"](around:${universityRadius},${latitude},${longitude});
        relation["amenity"="college"](around:${universityRadius},${latitude},${longitude});
      );
      out center tags;
    `;

    // Query Overpass API
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const response = await axios.post(overpassUrl, overpassQuery, {
      headers: { 'Content-Type': 'text/plain' },
      timeout: 30000
    });

    const elements = response.data.elements || [];
    console.log(`   Found ${elements.length} raw elements from Overpass API`);

    // Process and deduplicate schools
    const schoolsMap = new Map();

    elements.forEach(element => {
      const schoolLat = element.lat || element.center?.lat;
      const schoolLng = element.lon || element.center?.lon;
      
      if (!schoolLat || !schoolLng) return;

      const name = element.tags?.name || element.tags?.['name:en'] || 'Unbenannte Einrichtung';
      const type = element.tags?.amenity || 'school';
      
      // Calculate distance
      const distance = calculateDistance(latitude, longitude, schoolLat, schoolLng);

      // Create unique key based on name and approximate location
      const key = `${name.toLowerCase()}_${Math.round(schoolLat * 100)}_${Math.round(schoolLng * 100)}`;

      // Only keep closest instance if duplicate
      if (!schoolsMap.has(key) || schoolsMap.get(key).distance > distance) {
        schoolsMap.set(key, {
          id: element.id,
          name,
          type,
          latitude: schoolLat,
          longitude: schoolLng,
          distance: Math.round(distance),
          address: {
            street: element.tags?.['addr:street'],
            housenumber: element.tags?.['addr:housenumber'],
            postcode: element.tags?.['addr:postcode'],
            city: element.tags?.['addr:city'],
            country: element.tags?.['addr:country'] || 'Deutschland'
          },
          tags: {
            operator: element.tags?.operator,
            website: element.tags?.website,
            phone: element.tags?.phone,
            email: element.tags?.email
          }
        });
      }
    });

    const schools = Array.from(schoolsMap.values())
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50); // Limit to 50 closest schools

    console.log(`✅ [GET] /api/schools/nearby - Returning ${schools.length} unique schools`);

    res.json({
      success: true,
      schools,
      count: schools.length,
      query: {
        latitude,
        longitude,
        radius: radiusMeters
      }
    });

  } catch (error) {
    console.error('❌ [GET] /api/schools/nearby - Error:', error.message);
    console.error('   Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby schools',
      details: error.message
    });
  }
});

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = router;
