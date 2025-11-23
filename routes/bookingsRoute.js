const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Room = require('../models/room');
const authMiddleware = require('../authMiddleware');
const mongoose = require("mongoose");

// --------------------------------------
// ✅ BOOK A ROOM
// --------------------------------------
router.post('/bookroom', async (req, res) => {
  try {
    const {
      room,
      roomType,
      userid,
      fromdate,
      todate,
      totalamount,
      totaldays,
      paymentMethod,
      transactionId
    } = req.body;

    if (!room || !userid || !totalamount ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const roomtemp = await Room.findOne({ _id: room._id });
    if (!roomtemp) {
      return res.status(404).json({ message: "Room not found" });
    }

    // ✅ Check availability for hotel rooms
    if (room.roomtype === "hotelRoom") {
      const isBooked = roomtemp.currentBookings.some((booking) => {
        return (
          (new Date(fromdate) >= new Date(booking.fromdate) &&
            new Date(fromdate) <= new Date(booking.todate)) ||
          (new Date(todate) >= new Date(booking.fromdate) &&
            new Date(todate) <= new Date(booking.todate))
        );
      });

      if (isBooked) {
        return res.status(400).json({ message: "Room is already booked for selected dates" });
      }
    } else {
      // ✅ For flats/rooms, check if it's available
      if (!room.isAvailable) {
        return res.status(400).json({ message: "Room is not available" });
      }
    }

    // ✅ Create a new booking
    const newbooking = new Booking({
      room: room.name,
      roomid: room._id,
      roomType,
      userid,
      fromdate,
      todate,
      totalamount,
      totaldays,
      paymentMethod: paymentMethod ,
      transactionId: transactionId || '1234',
    });

    const booking = await newbooking.save();

    // ✅ Add to room's currentBookings
    roomtemp.currentBookings.push({
      bookingid: booking._id,
      fromdate,
      todate, 
      userid,
      status: booking.status,
    });

    // ✅ For flats/rooms, set isAvailable = false
    console.log("Room roomtype:", room.roomtype);
    if (room.roomtype !== "hotelRoom") {
      roomtemp.isAvailable = false;
    }
    await roomtemp.save();

    res.status(200).json({ success: true, message: 'Room booked successfully' });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------
// ✅ GET BOOKINGS BY USER ID
// --------------------------------------
router.post('/getbookingsbyuserId', async (req, res) => {
  try {
    const userid = req.body.userId;
    if (!userid) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Get all bookings for this user
    const bookings = await Booking.find({ userid });
    
    // For each booking, get additional room information
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Get the room details
          const room = await Room.findById(booking.roomid);
          
          if (room) {
            // Get owner details if available
            let ownerInfo = {};
            if (room.ownerId) {
              try {
                const User = require('../models/user');
                const owner = await User.findById(room.ownerId);
                if (owner) {
                  ownerInfo = {
                    ownerName: owner.name,
                    ownerPhone: owner.phone,
                    ownerEmail: owner.email
                  };
                }
              } catch (ownerError) {
                console.error("Error fetching owner:", ownerError);
              }
            }
            
            // Create an enhanced booking object with additional info
            const bookingObj = booking.toObject();
            return {
              ...bookingObj,
              roomaddress: room.address || "Address not available",
              roomType: room.roomtype,
              ...ownerInfo
            };
          }
          return booking;
        } catch (roomError) {
          console.error("Error fetching room details:", roomError);
          return booking;
        }
      })
    );
    
    res.status(200).json(enhancedBookings);
  } catch (error) {
    console.error("Error in getbookingsbyuserId:", error);
    return res.status(500).json({ message: "Error fetching bookings" });
  }
});

// --------------------------------------
// ✅ CANCEL A BOOKING
// --------------------------------------
router.post('/cancelbooking', async (req, res) => {
  try {
    const { bookingid, roomid } = req.body;

    if (!bookingid || !roomid) {
      return res.status(400).json({ message: "Booking ID and Room ID are required" });
    }

    const bookingItem = await Booking.findOne({ _id: bookingid });
    if (!bookingItem) {
      return res.status(404).json({ message: "Booking not found" });
    }

    bookingItem.status = 'cancelled';
    await bookingItem.save();

    const room = await Room.findOne({ _id: roomid });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // ✅ Remove from currentBookings
    room.currentBookings = room.currentBookings.filter(
      (booking) => booking.bookingid.toString() !== bookingid
    );

    // ✅ For flats/rooms, mark as available again
    if (room.roomtype !== "hotelRoom") {
      room.isAvailable = true;
      console.log(`Setting room ${room._id} (${room.roomtype}) availability to true after cancellation`);
    }

    await room.save({ validateBeforeSave: false });

    // ✅ Return updated bookings
    const updatedBookings = await Booking.find({ userid: bookingItem.userid });
    res.status(200).json(updatedBookings);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------
// ✅ GET ALL BOOKINGS (Admin Panel)
// --------------------------------------
router.get('/getallbookings', async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.status(200).json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching bookings" });
  }
});

router.post('/hasBooked', authMiddleware, async (req, res) => {
  try {
    // Use one of these, depending on where you're expecting roomid from (URL params or request body)
    const { roomid } = req.body;
    const userid = req.user._id; // Assuming you need the _id of the user from the decoded token

    // Check if roomid is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(roomid)) {
      return res.status(400).json({ message: roomid });
    }

    // Find if a booking exists for the given room and user
    const booking = await Booking.findOne({ 
      roomid: new mongoose.Types.ObjectId(roomid), 
      userid: userid 
    });
    
    res.json({ hasBooked: !!booking }); // Return true/false
  } catch (error) {
    console.error("Route error:", error); // Log it in terminal
    res.status(500).json({ message: error.message });
  }
});

// --------------------------------------
// ✅ GET BOOKINGS FOR OWNER'S ROOMS
// --------------------------------------
router.post('/getBookingsByOwnerId', async (req, res) => {
  try {
    const { ownerId } = req.body;
    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }
    
    // First get all rooms owned by this owner
    const Room = require('../models/room');
    const rooms = await Room.find({ ownerId });
    
    if (!rooms || rooms.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get all room IDs
    const roomIds = rooms.map(room => room._id);
    
    // Get all bookings for these rooms
    const bookings = await Booking.find({ roomid: { $in: roomIds } });
    
    // For each booking, get additional room and user information
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          // Get the room details
          const room = await Room.findById(booking.roomid);
          
          // Get user details
          const User = require('../models/user');
          let userInfo = {};
          try {
            const user = await User.findById(booking.userid);
            if (user) {
              userInfo = {
                userName: user.name,
                userPhone: user.phone,
                userEmail: user.email
              };
            }
          } catch (userError) {
            console.error("Error fetching user:", userError);
          }
          
          // Create an enhanced booking object with additional info
          const bookingObj = booking.toObject();
          return {
            ...bookingObj,
            roomName: room ? room.name : "Unknown Room",
            roomAddress: room ? room.address : "Address not available",
            roomType: room ? room.roomtype : "Unknown Type",
            ...userInfo
          };
        } catch (error) {
          console.error("Error fetching details for booking:", error);
          return booking;
        }
      })
    );
    
    res.status(200).json(enhancedBookings);
  } catch (error) {
    console.error("Error in getBookingsByOwnerId:", error);
    return res.status(500).json({ message: "Error fetching bookings for owner" });
  }
});

module.exports = router;

