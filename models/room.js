const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    name: { type: String, required: true },
    roomtype: { type: String, required: true},
    address: { type: String, required: true },
    awayFromHighway: { type: String },
    features: { type: [String], default: [] },
    price: { type: Number, required: true },
    currentBookings: [ {
        bookingid: String, 
        fromdate: String,
        todate: String,
        userid: String,
        status: String,
      },
    ],
    description: { type: String, required: true },
    ownerId: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    latitude: { type: Number, required: true }, 
    longitude: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
}, {
    timestamps: true,
});

const roomModel = mongoose.model('room', roomSchema);

module.exports = roomModel;
