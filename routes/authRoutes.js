const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
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
      listings: [] // you can populate this later
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;