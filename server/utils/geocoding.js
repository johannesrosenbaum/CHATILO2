// Ultra-schneller In-Memory Cache - KORRIGIERT FÜR MULTI-USER
const locationCache = new Map();
const userLocationCache = new Map(); // NEUER USER-SPEZIFISCHER CACHE
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 Stunden

// ERWEITERTE und PRÄZISE deutsche Städte/Orte in der Koblenz-Region
const KOBLENZ_REGION = {
  // Koblenz Stadtteile
  'Koblenz-Altstadt': { lat: 50.3569, lng: 7.5890, type: 'district', radius: 1000 },
  'Koblenz-Süd': { lat: 50.3450, lng: 7.5950, type: 'district', radius: 1500 },
  'Koblenz-Nord': { lat: 50.3700, lng: 7.5850, type: 'district', radius: 1500 },
  'Koblenz-Neuendorf': { lat: 50.3847, lng: 7.5783, type: 'district', radius: 1000 },
  'Koblenz-Pfaffendorf': { lat: 50.3625, lng: 7.6089, type: 'district', radius: 800 },
  'Koblenz-Ehrenbreitstein': { lat: 50.3647, lng: 7.6156, type: 'district', radius: 1200 },
  
  // Direkte Nachbargemeinden
  'Vallendar': { lat: 50.3972, lng: 7.6156, type: 'city', radius: 2000 },
  'Bendorf': { lat: 50.4297, lng: 7.5703, type: 'city', radius: 2000 },
  'Mülheim-Kärlich': { lat: 50.4333, lng: 7.5167, type: 'city', radius: 2000 },
  'Lahnstein': { lat: 50.3133, lng: 7.6136, type: 'city', radius: 2000 },
  'Weißenthurm': { lat: 50.4500, lng: 7.4167, type: 'city', radius: 1500 },
  'Urmitz': { lat: 50.4167, lng: 7.4833, type: 'city', radius: 1500 },
  'Bassenheim': { lat: 50.4000, lng: 7.4333, type: 'city', radius: 1500 },
  'Kettig': { lat: 50.4000, lng: 7.4667, type: 'village', radius: 1000 },
  
  // PRÄZISE 5km Radius Orte (erweitert und sorgfältig)
  'Andernach': { lat: 50.4333, lng: 7.4000, type: 'city', radius: 3000 },
  'Neuwied': { lat: 50.4283, lng: 7.4606, type: 'city', radius: 3000 },
  'Rhens': { lat: 50.2833, lng: 7.6167, type: 'city', radius: 1500 },
  'Brohl-Lützing': { lat: 50.4833, lng: 7.3167, type: 'village', radius: 800 },
  'Bad Breisig': { lat: 50.5167, lng: 7.3000, type: 'city', radius: 1200 },
  
  // SORGFÄLTIG hinzugefügte Orte in 5km Radius
  'Plaidt': { lat: 50.4000, lng: 7.3833, type: 'village', radius: 600 },
  'Saffig': { lat: 50.4167, lng: 7.3667, type: 'village', radius: 500 },
  'Kretz': { lat: 50.4333, lng: 7.3667, type: 'village', radius: 400 },
  'Nickenich': { lat: 50.4167, lng: 7.3833, type: 'village', radius: 500 },
  'Wassenach': { lat: 50.4500, lng: 7.3500, type: 'village', radius: 400 },
  'Lonnig': { lat: 50.4000, lng: 7.4000, type: 'village', radius: 400 },
  'Miesenheim': { lat: 50.4333, lng: 7.3333, type: 'village', radius: 500 },
  'Thür': { lat: 50.4167, lng: 7.2833, type: 'village', radius: 400 },
  'Ochtendung': { lat: 50.3833, lng: 7.3167, type: 'village', radius: 600 },
  
  // Zusätzliche präzise Orte in der 5km Zone
  'Glees': { lat: 50.4167, lng: 7.2667, type: 'village', radius: 300 },
  'Wehr': { lat: 50.4000, lng: 7.2833, type: 'village', radius: 300 },
  'Bell': { lat: 50.4333, lng: 7.2833, type: 'village', radius: 400 },
  'Mendig': { lat: 50.3667, lng: 7.2833, type: 'city', radius: 800 },
  'Rieden': { lat: 50.4000, lng: 7.2667, type: 'village', radius: 300 },
  'Kruft': { lat: 50.4167, lng: 7.2500, type: 'village', radius: 400 },
  'Weibern': { lat: 50.4000, lng: 7.2500, type: 'village', radius: 300 },
  
  // Rhein-Ahr-Region (erweitert)
  'Sinzig': { lat: 50.5500, lng: 7.2500, type: 'city', radius: 1000 },
  'Remagen': { lat: 50.5833, lng: 7.2333, type: 'city', radius: 800 },
  'Bad Neuenahr-Ahrweiler': { lat: 50.5500, lng: 7.1167, type: 'city', radius: 1500 },
  'Grafschaft': { lat: 50.5167, lng: 7.0833, type: 'village', radius: 600 },
  
  // Weitere kleine Orte in der Präzisions-Zone
  'Burgbrohl': { lat: 50.4833, lng: 7.2667, type: 'village', radius: 400 },
  'Niederzissen': { lat: 50.4667, lng: 7.2333, type: 'village', radius: 400 },
  'Oberzissen': { lat: 50.4667, lng: 7.2167, type: 'village', radius: 300 },
  'Dedenbach': { lat: 50.4500, lng: 7.2833, type: 'village', radius: 200 },
  'Kempenich': { lat: 50.4333, lng: 7.2000, type: 'village', radius: 400 },
  
  // Große Städte als Fallback
  'Koblenz': { lat: 50.3569, lng: 7.5890, type: 'city', radius: 8000 },
  'Köln': { lat: 50.9375, lng: 6.9603, type: 'city', radius: 15000 },
  'Bonn': { lat: 50.7374, lng: 7.0982, type: 'city', radius: 10000 },
  'Mainz': { lat: 49.9929, lng: 8.2473, type: 'city', radius: 10000 }
};

// Distanz berechnen (Haversine Formula) - ULTRA SCHNELL
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// KORRIGIERTE Cache-Management mit User-Support
function getCachedLocation(cacheKey, userId = null) {
  // 1. User-spezifischen Cache prüfen
  if (userId) {
    const userCacheKey = `user_${userId}_${cacheKey}`;
    const userCached = userLocationCache.get(userCacheKey);
    if (userCached && (Date.now() - userCached.timestamp) < CACHE_EXPIRY) {
      console.log(`🎯 USER CACHE HIT for ${userId}: ${userCached.data.name}`);
      return userCached.data;
    }
    userLocationCache.delete(userCacheKey);
  }
  
  // 2. Globalen Cache prüfen
  const cached = locationCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
    console.log(`💾 GLOBAL CACHE HIT: ${cached.data.name}`);
    return cached.data;
  }
  locationCache.delete(cacheKey);
  return null;
}

function setCachedLocation(cacheKey, data, userId = null) {
  // 1. User-spezifischen Cache setzen
  if (userId) {
    const userCacheKey = `user_${userId}_${cacheKey}`;
    userLocationCache.set(userCacheKey, {
      data,
      timestamp: Date.now(),
      userId
    });
    console.log(`🎯 USER CACHE SET for ${userId}: ${data.name}`);
  }
  
  // 2. Globalen Cache setzen
  locationCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 GLOBAL CACHE SET: ${data.name}`);
}

// NEUE FUNKTION: User-Cache leeren
function clearUserCache(userId) {
  let cleared = 0;
  for (const [key, value] of userLocationCache.entries()) {
    if (key.startsWith(`user_${userId}_`)) {
      userLocationCache.delete(key);
      cleared++;
    }
  }
  console.log(`🧹 CLEARED ${cleared} cache entries for user ${userId}`);
  return cleared;
}

// NEUE FUNKTION: Kompletten Cache leeren
function clearAllCaches() {
  const locationCount = locationCache.size;
  const userCount = userLocationCache.size;
  
  locationCache.clear();
  userLocationCache.clear();
  
  console.log(`🧹 CLEARED ALL CACHES: ${locationCount} location + ${userCount} user entries`);
  return { locationCount, userCount };
}

// BLITZSCHNELLE präzise Standortbestimmung
async function getPreciseLocation(latitude, longitude, accuracy = null, userId = null) {
  const startTime = Date.now();
  console.log(`🔧 DEBUG: getPreciseLocation called`);
  console.log(`   Input: lat=${latitude}, lng=${longitude}, accuracy=${accuracy}, userId=${userId}`);
  console.log(`   Input types: lat=${typeof latitude}, lng=${typeof longitude}`);
  
  const cacheKey = `${latitude.toFixed(5)}_${longitude.toFixed(5)}`;
  console.log(`   Cache key: ${cacheKey}`);
  console.log(`   User cache key: ${userId ? `user_${userId}_${cacheKey}` : 'none'}`);
  
  // 1. Cache Check mit User-Support
  const cached = getCachedLocation(cacheKey, userId);
  if (cached) {
    const cacheTime = Date.now() - startTime;
    console.log(`⚡ CACHE HIT in ${cacheTime}ms: ${cached.name} (confidence: ${cached.confidence})`);
    console.log(`   Cached data:`, JSON.stringify(cached, null, 2));
    return cached;
  } else {
    console.log(`🔧 DEBUG: No cache hit for key: ${cacheKey} (user: ${userId || 'none'})`);
    console.log(`   Location cache size: ${locationCache.size} entries`);
    console.log(`   User cache size: ${userLocationCache.size} entries`);
  }

  console.log(`🔍 FRESH ANALYSIS: ${latitude}, ${longitude} ${accuracy ? `(accuracy: ${accuracy}m)` : ''}`);

  try {
    // 2. DEBUGGING Genauigkeits-Bewertung
    console.log(`🔧 DEBUG: Evaluating GPS accuracy...`);
    let confidenceModifier = 'high';
    let radiusMultiplier = 1.0;
    
    if (accuracy && accuracy > 5000) {
      confidenceModifier = 'very_low';
      radiusMultiplier = 0.1;
      console.log(`❌ Very poor GPS accuracy (${accuracy}m) - minimal detection (multiplier: ${radiusMultiplier})`);
    } else if (accuracy && accuracy > 1000) {
      confidenceModifier = 'low';
      radiusMultiplier = 0.3;
      console.log(`⚠️ Poor GPS accuracy (${accuracy}m) - conservative detection (multiplier: ${radiusMultiplier})`);
    } else if (accuracy && accuracy > 200) {
      confidenceModifier = 'medium';
      radiusMultiplier = 0.7;
      console.log(`📍 Moderate GPS accuracy (${accuracy}m) - balanced detection (multiplier: ${radiusMultiplier})`);
    } else {
      confidenceModifier = 'high';
      radiusMultiplier = 1.0;
      console.log(`✅ Good GPS accuracy (${accuracy || 'unknown'}m) - full precision detection (multiplier: ${radiusMultiplier})`);
    }

    // 3. DEBUGGING Database Search
    console.log(`🔧 DEBUG: Searching ${Object.keys(KOBLENZ_REGION).length} known locations...`);
    let exactMatch = null;
    let closestPlace = null;
    let closestDistance = Infinity;
    let searchLog = [];

    for (const [name, place] of Object.entries(KOBLENZ_REGION)) {
      const distance = calculateDistance(latitude, longitude, place.lat, place.lng);
      const effectiveRadius = place.radius * radiusMultiplier;
      
      const logEntry = {
        name,
        distance: Math.round(distance),
        effectiveRadius: Math.round(effectiveRadius),
        withinRadius: distance <= effectiveRadius
      };
      searchLog.push(logEntry);
      
      if (distance <= effectiveRadius && !exactMatch) {
        exactMatch = { name, ...place, distance };
        console.log(`🎯 EXACT MATCH FOUND: ${name} (${Math.round(distance)}m <= ${Math.round(effectiveRadius)}m radius)`);
      }
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlace = { name, ...place, distance };
      }
    }

    // DEBUGGING: Top 5 closest places
    console.log(`🔧 DEBUG: Top 5 closest places:`);
    searchLog.sort((a, b) => a.distance - b.distance).slice(0, 5).forEach((entry, i) => {
      console.log(`   ${i+1}. ${entry.name}: ${entry.distance}m (radius: ${entry.effectiveRadius}m, match: ${entry.withinRadius})`);
    });

    let result;
    const processingTime = Date.now() - startTime;

    if (exactMatch) {
      console.log(`🎯 EXACT MATCH SELECTED: ${exactMatch.name} (${Math.round(exactMatch.distance)}m, confidence: ${confidenceModifier})`);
      
      const dmsLat = decimalToDMS(latitude, 'lat');
      const dmsLng = decimalToDMS(longitude, 'lng');
      const coordsDMS = `${dmsLat} ${dmsLng}`;
      
      result = {
        name: exactMatch.name,
        fullAddress: `${exactMatch.name}, Deutschland (${coordsDMS})`,
        coordinates: `${latitude.toFixed(6)}°N ${longitude.toFixed(6)}°E`,
        coordinatesDMS: coordsDMS,
        type: exactMatch.type,
        distance: exactMatch.distance,
        confidence: confidenceModifier,
        accuracy: accuracy || null,
        source: 'exact',
        debug: {
          processingTime: `${processingTime}ms`,
          radiusMultiplier,
          effectiveRadius: exactMatch.radius * radiusMultiplier,
          searchedLocations: Object.keys(KOBLENZ_REGION).length
        }
      };
    } else if (closestPlace) {
      console.log(`📍 CLOSEST SELECTED: ${closestPlace.name} (${Math.round(closestDistance)}m away, confidence: ${confidenceModifier})`);
      
      const dmsLat = decimalToDMS(latitude, 'lat');
      const dmsLng = decimalToDMS(longitude, 'lng');
      const coordsDMS = `${dmsLat} ${dmsLng}`;
      
      const nearThreshold = accuracy && accuracy > 500 ? 1500 : 
                           accuracy && accuracy > 200 ? 1000 : 500;
      const regionThreshold = accuracy && accuracy > 500 ? 8000 : 5000;
      
      console.log(`🔧 DEBUG: Distance thresholds - near: ${nearThreshold}m, region: ${regionThreshold}m`);
      
      let displayName, fullAddress;
      
      if (closestDistance < nearThreshold) {
        if (closestDistance < nearThreshold / 2) {
          displayName = `Nähe ${closestPlace.name}`;
        } else {
          displayName = `Zwischen ${closestPlace.name} und Umgebung`;
        }
        fullAddress = `${displayName}, Deutschland (${coordsDMS})`;
      } else if (closestDistance < regionThreshold) {
        displayName = `Region ${closestPlace.name}`;
        fullAddress = `Region ${closestPlace.name}, Deutschland (${coordsDMS})`;
      } else {
        displayName = `Koblenz Region`;
        fullAddress = `Koblenz Region, Deutschland (${coordsDMS})`;
      }

      result = {
        name: displayName,
        fullAddress: fullAddress,
        coordinates: `${latitude.toFixed(6)}°N ${longitude.toFixed(6)}°E`,
        coordinatesDMS: coordsDMS,
        type: closestPlace.type,
        distance: closestDistance,
        confidence: confidenceModifier,
        accuracy: accuracy || null,
        source: 'nearest',
        debug: {
          processingTime: `${processingTime}ms`,
          closestPlace: closestPlace.name,
          distanceToClosest: Math.round(closestDistance),
          nearThreshold,
          regionThreshold,
          searchedLocations: Object.keys(KOBLENZ_REGION).length
        }
      };
    } else {
      console.log(`❌ NO SUITABLE LOCATION FOUND`);
      result = {
        name: 'Standort wird ermittelt...',
        fullAddress: 'Genauer Standort wird ermittelt...',
        type: 'unknown',
        distance: 0,
        confidence: 'none',
        accuracy: accuracy || null,
        source: 'loading',
        debug: {
          processingTime: `${processingTime}ms`,
          reason: 'No suitable location found',
          searchedLocations: Object.keys(KOBLENZ_REGION).length
        }
      };
    }

    // DEBUGGING: Cache decision mit User-Support
    if (!accuracy || accuracy <= 1000) {
      setCachedLocation(cacheKey, result, userId);
      console.log(`💾 Result cached with key: ${cacheKey} (user: ${userId || 'global'})`);
    } else {
      console.log(`⚠️ Result NOT cached due to poor accuracy: ${accuracy}m`);
    }
    
    console.log(`✅ getPreciseLocation completed in ${processingTime}ms`);
    console.log(`   Final result:`, JSON.stringify(result, null, 2));
    
    return result;

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ DETAILED Practical geocoding error:');
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    console.error('   Processing time:', `${processingTime}ms`);
    
    return {
      name: 'Standort wird ermittelt...',
      fullAddress: 'Genauer Standort wird ermittelt...',
      type: 'unknown',
      distance: 0,
      confidence: 'none',
      accuracy: accuracy || null,
      source: 'error',
      debug: {
        processingTime: `${processingTime}ms`,
        error: error.message
      }
    };
  }
}

// Hilfsfunktion: Dezimal zu DMS (Grad, Minuten, Sekunden)
function decimalToDMS(decimal, type) {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = ((minutesFloat - minutes) * 60).toFixed(1);
  
  const direction = type === 'lat' 
    ? (decimal >= 0 ? 'N' : 'S')
    : (decimal >= 0 ? 'E' : 'W');
  
  return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.padStart(4, '0')}"${direction}`;
}

// Nahegelegene Orte finden (für Chat-Räume) - ULTRA SCHNELL
function getNearbyPlaces(latitude, longitude, maxDistance = 15000) {
  const nearbyPlaces = [];

  for (const [name, place] of Object.entries(KOBLENZ_REGION)) {
    const distance = calculateDistance(latitude, longitude, place.lat, place.lng);
    
    if (distance <= maxDistance) {
      nearbyPlaces.push({
        name,
        lat: place.lat,
        lng: place.lng,
        type: place.type,
        distance: Math.round(distance),
        distanceKm: Math.round(distance / 1000)
      });
    }
  }

  return nearbyPlaces.sort((a, b) => a.distance - b.distance);
}

// Erweiterte Radius-Konfiguration für verschiedene Bereiche (REDUZIERT AUF 5KM)
const RADIUS_CONFIG = {
  regional: 20000,     // 20km für regionale Bereiche
  neighborhood: 5000,  // 5km für Nachbarschafts-Bereiche (REDUZIERT VON 10KM)
  city: 8000,          // 8km für Stadt-Bereiche
  events: 15000        // 15km für Event-Entdeckung
};

// Hilfsfunktion: Alle Orte in einem bestimmten Radius finden (5KM FÜR NEIGHBORHOODS)
function getPlacesInRadius(userLat, userLng, radius = 5000) {
  const placesInRadius = [];
  
  for (const [name, place] of Object.entries(KOBLENZ_REGION)) {
    const distance = calculateDistance(userLat, userLng, place.lat, place.lng);
    
    if (distance <= radius) {
      placesInRadius.push({
        name,
        ...place,
        distance: Math.round(distance)
      });
    }
  }
  
  // Sortiere nach Entfernung
  return placesInRadius.sort((a, b) => a.distance - b.distance);
}

// Strukturierte Chat-Room-Platzierung
function getChatRoomStructure(latitude, longitude, radiusConfig) {
  const structure = {
    regional: [],
    neighborhoods: [],
    events: []
  };

  // Regional (größter Radius)
  const regionalPlaces = getPlacesInRadius(latitude, longitude, radiusConfig.regional);
  structure.regional = regionalPlaces.filter(p => p.type === 'city' && p.distance <= radiusConfig.regional);

  // Neighborhoods (strukturierter Radius)
  const neighborhoodPlaces = getPlacesInRadius(latitude, longitude, radiusConfig.neighborhood);
  structure.neighborhoods = neighborhoodPlaces.filter(p => 
    ['city', 'district', 'village'].includes(p.type)
  );

  console.log(`📍 Structure for ${latitude}, ${longitude}:`);
  console.log(`   Regional (${radiusConfig.regional/1000}km): ${structure.regional.length} places`);
  console.log(`   Neighborhoods (${radiusConfig.neighborhood/1000}km): ${structure.neighborhoods.length} places`);

  return structure;
}

// Events in Radius finden (für später)
function getEventsInRadius(latitude, longitude, radius, events = []) {
  return events.filter(event => {
    if (!event.location || !event.location.coordinates) return false;
    
    const distance = calculateDistance(
      latitude, longitude,
      event.location.coordinates[1], 
      event.location.coordinates[0]
    );
    
    return distance <= radius;
  }).sort((a, b) => {
    const distA = calculateDistance(
      latitude, longitude,
      a.location.coordinates[1], 
      a.location.coordinates[0]
    );
    const distB = calculateDistance(
      latitude, longitude,
      b.location.coordinates[1], 
      b.location.coordinates[0]
    );
    return distA - distB;
  });
}

// KORRIGIERTE Cache-Statistiken mit User-Support
function getCacheStats() {
  const now = Date.now();
  let activeLocationEntries = 0;
  let expiredLocationEntries = 0;
  let activeUserEntries = 0;
  let expiredUserEntries = 0;

  // Location Cache
  for (const [key, value] of locationCache.entries()) {
    if ((now - value.timestamp) < CACHE_EXPIRY) {
      activeLocationEntries++;
    } else {
      expiredLocationEntries++;
    }
  }

  // User Cache
  for (const [key, value] of userLocationCache.entries()) {
    if ((now - value.timestamp) < CACHE_EXPIRY) {
      activeUserEntries++;
    } else {
      expiredUserEntries++;
    }
  }

  return {
    location: {
      total: locationCache.size,
      active: activeLocationEntries,
      expired: expiredLocationEntries
    },
    user: {
      total: userLocationCache.size,
      active: activeUserEntries,
      expired: expiredUserEntries
    }
  };
}

// KORRIGIERTE Cleanup mit User-Cache
setInterval(() => {
  const now = Date.now();
  let cleanedLocation = 0;
  let cleanedUser = 0;
  
  // Location Cache cleanup
  for (const [key, value] of locationCache.entries()) {
    if ((now - value.timestamp) >= CACHE_EXPIRY) {
      locationCache.delete(key);
      cleanedLocation++;
    }
  }
  
  // User Cache cleanup
  for (const [key, value] of userLocationCache.entries()) {
    if ((now - value.timestamp) >= CACHE_EXPIRY) {
      userLocationCache.delete(key);
      cleanedUser++;
    }
  }
  
  if (cleanedLocation > 0 || cleanedUser > 0) {
    console.log(`🧹 CLEANUP: Removed ${cleanedLocation} location + ${cleanedUser} user cache entries`);
  }
}, 60 * 60 * 1000); // Cleanup jede Stunde

// KORRIGIERTE Hauptfunktion für strukturierte Standortanalyse - DIESE FEHLT!
async function getStructuredLocationAnalysis(latitude, longitude, accuracy = null, userId = null) {
  console.log(`🚀 STRUCTURED RADIUS-BASED analysis: ${latitude}, ${longitude} (user: ${userId || 'anonymous'})`);
  
  // 1. Präzise Standortbestimmung mit User-Cache
  const locationData = await getPreciseLocation(latitude, longitude, accuracy, userId);
  
  // 2. Radius-Konfiguration
  const radiusConfig = RADIUS_CONFIG;
  
  console.log(`⚙️ Radius Config: Regional=${radiusConfig.regional/1000}km, Neighborhood=${radiusConfig.neighborhood/1000}km,  Events=${radiusConfig.events/1000}km`);
  
  // 3. Alle Orte in 5km Radius finden
  const placesInRadius = getPlacesInRadius(latitude, longitude, radiusConfig.neighborhood);
  
  console.log(`🏘️ Found ALL neighborhoods within ${radiusConfig.neighborhood/1000}km:`);
  placesInRadius.forEach(place => {
    console.log(`   📍 ${place.name} (${(place.distance/1000).toFixed(1)}km away, ${place.type})`);
  });
  
  return {
    location: locationData,
    radiusConfig: radiusConfig,
    placesInRadius: placesInRadius,
    chatRoomStructure: getChatRoomStructure(latitude, longitude, radiusConfig)
  };
}

// KORRIGIERTER Export mit neuen Cache-Funktionen
module.exports = {
  getPreciseLocation,
  getNearbyPlaces,
  calculateDistance,
  getCacheStats,
  getPlacesInRadius,
  getChatRoomStructure,
  getEventsInRadius,
  getStructuredLocationAnalysis,
  clearUserCache,        // NEU
  clearAllCaches,        // NEU
  RADIUS_CONFIG
};
