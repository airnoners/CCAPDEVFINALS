const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const authController = require('../controllers/authController');
const Profile = require('../models/profile');

// Home route
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).limit(8);
    res.render('index', {
      title: 'Home',
      categories: [
        { slug: 'textbooks', name: 'Textbooks', icon: '📚', description: 'New and used course materials' },
        { slug: 'clothes', name: 'Clothes', icon: '👕', description: 'Clothes and other school merchandise' },
        { slug: 'supplies', name: 'School Supplies', icon: '🔧', description: 'Calculators, drawing sets & more' },
        { slug: 'electronics', name: 'Electronics', icon: '💻', description: 'Laptops, tablets & accessories' },
        { slug: 'others', name: 'Others', icon: '🚀', description: 'Everything else you need' }
      ],
      listings,
    });
  } catch (err) {
    console.error(err);
    res.render('index', {
      title: 'Home',
      categories: [],
      listings: [],
    });
  }
});

// Browse page
router.get('/browse', async (req, res) => {
  try {
    const listings = await Listing.find(); // Fetch data from MongoDB
    res.render('browse', { title: 'Browse Listings', listings });
    console.log('Listings:', listings); //for debugging
  } catch (err) {
    console.error(err);
    res.render('browse', { title: 'Browse Listings', listings: [] });
  }
});

// Product details page
router.get('/product/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller');
    res.render('product-details', {
      title: listing?.title || 'Product Details',
      listing,
    });
  } catch (err) {
    console.error(err);
    res.status(404).render('404', {
      title: 'Product Not Found',
    });
  }
});

// Protected routes
router.get('/profile', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');
  
    const profile = await Profile.findOne({ dlsuEmail: req.user.dlsuEmail });
    const listings = await Listing.find({ seller: req.user._id });
  
    if (profile?.profileImage) {
      req.user.profileImage = profile.profileImage.trim();
    }
  
    res.render('profile', {
      user: req.user,
      profile,
      listings
    });
  });
router.get('/sell', authController.requireAuth, (req, res) => {
    res.render('sell', {
      title: 'Sell an Item',
      success: req.query.success === 'true'
    });
  });
  

// Auth routes
router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('login', {
    title: 'Login',
    error: req.flash('error'),
  });
});

router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('register', {
    title: 'Register',
    error: req.flash('error'),
  });
});

// Static pages
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

router.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { title: 'Privacy Policy' });
});

router.get('/safety-guidelines', (req, res) => {
  res.render('safety-guidelines', { title: 'Safety Guidelines' });
});

router.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', { title: 'Terms of Service' });
});

module.exports = router;
