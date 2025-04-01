const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Profile = require('../models/profile');

// Middleware to require authentication
exports.requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.returnTo = req.originalUrl;
    res.redirect('/login');
};

// Register user
exports.register = async (req, res, next) => {
  try {
    const { fullName, dlsuEmail, studentId, password } = req.body;

    // 🔍 Log the raw password received from the frontend
    console.log('🟢 Received password from frontend:', password);

    if (!fullName || !dlsuEmail || !studentId || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
    }

    const existingUser = await User.findOne({ $or: [{ dlsuEmail }, { studentId }] });
    if (existingUser) {
      req.flash('error', 'Email or Student ID already exists');
      return res.redirect('/register');
    }

    const newUser = new User({ fullName, dlsuEmail, studentId, password });
    await newUser.save();
    await Profile.create({ dlsuEmail });

    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash('success_msg', 'Registration successful! Welcome to Archers Market.');
      res.redirect('/');
    });

  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed');
    res.redirect('/register');
  }
};


// Login user
exports.login = (req, res, next) => {
  console.log('✅ /api/auth/login was hit');
  console.log('📦 Request body:', req.body);
  
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // If it's an AJAX login from modal (JSON response)
      return res.status(401).json({ message: info.message || 'Login failed' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }

      // If logged in from modal (JS fetch), return the user as JSON
      return res.status(200).json({ user });
    });
  })(req, res, next);
};

// Logout user
exports.logout = (req, res) => {
    req.logout();
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/');
};

// Get current user status
exports.getStatus = (req, res) => {
    res.json({ user: req.user || null });
};