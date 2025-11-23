const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import Room model
const Room = require('../models/room');
const Review = require('../models/Review');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/rooms/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// -------------------------------------
// GET all rooms
// -------------------------------------
router.get('/getallrooms', async (req, res) => {
  try {
    const rooms = await Room.find({});
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ error: 'No rooms found.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to prevent time mismatches

    const updatedRooms = rooms.map((room) => {
      let roomStatus = "Available Now";

      // 🔒 First check if room is not available
      if (room.isAvailable === false) {
        roomStatus = "Not Available";
      } else if (Array.isArray(room.currentBookings) && room.currentBookings.length > 0) {
        for (const booking of room.currentBookings) {
          if (!booking.fromdate || !booking.todate) continue;

          const [dayF, monthF, yearF] = booking.fromdate.split("-").map(Number);
          const [dayT, monthT, yearT] = booking.todate.split("-").map(Number);

          const fromDate = new Date(yearF, monthF - 1, dayF);
          const toDate = new Date(yearT, monthT - 1, dayT);

          if (isNaN(fromDate) || isNaN(toDate)) {
            console.error("Invalid date format in booking:", booking);
            continue;
          }

          if (today >= fromDate && today <= toDate) {
            roomStatus = "Booked Today";
            break;
          }
        }
      }

      return { ...room.toObject(), roomStatus };
    });

    return res.json(updatedRooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});



// -------------------------------------
// POST get room by ID
// -------------------------------------
router.post('/getroombyid', async (req, res) => {
  const { roomid } = req.body;
  try {
    const room = await Room.findOne({ _id: roomid });
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }
    return res.json(room);
  } catch (error) {
    console.error('Error fetching room by ID:', error);
    return res.status(400).json({ message: error.message });
  }
});
router.post('/getroomsbyids', async (req, res) => {
  const { roomIds } = req.body;

  try {
    const rooms = await Room.find({ _id: { $in: roomIds } })
      .populate('currentBookings.userid', 'name email'); // Populate user details

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const roomsWithStatus = rooms.map(room => {
      // First, check if the room is marked as unavailable
      if (room.isAvailable === false) {
        return { ...room.toObject(), roomStatus: "Not Available" };
      }

      // Otherwise, determine status based on current bookings
      let roomStatus = "Available Now";
      if (Array.isArray(room.currentBookings) && room.currentBookings.length > 0) {
        for (const booking of room.currentBookings) {
          if (!booking.fromdate || !booking.todate) continue; // Skip invalid entries

          // Convert "DD-MM-YYYY" format to Date object
          const [dayF, monthF, yearF] = booking.fromdate.split("-").map(Number);
          const [dayT, monthT, yearT] = booking.todate.split("-").map(Number);
          const fromDate = new Date(yearF, monthF - 1, dayF); // Month is 0-based in JS
          const toDate = new Date(yearT, monthT - 1, dayT);

          if (isNaN(fromDate) || isNaN(toDate)) {
            console.error("Invalid date format in booking:", booking);
            continue;
          }

          // Check if today's date is within booking period
          if (today >= fromDate && today <= toDate) {
            roomStatus = "Booked Today";
            break; // No need to check further if booked today
          }
        }
      }

      return { 
        ...room.toObject(),
        roomStatus 
      };
    });

    res.json({ rooms: roomsWithStatus });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// -------------------------------------
// POST add a new room (with up to 5 images)
// -------------------------------------
router.post('/addroom', upload.array('images'), async (req, res) => {
  try {
    const {
      roomName,
      roomtype,
      address,
      awayFromHighway,
      description,
      price,
      features,
      latitude, 
      longitude,
      ownerId  
    } = req.body;

    if (!roomName || !roomtype || !ownerId || !address || !description || !price || !awayFromHighway) {
      return res.status(400).json({ success: false, message: 'Room name, roomtype, and ownerId are required!' });
    }

    let parsedFeatures = [];
    try {
      parsedFeatures = features ? JSON.parse(features) : [];
    } catch (err) {
      console.error('Error parsing features:', err);
      parsedFeatures = [];
    }

    const imagePaths = req.files.map((file) => file.path.replace(/\\/g, '/'));

    // All rooms are available by default
    const isAvailable = true;  

    const newRoom = new Room({
      name: roomName,
      roomtype,
      address,
      awayFromHighway,
      description,
      price,
      features: parsedFeatures,
      imageUrls: imagePaths,
      currentBookings: [],
      latitude,
      longitude,
      ownerId,
      isAvailable
    });

    await newRoom.save();
    return res.status(201).json({ success: true, message: 'Room added successfully.' });
  } catch (error) {
    console.error('Error saving room:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// -------------------------------------
// GET Check Room Availability
// -------------------------------------
router.get('/checkAvailability', async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.query;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'roomId, checkInDate, and checkOutDate are required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // let isAvailable = true;

    if (room.roomtype === 'hotelRoom') {
      // Check if the room is booked on the requested dates
      isAvailable = !room.currentBookings.some((booking) => {
        return (
          (new Date(checkInDate) >= new Date(booking.fromDate) &&
            new Date(checkInDate) <= new Date(booking.toDate)) ||
          (new Date(checkOutDate) >= new Date(booking.fromDate) &&
            new Date(checkOutDate) <= new Date(booking.toDate))
        );
      });
    } else {
      // For flats/rooms, use static `isAvailable`
      isAvailable = room.isAvailable;
    }

    return res.json({ isAvailable });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// -------------------------------------
// PUT Mark Room as Booked (Only for Flats/Rooms)
// -------------------------------------
router.put('/markRoomAsBooked/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // if (room.roomtype !== "hotelRoom") {
    //   room.isAvailable = false;
    //   await room.save();
    // }

    res.status(200).json({ message: 'Room marked as booked successfully' });
  } catch (error) {
    console.error('Error marking room as booked:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// -------------------------------------
// GET Rooms by Owner
// -------------------------------------
router.get('/getByOwner', async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }
    const rooms = await Room.find({ ownerId: ownerId });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------------------------
// DELETE Room by ID
// -------------------------------------
router.delete('/deleteRoom', async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }
    
    const deletedRoom = await Room.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:roomId/average-rating', async (req, res) => {
  try {
    const { roomId } = req.params;
    const reviews = await Review.find({ room: roomId });
    if (reviews.length === 0) {
      return res.json({ averageRating: 0, numberOfReviews: 0 });
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / reviews.length;

    res.json({
      averageRating: parseFloat(avg.toFixed(1)),
      numberOfReviews: reviews.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch average rating.' });
  }
});

// --------------------------------------
// ✅ Check and Fix Room Availability Status
// --------------------------------------
router.post('/checkAndFixAvailability', async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    
    // Check current status
    const currentStatus = {
      id: room._id,
      name: room.name,
      type: room.roomtype,
      isAvailable: room.isAvailable,
      hasBookings: room.currentBookings.length > 0
    };
    
    // For non-hotel rooms, availability should be false if there are current bookings
    let statusFixed = false;
    if (room.roomtype !== "hotelRoom") {
      const shouldBeAvailable = room.currentBookings.length === 0;
      
      if (room.isAvailable !== shouldBeAvailable) {
        // Status is wrong, update it
        room.isAvailable = shouldBeAvailable;
        await room.save();
        statusFixed = true;
      }
    }
    
    res.json({
      before: currentStatus,
      fixed: statusFixed,
      after: {
        ...currentStatus,
        isAvailable: room.isAvailable
      }
    });
  } catch (error) {
    console.error("Error checking/fixing availability:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
