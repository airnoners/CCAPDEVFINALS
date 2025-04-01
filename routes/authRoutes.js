const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, dlsuEmail, studentId, password, confirmPassword } = req.body;
    
    // Validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ $or: [{ dlsuEmail }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or Student ID already exists' });
    }

    const newUser = new User({ fullName, dlsuEmail, studentId, password });
    await newUser.save();
    
    // Auto-login after register
    req.login(newUser, err => {
      if (err) throw err;
      res.json({ user: newUser });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ user: req.user });
});

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