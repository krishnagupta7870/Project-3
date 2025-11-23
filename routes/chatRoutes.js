const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// GET: Fetch messages for a room
router.get('/:roomid', async (req, res) => {
  try {
    const messages = await Chat.find({ roomid: req.params.roomid }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Send a message
router.post('/send', async (req, res) => {
  try {
    const { roomid, senderId, senderName, message, receiverId } = req.body;
    const newMessage = new Chat({ roomid, senderId, senderName, message, receiverId });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// (Optional) Additional route if needed
router.get('/byOwnerId', async (req, res) => {
  try {
    const messages = await Chat.find({ roomid: req.params.roomid }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// GET /api/chats/admin
router.get('/admin', async (req, res) => {
  try {
    // Aggregate chat sessions by roomId.
    // Adjust the aggregation pipeline according to your database schema.
    const sessions = await Chat.aggregate([
      {
        $group: {
          _id: "$roomId",
          lastMessage: { $last: "$message" },
          updatedAt: { $last: "$createdAt" },
          senderIds: { $addToSet: "$senderId" }
          // You might join with the Users collection to get a user's name, etc.
        }
      },
      { $sort: { updatedAt: -1 } }
    ]);

    // Optionally, modify the aggregation to include additional information like the user name.
    // For example, using $lookup to populate the user details.
    
    res.status(200).json({ success: true, sessions: sessions.map(session => ({
      roomId: session._id,
      lastMessage: session.lastMessage,
      updatedAt: session.updatedAt,
      // Assuming the roomId has an embedded user id or add additional fields as required.
      userName: "User Name Here" // Replace with actual logic from a lookup if needed.
    })) });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ success: false, error: 'Could not fetch chat sessions' });
  }
});



module.exports = router;
