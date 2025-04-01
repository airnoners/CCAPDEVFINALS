const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

// Register
router.post('/register', [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('dlsuEmail').isEmail().withMessage('Invalid email format'),
  body('studentId').matches(/^\d{8}$/).withMessage('Student ID must be 8 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('password').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  body('password').matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullName, dlsuEmail, studentId, password } = req.body;
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
const authController = require('../controllers/authController');
router.post('/login', authController.login);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({ user: req.isAuthenticated() ? req.user : null });
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// Can use this to make sure a certain route is protected just changed /protected to /whichever route you want to protect
router.get('/protected', ensureAuthenticated, (req, res) => {
  res.json({ message: 'You have accessed a protected route' });
});

module.exports = router;
