const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for event cover images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/events');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'event-cover-' + uniqueSuffix + extension);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit für Event Cover Images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bild-Dateien sind erlaubt!'), false);
    }
  }
});

// POST /api/events/create - Event erstellen
router.post('/create', auth, upload.single('coverImage'), async (req, res) => {
  try {
    console.log('🎉 Creating event with data:', req.body);
    console.log('📸 Cover image:', req.file ? req.file.filename : 'none');

    const {
      name,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      radius,
      maxParticipants,
      tags,
      eventType,
      location
    } = req.body;

    // Validierung
    if (!name || !description || !startDate || !startTime) {
      return res.status(400).json({
        error: 'Name, Beschreibung, Startdatum und Startzeit sind erforderlich'
      });
    }

    // Start- und End-DateTime kombinieren
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = endDate && endTime ? 
      new Date(`${endDate}T${endTime}`) : 
      new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Default: 2 Stunden später

    // Event-Daten für ChatRoom
    const eventData = {
      name,
      description,
      location: location ? JSON.parse(location) : null,
      startDate: startDateTime,
      endDate: endDateTime,
      eventType: eventType || 'event',
      organizer: req.user.id,
      maxParticipants: parseInt(maxParticipants) || 100,
      tags: tags ? JSON.parse(tags) : [],
      coverImage: req.file ? `/uploads/events/${req.file.filename}` : null
    };

    console.log('📅 Processed event data:', eventData);

    // Event-ChatRoom erstellen
    const eventRoom = await ChatRoom.createEventRoom(eventData);

    // Organizer als ersten Teilnehmer hinzufügen
    if (!eventRoom.participants.includes(req.user.id)) {
      eventRoom.participants.push(req.user.id);
      eventRoom.memberCount = eventRoom.participants.length;
      await eventRoom.save();
    }

    console.log(`✅ Event created: ${name} (Room ID: ${eventRoom._id})`);

    res.status(201).json({
      message: 'Event erfolgreich erstellt!',
      event: {
        _id: eventRoom._id,
        roomId: eventRoom.roomId,
        name: eventRoom.name,
        description: eventRoom.description,
        type: eventRoom.type,
        startDate: eventRoom.eventDetails.startDate,
        endDate: eventRoom.eventDetails.endDate,
        maxParticipants: eventRoom.eventDetails.maxParticipants,
        currentParticipants: eventRoom.memberCount,
        coverImage: eventData.coverImage,
        tags: eventData.tags,
        organizer: req.user.username,
        location: eventRoom.location
      }
    });

  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({
      error: 'Fehler beim Erstellen des Events',
      details: error.message
    });
  }
});

// GET /api/events/nearby - Events in der Nähe
router.get('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude und Longitude sind erforderlich'
      });
    }

    const radiusInMeters = parseInt(radius);
    const now = new Date();

    // Events in der Nähe finden (die noch nicht abgelaufen sind)
    const events = await ChatRoom.find({
      type: 'event',
      'eventDetails.endDate': { $gte: now },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
    .populate('createdBy', 'username')
    .sort({ 'eventDetails.startDate': 1 })
    .limit(20);

    console.log(`🗺️ Found ${events.length} events near ${latitude}, ${longitude} (radius: ${radiusInMeters}m)`);

    const formattedEvents = events.map(event => ({
      _id: event._id,
      roomId: event.roomId,
      name: event.name,
      description: event.description,
      type: event.type,
      startDate: event.eventDetails.startDate,
      endDate: event.eventDetails.endDate,
      maxParticipants: event.eventDetails.maxParticipants,
      currentParticipants: event.memberCount || 0,
      organizer: event.createdBy?.username || 'Unbekannt',
      location: event.location,
      tags: event.tags || [],
      coverImage: event.coverImage
    }));

    res.json({
      events: formattedEvents,
      count: formattedEvents.length
    });

  } catch (error) {
    console.error('❌ Error fetching nearby events:', error);
    res.status(500).json({
      error: 'Fehler beim Abrufen der Events',
      details: error.message
    });
  }
});

// GET /api/events/:eventId - Einzelnes Event abrufen
router.get('/:eventId', auth, async (req, res) => {
  try {
    const event = await ChatRoom.findById(req.params.eventId)
      .populate('createdBy', 'username')
      .populate('participants', 'username avatar');

    if (!event || event.type !== 'event') {
      return res.status(404).json({ error: 'Event nicht gefunden' });
    }

    const eventData = {
      _id: event._id,
      roomId: event.roomId,
      name: event.name,
      description: event.description,
      type: event.type,
      startDate: event.eventDetails.startDate,
      endDate: event.eventDetails.endDate,
      maxParticipants: event.eventDetails.maxParticipants,
      currentParticipants: event.memberCount || 0,
      organizer: event.createdBy?.username || 'Unbekannt',
      participants: event.participants || [],
      location: event.location,
      tags: event.tags || [],
      coverImage: event.coverImage,
      isParticipant: event.participants.some(p => p._id.toString() === req.user.id)
    };

    res.json({ event: eventData });

  } catch (error) {
    console.error('❌ Error fetching event:', error);
    res.status(500).json({
      error: 'Fehler beim Abrufen des Events',
      details: error.message
    });
  }
});

// POST /api/events/:eventId/join - An Event teilnehmen
router.post('/:eventId/join', auth, async (req, res) => {
  try {
    const event = await ChatRoom.findById(req.params.eventId);

    if (!event || event.type !== 'event') {
      return res.status(404).json({ error: 'Event nicht gefunden' });
    }

    // Prüfen ob Event bereits voll ist
    if (event.participants.length >= event.eventDetails.maxParticipants) {
      return res.status(400).json({ error: 'Event ist bereits ausgebucht' });
    }

    // Prüfen ob User bereits teilnimmt
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ error: 'Du nimmst bereits an diesem Event teil' });
    }

    // User hinzufügen
    event.participants.push(req.user.id);
    event.memberCount = event.participants.length;
    await event.save();

    console.log(`👥 User ${req.user.username} joined event: ${event.name}`);

    res.json({
      message: 'Erfolgreich am Event angemeldet!',
      currentParticipants: event.memberCount
    });

  } catch (error) {
    console.error('❌ Error joining event:', error);
    res.status(500).json({
      error: 'Fehler beim Beitreten zum Event',
      details: error.message
    });
  }
});

// POST /api/events/:eventId/leave - Event verlassen
router.post('/:eventId/leave', auth, async (req, res) => {
  try {
    const event = await ChatRoom.findById(req.params.eventId);

    if (!event || event.type !== 'event') {
      return res.status(404).json({ error: 'Event nicht gefunden' });
    }

    // Prüfen ob User überhaupt teilnimmt
    if (!event.participants.includes(req.user.id)) {
      return res.status(400).json({ error: 'Du nimmst nicht an diesem Event teil' });
    }

    // User entfernen
    event.participants = event.participants.filter(p => p.toString() !== req.user.id);
    event.memberCount = event.participants.length;
    await event.save();

    console.log(`👋 User ${req.user.username} left event: ${event.name}`);

    res.json({
      message: 'Event erfolgreich verlassen!',
      currentParticipants: event.memberCount
    });

  } catch (error) {
    console.error('❌ Error leaving event:', error);
    res.status(500).json({
      error: 'Fehler beim Verlassen des Events',
      details: error.message
    });
  }
});

module.exports = router;
