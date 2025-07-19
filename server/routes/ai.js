const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const geminiService = require('../services/geminiService');

// Get AI welcome message based on user location
router.post('/welcome', auth, async (req, res) => {
  try {
    const { latitude, longitude, locationName, nearbyPlaces } = req.body;

    console.log('🤖 Generating AI welcome message for:', locationName);

    const welcomeMessage = await geminiService.generateWelcomeMessage(
      locationName || 'deiner Region',
      nearbyPlaces || []
    );

    const regionalNews = await geminiService.generateRegionalNews(
      locationName || 'deiner Region', 
      nearbyPlaces || []
    );

    res.json({
      success: true,
      welcomeMessage,
      regionalNews,
      location: locationName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Welcome Error:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Generieren der Begrüßung',
      fallbackMessage: 'Willkommen bei Chatilo! Entdecke lokale Chat-Räume und verbinde dich mit Menschen in deiner Umgebung.'
    });
  }
});

module.exports = router;