const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Profile = require('../models/profile');
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/profile-pictures');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

//Upload Profile Picture
router.post('/profile/update', upload.single('profileImage'), async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not logged in' });

  try {
    const update = {};

    // Update full name in the User collection
    if (req.body.fullName && req.body.fullName.trim() !== '') {
      await User.findByIdAndUpdate(req.user._id, { fullName: req.body.fullName.trim() });
    }

    if (req.body.contactNumber) update.contactNumber = req.body.contactNumber;
    if (req.body.facebook) update.facebook = req.body.facebook;

    if (req.body.bio !== undefined) {
      const existingProfile = await Profile.findOne({ dlsuEmail: req.user.dlsuEmail });
      update.bio = req.body.bio.trim() === '' ? existingProfile?.bio || '' : req.body.bio;
    }

    if (req.file) {
      update.profileImage = '/uploads/profile-pictures/' + req.file.filename;
    }

    await Profile.findOneAndUpdate(
      { dlsuEmail: req.user.dlsuEmail },
      update,
      { new: true, upsert: true }
    );

    res.json({ message: 'Profile updated!' });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);


// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/');
  });
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({ user: req.user || null });
});



// GET /api/auth/profile/data
router.get('/profile/data', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  try {
    const profile = await Profile.findOne({ dlsuEmail: req.user.dlsuEmail });

    res.json({
      fullName: req.user.fullName,
      studentId: req.user.studentId,
      dlsuEmail: req.user.dlsuEmail,
      profileImage: profile?.profileImage || '',
      contactNumber: profile?.contactNumber || '',
      facebook: profile?.facebook || '',
      bio: profile?.bio || ' ',
      listings: [] // you can populate this later
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/profile/update', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { contactNumber, facebook, profileImage, bio } = req.body;

    await Profile.findOneAndUpdate(
      { dlsuEmail: req.user.dlsuEmail }, // Find by linked email
      {
        contactNumber,
        facebook,
        profileImage,
        bio
      },
      { new: true, upsert: true } // create if doesn't exist
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;