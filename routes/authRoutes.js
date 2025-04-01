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
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out' });
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({ user: req.user || null });
});

module.exports = router;