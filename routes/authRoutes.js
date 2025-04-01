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

module.exports = router;