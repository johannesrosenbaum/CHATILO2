// ERWEITERTE DEBUGGING Registrierung
router.post('/register', async (req, res) => {
  console.log('🔧 DETAILED Registration request received:');
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  console.log('   Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { username, email, password } = req.body;
    
    // Validierung
    if (!username || !email || !password) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Username, email and password are required'
      });
    }

    // Prüfe existierende Benutzer
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase().trim() });
    const existingUserByUsername = await User.findOne({ username: username.trim() });
    
    if (existingUserByEmail) {
      console.error('❌ Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    if (existingUserByUsername) {
      console.error('❌ Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Password hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // KORRIGIERT: User erstellen OHNE fehlerhafte lastLocation
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      locationEnabled: true,
      notificationsEnabled: true,
      isActive: true,
      lastSeen: new Date(),
      bio: '',
      // WICHTIG: lastLocation wird NICHT gesetzt (verwendet Default)
      currentLocationName: 'Standort wird ermittelt...'
    });

    console.log('🔧 DEBUG: Saving user without lastLocation...');
    const savedUser = await newUser.save();
    console.log('✅ User saved successfully with ID:', savedUser._id);

    // JWT Token mit konsistentem Secret
    const jwtSecret = process.env.JWT_SECRET || 'chatilo_super_secret_key_2024_production_ready';
    console.log('🔧 DEBUG: Using JWT secret:', jwtSecret ? 'environment variable' : 'fallback');
    
    const tokenPayload = {
      userId: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    
    const token = jwt.sign(tokenPayload, jwtSecret);

    // Response
    const userResponse = {
      id: savedUser._id,
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      locationEnabled: savedUser.locationEnabled,
      notificationsEnabled: savedUser.notificationsEnabled,
      isActive: savedUser.isActive,
      lastSeen: savedUser.lastSeen,
      currentLocationName: savedUser.currentLocationName
    };

    console.log('🎉 REGISTRATION SUCCESS:', savedUser.username);

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ DETAILED Registration error:', error);
    
    // MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }

    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ERWEITERTE DEBUGGING Login
router.post('/login', async (req, res) => {
  console.log('🔧 DETAILED Login request received:');
  console.log('   Body:', JSON.stringify(req.body, null, 2));
  console.log('   IP:', req.ip);
  
  try {
    const { email, password } = req.body;

    // Validierung
    if (!email || !password) {
      console.error('❌ Missing login credentials');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('🔧 DEBUG: Looking for user with email:', email);

    // User finden
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.error('❌ User not found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.username, 'ID:', user._id);

    // Password prüfen
    console.log('🔧 DEBUG: Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.error('❌ Password mismatch for user:', user.username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Password verified successfully');

    // Token generieren
    const tokenPayload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'fallback_secret_key');

    // Last seen update
    user.lastSeen = new Date();
    user.isActive = true;
    await user.save();

    const userResponse = {
      id: user._id,
      _id: user._id,
      username: user.username,
      email: user.email,
      locationEnabled: user.locationEnabled,
      notificationsEnabled: user.notificationsEnabled,
      isActive: user.isActive,
      lastSeen: user.lastSeen
    };

    console.log('🎉 LOGIN SUCCESS for:', user.username);

    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ DETAILED Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ERWEITERTE DEBUGGING Token Verification
router.get('/me', authenticateToken, async (req, res) => {
  console.log('🔧 DETAILED /me request:');
  console.log('   User from token:', req.user);
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      console.error('❌ User not found with ID:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      id: user._id,
      _id: user._id,
      username: user.username,
      email: user.email,
      locationEnabled: user.locationEnabled,
      notificationsEnabled: user.notificationsEnabled,
      isActive: user.isActive,
      lastSeen: user.lastSeen
    };

    console.log('✅ /me success for:', user.username);

    res.json({
      user: userResponse,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ DETAILED /me error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});