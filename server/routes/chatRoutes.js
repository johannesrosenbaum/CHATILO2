const express = require('express');
const router = express.Router();
const { getStructuredLocationAnalysis } = require('../utils/geocoding');
const auth = require('../middleware/auth');

// FÜGE GANZ OBEN EIN EINZIGARTIGES LOG HINZU
console.log('🚨🚨🚨 ROUTE FILE LOADED AT:', new Date().toISOString());
console.log('🚨🚨🚨 THIS IS THE CORRECT UPDATED FILE VERSION 3.0');

// ENTFERNT: Mock- und Überschreibungsrouten für /rooms/nearby
// router.get('/rooms/nearby', ...)
// router.all('/rooms/nearby', ...)

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
