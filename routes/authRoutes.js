const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Profile = require('../models/profile');
const authController = require('../controllers/authController');


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