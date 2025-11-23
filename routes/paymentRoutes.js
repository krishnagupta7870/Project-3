const express = require("express");
const axios = require("axios");
const Payment = require("../models/Payment");
const Booking = require("../models/booking");
const Room = require("../models/room"); // Import Room model
const router = express.Router();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

// ✅ Route to initiate payment (save currentBookings)
router.post("/initiate", async (req, res) => {
  const {
    amount,
    purchase_order_id,
    purchase_order_name,
    return_url,
    customer_name,
    customer_email,
    customer_phone,
    customer_id,
    room,
    fromdate,
    todate,
    roomid,
    roomType,
    totaldays
  } = req.body;

  if (!amount || !purchase_order_id || !return_url || !customer_id || !roomid || !room ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 🟢 Step 1: Initiate payment request to Khalti
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/initiate/",
      {
        return_url,
        website_url: "https://yourplatform.com",
        amount,
        purchase_order_id,
        purchase_order_name,
        customer_info: { name: customer_name, email: customer_email, phone: customer_phone },
      },
      { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
    );

    const pidx = response.data.pidx; // Khalti payment ID

    // 🟢 Step 2: Save Payment Record (Pending)
    const payment = new Payment({
      paymentId: pidx,
      gateway: "Khalti",
      customer_id,
      room_id: roomid,
      amount,
      customer_name,
      customer_email,
      customer_phone,
      status: "Pending",
    });
    await payment.save();

    // 🟢 Step 3: Save Booking Record (Pending)
    const booking = new Booking({
      transactionId: pidx,
      room,
      roomid,
      roomType,
      userid: customer_id,
      fromdate,
      todate,
      totaldays,
      paymentMethod: "Khalti",
      totalamount: amount,
      status: "pending", // Default status
    });
    await booking.save();

    // 🟢 Step 4: Save in Room's `currentBookings`
    await Room.findOneAndUpdate(
      { _id: roomid },
      {
        $addToSet: {
          currentBookings: {
            bookingid: booking._id,
            fromdate,
            todate,
            userid: customer_id,
            status: "pending", // Initial status
          },
        },
      }
    );

    // ✅ Return payment URL
    res.status(200).json({ payment_url: response.data.payment_url });
  } catch (error) {
    console.error("Error initiating Khalti payment:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// ✅ Route to verify payment (update status)
router.post("/verify", async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) return res.status(400).json({ error: "Missing payment ID (pidx)" });

    // 🟢 Step 1: Verify payment with Khalti
    const khaltiResponse = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
    );

    if (khaltiResponse.data.status !== "Completed") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // 🟢 Step 2: Update Payment Record
    await Payment.findOneAndUpdate({ paymentId: pidx }, { status: "Completed" });

    // 🟢 Step 3: Update Booking Status
    const booking = await Booking.findOneAndUpdate(
      { transactionId: pidx },
      { status: "booked", totalamount: khaltiResponse.data.total_amount },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // 🟢 Step 4: Update `currentBookings` in Room Model
    await Room.findOneAndUpdate(
      { _id: booking.roomid, "currentBookings.bookingid": booking._id },
      { $set: { "currentBookings.$.status": "booked" } }
    );

    // 🟢 Step 5: If not hotelRoom, mark isAvailable as false
    if (booking.roomType !== "hotelRoom") {
      await Room.updateOne(
        { _id: booking.roomid },
        { $set: { isAvailable: false } }
      );
    }

    return res.json({
      success: true,
      message: "Payment verified and booking updated",
      booking,
    });

  } catch (error) {
    console.error("Error verifying payment:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
});


router.get('/getallpayments', async (req, res) => {
  try {
    const payments = await Payment.find({});
    res.send(payments);
  } catch (error) {
    return res.status(400).json({ error })
  }
})

module.exports = router;
