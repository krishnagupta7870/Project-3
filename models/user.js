const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isOwner: { type: Boolean, default: false },
    isRenter: { type: Boolean, default: false },
    savedRooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }]
}, {
    timestamps: true
});

const User = mongoose.models.Users || mongoose.model('Users', userSchema);
module.exports = User;

