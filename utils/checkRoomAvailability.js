const mongoose = require('mongoose');
const Room = require('../models/room');

const checkRoomAvailability = async () => {
  try {
    // Connect to MongoDB - using the same connection string as in db.js
    const mongoURL = 'mongodb+srv://kg121bit:karan121@cluster0.imzpo.mongodb.net/Avas';
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected for availability check');

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms to check`);

    let correctCount = 0;
    let incorrectCount = 0;
    let hotelRoomCount = 0;
    let invalidDataCount = 0;

    // Check each room
    for (const room of rooms) {
      try {
        console.log(`Room ${room._id} (${room.name || 'No name'}) - Type: ${room.roomtype || 'Unknown'}`);
        
        // Check if the room has valid data
        if (!room.roomtype) {
          console.log('  ⚠️ Room missing roomtype property');
          invalidDataCount++;
          continue;
        }

        if (room.roomtype === "hotelRoom") {
          console.log('  ℹ️ Hotel room (always available)');
          hotelRoomCount++;
          continue; // Skip hotel rooms as they're always available
        }

        const hasBookings = Array.isArray(room.currentBookings) && room.currentBookings.length > 0;
        const shouldBeAvailable = !hasBookings;

        console.log(`  Current status: isAvailable = ${room.isAvailable}, hasBookings = ${hasBookings}`);
        console.log(`  Current bookings: ${room.currentBookings.length}`);

        if (room.isAvailable === shouldBeAvailable) {
          console.log('  ✅ Status is correct');
          correctCount++;
        } else {
          console.log(`  ❌ Status is wrong: isAvailable = ${room.isAvailable}, shouldBe = ${shouldBeAvailable}`);
          incorrectCount++;
        }
      } catch (roomError) {
        console.error(`  ⚠️ Error processing room ${room._id}:`, roomError);
        invalidDataCount++;
      }
    }

    console.log('\nSummary:');
    console.log(`Total rooms checked: ${rooms.length}`);
    console.log(`Hotel rooms (skipped): ${hotelRoomCount}`);
    console.log(`Rooms with correct status: ${correctCount}`);
    console.log(`Rooms with incorrect status: ${incorrectCount}`);
    console.log(`Rooms with invalid data: ${invalidDataCount}`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error checking room availability:', error);
  }
};

// Run the function
checkRoomAvailability(); 