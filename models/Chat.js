const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  roomid: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  receiverId: { 
    type: String, 
    required: function() { return this.senderId !== this.ownerId; } // Required only if sender is not owner
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
