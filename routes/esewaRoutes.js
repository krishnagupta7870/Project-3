const express = require('express');
const crypto = require('crypto');
const EsewaPayment = require('../models/esewaModel'); // Use require for imports

const router = express.Router();

// Environment variables
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;

// Initiate eSewa payment
router.post('/initiate', async (req, res) => {
  const { roomId, amount, productId } = req.body;

  const paymentData = {
    amt: amount,
    psc: 0, // Service charge
    pdc: 0, // Delivery charge
    txAmt: 0, // Tax
    tAmt: amount, // Total
    pid: productId,
    scd: ESEWA_MERCHANT_ID,
    su: process.env.ESEWA_SUCCESS_URL, // e.g., http://yourapp.com/api/esewa/success
    fu: process.env.ESEWA_FAILURE_URL,
  };

  res.json({
    paymentUrl: 'https://uat.esewa.com.np/epay/main', // Test URL
    paymentData,
  });
});

// Handle eSewa success callback
router.post('/success', async (req, res) => {
  const { amt, rid, pid, scd, signature } = req.body;

  // Verify the payment signature
  const data = `amount=${amt}&referenceId=${rid}&productId=${pid}&serviceCode=${scd}`;
  const hash = crypto.createHash('sha256').update(data + ESEWA_SECRET_KEY).digest('hex');

  if (hash === signature) {
    // Save to MongoDB
    const payment = new EsewaPayment({
      roomId: req.body.roomId, // Pass roomId if needed
      amount: amt,
      productId: pid,
      referenceId: rid,
      status: 'Success',
    });
    await payment.save();

    res.redirect(process.env.CLIENT_SUCCESS_URL); // Redirect to frontend success page
  } else {
    res.redirect(process.env.CLIENT_FAILURE_URL);
  }
});

// Handle eSewa failure callback
router.post('/failure', async (req, res) => {
  // Log failure (optional)
  const payment = new EsewaPayment({
    roomId: req.body.roomId,
    amount: req.body.amt,
    productId: req.body.pid,
    status: 'Failure',
  });
  await payment.save();

  res.redirect(process.env.CLIENT_FAILURE_URL);
});

module.exports = router; // Use CommonJS export