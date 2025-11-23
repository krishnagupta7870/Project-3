const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
  room: { type: String, required: true },
  roomid: { 
    type: mongoose.Schema.Types.ObjectId, // ✅ Change to ObjectId
    ref: 'room', // Reference the `room` model
    required: true 
  },
  roomType: {type: String },
  userid: { 
    type: mongoose.Schema.Types.ObjectId, // ✅ Change to ObjectId
    ref: 'User', // Reference the `User` model
    required: true 
  },
  fromdate: { type: String },
  todate: { type: String },
  totaldays: { type: Number },
  totalamount: { type: Number, required: true },
  paymentMethod: { type: String},
  transactionId: {  type: String, required: true },
  status: { type: String, default: 'booked' }
}, {
  timestamps: true,
});

module.exports = mongoose.model("Booking", bookingSchema);
