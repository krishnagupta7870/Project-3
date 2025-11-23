// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Room = require('../models/room');
const User = require('../models/user');
const Booking = require('../models/booking'); // hypothetical bookings model
const authMiddleware = require('../authMiddleware'); // ensure user is logged in

// POST /api/reviews
// POST /api/reviews
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomid, rating, comment } = req.body;
    const userid = req.user._id;

    if (!roomid || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingBooking = await Booking.findOne({ roomid, userid });
    if (!existingBooking) {
      return res.status(403).json({ message: 'You can only review rooms you have booked.' });
    }

    const existingReview = await Review.findOne({ room: roomid, user: userid });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this room.' });
    }

    const newReview = new Review({
      room: roomid,
      user: userid,
      rating,
      comment,
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review.' });
  }
});

// GET /api/reviews/:roomid
router.get('/:roomid', async (req, res) => {
    try {
      const {roomid} = req.params;
    
      // Populate user if you want to display user info (like name, country, etc.)
      const reviews = await Review.find({ room: roomid })
      .populate('user', 'name _id')
        .sort({ createdAt: -1 }); // newest first
      

  
      res.json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch reviews.' });
    } 
  });
// PUT /api/reviews/:reviewId
router.put('/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Find the review that belongs to this user
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or you are not authorized to edit it.' });
    }

    // Update review fields
    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.status(200).json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review.' });
  }
});

  
  // GET /api/rooms/:roomid/average-rating
router.get('/:roomid/average-rating', async (req, res) => {
    try {
      const { roomid } = req.params;
      const reviews = await Review.find({ room: roomid });
      if (reviews.length === 0) {
        return res.json({ averageRating: 0, numberOfReviews: 0 });
      }
  
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const avg = sum / reviews.length;
  
      res.json({
        averageRating: parseFloat(avg.toFixed(1)),
        numberOfReviews: reviews.length
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch average rating.' });
    }
  });
  

module.exports = router;
