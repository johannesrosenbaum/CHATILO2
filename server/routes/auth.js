const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const auth = require('../middleware/auth'); // Import auth middleware
const authController = require('../controllers/authController'); // Import auth controller

// 🔥 KORRIGIERT: Verwende authController für ALLE Auth-Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// GET /api/auth/me - Get current user
router.get('/me', auth, authController.getMe);

module.exports = router;
