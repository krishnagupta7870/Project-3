const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  // PP-size photo URL or path
  ppPhoto: {
    type: String,
    required: true
  },
  // Document type can be Citizenship, Driving License or Passport
  documentType: {
    type: String,
    enum: ['Citizenship', 'Driving License', 'Passport'],
    required: true
  },
  // If document type is Passport, store a single file URL/path
  passportFile: {
    type: String
  },
  // For Citizenship or Driving License, store front and back files
  documentFront: {
    type: String
  },
  documentBack: {
    type: String
  },
  // Optional NIC uploads (front/back)
  nicFront: {
    type: String
  },
  nicBack: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Kyc', kycSchema);
