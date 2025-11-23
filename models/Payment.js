// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },  // e.g., Stripe charge ID
  gateway: { type: String, required: true },      // e.g., 'Khalti' or 'Stripe'
  customer_id: { type: String, required: true },
  room_id: { type: String, required: true},
  amount: { type: Number, required: true },       // Store amount as a plain number (no currency symbol)
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_phone: { type: String, required: true },
  status: { type: String, default: "Pending" },
  stripeToken: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
