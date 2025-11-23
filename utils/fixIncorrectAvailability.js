const mongoose = require('mongoose');
const Room = require('../models/room');

const fixIncorrectAvailability = async () => {
  try {
    // Connect to MongoDB - using the same connection string as in db.js
    const mongoURL = 'mongodb+srv://kg121bit:karan121@cluster0.imzpo.mongodb.net/Avas';
    await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected for availability fix');

    // Get all rooms that aren't hotel rooms
    const nonHotelRooms = await Room.find({ roomtype: { $ne: 'hotelRoom' } });
    console.log(`Found ${nonHotelRooms.length} non-hotel rooms to check`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;

    // Process each non-hotel room
    for (const room of nonHotelRooms) {
      try {
        const hasBookings = Array.isArray(room.currentBookings) && room.currentBookings.length > 0;
        const shouldBeAvailable = !hasBookings;
        
        console.log(`Room ${room._id} (${room.name}) - Type: ${room.roomtype}`);
        console.log(`  Current status: isAvailable = ${room.isAvailable}, hasBookings = ${hasBookings}`);
        console.log(`  Current bookings: ${room.currentBookings.length}`);
        
        if (room.isAvailable !== shouldBeAvailable) {
          console.log(`  ❌ Status is wrong, fixing: ${room.isAvailable} → ${shouldBeAvailable}`);
          
          // Use updateOne to avoid validation issues
          const updateResult = await Room.updateOne(
            { _id: room._id },
            { $set: { isAvailable: shouldBeAvailable } }
          );
          
          if (updateResult.modifiedCount === 1) {
            console.log('  ✅ Fixed successfully');
            fixedCount++;
          } else {
            console.log('  ⚠️ Update operation completed but no document was modified');
            errorCount++;
          }
        } else {
          console.log('  ✅ Status is already correct');
          alreadyCorrectCount++;
        }
      } catch (roomError) {
        console.error(`  ⚠️ Error processing room ${room._id}:`, roomError);
        errorCount++;
      }
    }

    console.log('\nSummary:');
    console.log(`Total non-hotel rooms checked: ${nonHotelRooms.length}`);
    console.log(`Rooms with status already correct: ${alreadyCorrectCount}`);
    console.log(`Rooms fixed: ${fixedCount}`);
    console.log(`Rooms with errors: ${errorCount}`);

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error fixing room availability:', error);
  }
};

// Run the function
fixIncorrectAvailability(); 