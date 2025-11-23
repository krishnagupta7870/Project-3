const mongoose = require('mongoose');

const esewaSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  amount: Number,
  productId: String,
  referenceId: String, // eSewa's transaction ID
  status: String, // "Success" or "Failure"
  paymentDate: { type: Date, default: Date.now },
});

const EsewaPayment = mongoose.model('EsewaPayment', esewaSchema);

module.exports = EsewaPayment; // Use CommonJS export