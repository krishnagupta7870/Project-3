const mongoose = require('mongoose');
const Room = require('../models/room');

const fixRoomAvailability = async () => {
  try {
    // Connect to MongoDB - using the same connection string as in db.js
    const mongoURL = 'mongodb+srv://kg121bit:karan121@cluster0.imzpo.mongodb.net/Avas';
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected for availability fix');

    // Get all rooms
    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms to check`);

    let fixedCount = 0;
    let correctCount = 0;
    let hotelRoomCount = 0;

    // Check each room
    for (const room of rooms) {
      if (room.roomtype === "hotelRoom") {
        hotelRoomCount++;
        continue; // Skip hotel rooms as they're always available
      }

      const hasBookings = room.currentBookings.length > 0;
      const shouldBeAvailable = !hasBookings;

      console.log(`Room ${room._id} (${room.name}) - Type: ${room.roomtype}`);
      console.log(`  Current status: isAvailable = ${room.isAvailable}, hasBookings = ${hasBookings}`);

      if (room.isAvailable === shouldBeAvailable) {
        console.log('  ✅ Status is correct');
        correctCount++;
      } else {
        console.log(`  ❌ Status is wrong, fixing: ${room.isAvailable} → ${shouldBeAvailable}`);
        room.isAvailable = shouldBeAvailable;
        await room.save();
        fixedCount++;
      }
    }

    console.log('\nSummary:');
    console.log(`Total rooms checked: ${rooms.length}`);
    console.log(`Hotel rooms (skipped): ${hotelRoomCount}`);
    console.log(`Rooms with correct status: ${correctCount}`);
    console.log(`Rooms with fixed status: ${fixedCount}`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error fixing room availability:', error);
  }
};

// Run the function
fixRoomAvailability(); 