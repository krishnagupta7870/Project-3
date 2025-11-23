const express = require('express');
const router = express.Router();
const multer = require('multer');
const Kyc = require('../models/kyc'); // Updated KYC model
const User = require('../models/user');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc-documents/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Submit KYC data using multiple file fields
router.post('/submit', upload.fields([
  { name: 'ppPhoto', maxCount: 1 },
  { name: 'passportFile', maxCount: 1 },
  { name: 'documentFront', maxCount: 1 },
  { name: 'documentBack', maxCount: 1 },
  { name: 'nicFront', maxCount: 1 },
  { name: 'nicBack', maxCount: 1 },
]), async (req, res) => {
  try {
    const { userId, firstName, lastName, address, phoneNumber, documentType } = req.body;
    
    // Retrieve file paths from req.files
    const ppPhotoPath = req.files.ppPhoto ? req.files.ppPhoto[0].path : null;
    let passportFilePath = null, documentFrontPath = null, documentBackPath = null;
    
    if (documentType === 'Passport') {
      passportFilePath = req.files.passportFile ? req.files.passportFile[0].path : null;
    } else {
      documentFrontPath = req.files.documentFront ? req.files.documentFront[0].path : null;
      documentBackPath = req.files.documentBack ? req.files.documentBack[0].path : null;
    }
    
    const nicFrontPath = req.files.nicFront ? req.files.nicFront[0].path : null;
    const nicBackPath = req.files.nicBack ? req.files.nicBack[0].path : null;
    
    // Check if a KYC record already exists for this user
    let kycRecord = await Kyc.findOne({ userId });
    if (kycRecord) {
      // Update the existing record
      kycRecord.firstName = firstName;
      kycRecord.lastName = lastName;
      kycRecord.address = address;
      kycRecord.phoneNumber = phoneNumber;
      kycRecord.documentType = documentType;
      kycRecord.ppPhoto = ppPhotoPath;
      if (documentType === 'Passport') {
        kycRecord.passportFile = passportFilePath;
        kycRecord.documentFront = undefined;
        kycRecord.documentBack = undefined;
      } else {
        kycRecord.documentFront = documentFrontPath;
        kycRecord.documentBack = documentBackPath;
        kycRecord.passportFile = undefined;
      }
      if (nicFrontPath) kycRecord.nicFront = nicFrontPath;
      if (nicBackPath) kycRecord.nicBack = nicBackPath;
      kycRecord.status = 'pending';
      kycRecord.updatedAt = Date.now();
    } else {
      // Create a new KYC record
      kycRecord = new Kyc({
        userId,
        firstName,
        lastName,
        address,
        phoneNumber,
        documentType,
        ppPhoto: ppPhotoPath,
        status: 'pending'
      });
      if (documentType === 'Passport') {
        kycRecord.passportFile = passportFilePath;
      } else {
        kycRecord.documentFront = documentFrontPath;
        kycRecord.documentBack = documentBackPath;
      }
      if (nicFrontPath) kycRecord.nicFront = nicFrontPath;
      if (nicBackPath) kycRecord.nicBack = nicBackPath;
    }
    
    await kycRecord.save();
    res.status(200).json({ message: 'KYC submitted successfully', status: kycRecord.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Check KYC status
router.get('/status', async (req, res) => {
  try {
    const { userId } = req.query;
    const kycRecord = await Kyc.findOne({ userId });
    if (kycRecord) {
      res.status(200).json({ status: kycRecord.status });
    } else {
      res.status(404).json({ error: 'KYC record not found' });
    }
  } catch (error) {
    console.error('Error checking KYC status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all KYC records
router.get('/getallkyc', async (req, res) => {
  try {
    const kyc = await Kyc.find({});
    res.send(kyc);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Approve KYC endpoint
router.post('/approve', async (req, res) => {
  const { requestId } = req.body;
  try {
    const kycRequest = await Kyc.findById(requestId);
    if (!kycRequest) {
      return res.status(404).json({ message: 'KYC request not found' });
    }
    kycRequest.status = 'approved';
    await kycRequest.save();
    // Update the user's record to set isOwner to true
    await User.findByIdAndUpdate(kycRequest.userId, { isOwner: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject KYC endpoint
router.post('/reject', async (req, res) => {
  const { requestId } = req.body;
  try {
    const kycRequest = await Kyc.findById(requestId);
    if (!kycRequest) {
      return res.status(404).json({ message: 'KYC request not found' });
    }
    kycRequest.status = 'rejected';
    await kycRequest.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
