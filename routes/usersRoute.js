const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const bcrypt = require('bcrypt');
const Room = require('../models/room'); 
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// ===== User Signup =====
router.post('/submit-users', async (req, res) => {
  try {
    const { name, email, phone, password, cpassword } = req.body;

    if (password !== cpassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'Number already Registered' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already Registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed Password during Signup:', hashedPassword);

    const user = new User({ name, email, phone, password: hashedPassword });
    await user.save();

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      isOwner: user.isOwner,
    };

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Send response including token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      token, // <-- include token here for auto-login
    });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ===== User Login =====
router.post('/login-users', async (req, res) => {
  try {
    const { input, password } = req.body;  // 'input' could be email or phone

    if (!input || !password) {
      return res.status(400).json({ success: false, message: 'Missing email/phone or password' });
    }

    let user;
    if (input.includes('@')) {  // Email
      user = await User.findOne({ email: input });
    } else {
      user = await User.findOne({ phone: input });
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'User is not Registered' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    // Create the payload and sign the token (expires in 1 hour)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      isOwner: user.isOwner, 
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      token,  // send the token to the client
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== Get All Users =====
router.get('/getallusers', async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===== Get Owner Profile by Owner ID =====
router.get('/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params; // Extract ownerId from URL params
    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Remove sensitive fields (e.g., password)
    const ownerData = owner.toJSON();
    delete ownerData.password;

    res.status(200).json(ownerData);
  } catch (error) {
    console.error("Error fetching owner profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ===== Save a Room (Add to savedRooms) =====
// Endpoint: PATCH /api/users/:userid/saveroom
router.patch('/:userid/saveroom', async (req, res) => {
  const { userid } = req.params;
  const { roomid } = req.body;  // Expecting { roomid: "theRoomID" }

  if (!roomid) {
    return res.status(400).json({ success: false, message: 'Room ID is required.' });
  }

  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if the room is already saved
    if (user.savedRooms.includes(roomid)) {
      return res.status(200).json({ success: true, message: 'Room already saved.', savedRooms: user.savedRooms });
    }

    // Add the room to the savedRooms array
    user.savedRooms.push(roomid);
    await user.save();
    
    return res.json({ success: true, message: 'Room saved successfully.', savedRooms: user.savedRooms });
  } catch (error) {
    console.error('Error saving room:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ===== Unsave a Room (Remove from savedRooms) =====
// Endpoint: PATCH /api/users/:userid/unsaveroom
router.patch('/:userid/unsaveroom', async (req, res) => {
  const { userid } = req.params;
  const { roomid } = req.body;

  if (!roomid) {
    return res.status(400).json({ success: false, message: 'Room ID is required.' });
  }

  try {
    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Remove the room from savedRooms
    user.savedRooms = user.savedRooms.filter(id => id.toString() !== roomid);
    await user.save();

    return res.json({ success: true, message: 'Room unsaved successfully.', savedRooms: user.savedRooms });
  } catch (error) {
    console.error('Error unsaving room:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ===== Get Saved Rooms for a User =====
// Endpoint: GET /api/users/:userid/savedrooms
router.get('/:userid/savedrooms', async (req, res) => {
  const { userid } = req.params;
  try {
    const user = await User.findById(userid);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    
    // Temporarily return the savedRooms without populating
    return res.json({ success: true, savedRooms: user.savedRooms });
  } catch (error) {
    console.error('Error fetching saved rooms:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


module.exports = router;
