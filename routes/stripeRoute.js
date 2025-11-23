// routes/stripeRoute.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const Booking = require("../models/booking");
const Room = require("../models/room");
const User = require("../models/user");

router.post("/charge", async (req, res) => {
  console.log("Received charge data:", req.body);
  try {
    const {
      token, amount, customer_email, customer_id, customer_name, customer_phone,
      room, fromdate, todate, roomid, totaldays,roomType
    } = req.body;

    if (!token || !amount || !customer_email || !customer_id || !roomid || !room ) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    console.log("Processing charge for:", req.body);

    // 1. Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_data: { type: "card", card: { token: token.id } },
      confirm: true,
      return_url: "http://localhost:3000/payment-success",
    });

    console.log("Stripe PaymentIntent:", paymentIntent);

    // 2. Save Payment
    const newPayment = new Payment({
      paymentId: paymentIntent.id,
      gateway: "Stripe",
      customer_id,
      room_id: roomid,
      amount: paymentIntent.amount / 100,
      customer_name,
      customer_email,
      customer_phone,
      status: paymentIntent.status,
      stripeToken: token.id,
    });
    await newPayment.save();

    // 3. Save Booking (Initially Pending)
    const booking = new Booking({
      transactionId: paymentIntent.id,
      room,
      roomid,
      roomType,
      userid: customer_id,
      fromdate,
      todate,
      totaldays,
      paymentMethod: "Stripe",
      totalamount: paymentIntent.amount / 100,
      status: "pending",
    });
    await booking.save();

    // 4. Add Booking to `currentBookings` (With Status Pending)
    await Room.findOneAndUpdate(
      { _id: roomid },
      { 
        $push: {
          currentBookings: {
            bookingid: booking._id,
            fromdate,
            todate,
            userid: customer_id,
            status: "pending",
          }
        } 
      }
    );

    res.json({
      success: true,
      message: "Payment initiated successfully!",
      charge: {
        pidx: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      },
    });

  } catch (error) {
    console.error("Stripe Charge Error:", error);
    res.status(500).json({ success: false, message: "Payment Failed", error: error.message });
  }
});

router.post("/verify", async (req, res) => {
  console.log("Verify endpoint hit at:", new Date().toISOString());
  try {
    const { pidx, amount, status } = req.body;
    console.log("Stripe verification request received:", req.body);

    if (!pidx) return res.status(400).json({ success: false, message: "Missing payment ID (pidx)" });

    // 1. Find Payment Record
    const payment = await Payment.findOne({ paymentId: pidx });
    if (!payment) {
      console.log("❌ Payment not found!");
      return res.json({ success: false, message: "No payment record found." });
    }

    if (payment.gateway !== "Stripe") {
      return res.json({ success: false, message: "Incorrect payment gateway." });
    }

    // 2. Get Latest Payment Status from Stripe
    const stripePayment = await stripe.paymentIntents.retrieve(pidx);
    const isStatusValid = ["succeeded", "paid"].includes(stripePayment.status);
    const providedAmount = Number(amount);
    const isAmountMatch = Math.abs(payment.amount - providedAmount) < 0.01;

    if (!isAmountMatch || !isStatusValid) {
      console.log("❌ Payment verification failed:", { dbAmount: payment.amount, providedAmount, stripeStatus: stripePayment.status });
      return res.json({ success: false, message: "Payment mismatch" });
    }

    // 3. Update User as a Renter
    await User.updateOne({ _id: payment.customer_id }, { $set: { isRenter: true } });


    // 4. Update Payment Status
    payment.status = "succeeded";
    await payment.save();

    // 5. Update Booking Status to "booked"
    const booking = await Booking.findOneAndUpdate(
      { transactionId: pidx },
      { status: "booked" },
      { new: true }
    );
    if (booking.roomType !== "hotelRoom") {
      await Room.updateOne(
        { _id: booking.roomid },
        { $set: { isAvailable: false } }
      );
    }
    
    

    if (!booking) {
      console.log("❌ Booking not found!");
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    console.log("✅ Booking Updated to 'booked':", booking);

    // 6. Update Room's `currentBookings[].status` from "pending" → "booked"
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: booking.roomid, "currentBookings.bookingid": booking._id },
      { $set: { "currentBookings.$.status": "booked" } },
      { new: true }
    );

    console.log("✅ Room updated successfully:", updatedRoom);

    return res.json({
      success: true,
      message: "Payment verified, booking confirmed",
      booking,
      updatedRoom,
    });

  } catch (error) {
    console.error("🚨 Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



module.exports = router;
