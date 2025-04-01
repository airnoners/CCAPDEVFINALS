const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const authController = require('../controllers/authController');

// Home route
router.get('/', async (req, res) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 }).limit(8);
        res.render('index', {
            title: 'Home',
            categories: [
                { slug: 'textbooks', name: 'Textbooks', icon: '📚', description: 'New and used course materials' },
                { slug: 'clothes', name: 'Clothes', icon: '👕', description: 'Uniforms and merchandise' }
            ],
            listings,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.render('index', { 
            title: 'Home',
            categories: [],
            listings: [],
            user: req.user
        });
    }
});

// Browse page
router.get('/browse', async (req, res) => {
    try {
        const listings = await Listing.find();
        res.render('browse', { 
            title: 'Browse Listings',
            listings,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.render('browse', { 
            title: 'Browse Listings',
            listings: [],
            user: req.user
        });
    }
});

// Product details page
router.get('/product/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id).populate('seller');
        res.render('product-details', { 
            title: listing?.title || 'Product Details',
            listing,
            user: req.user
        });
    } catch (err) {
        console.error(err);
        res.status(404).render('404', { title: 'Product Not Found', user: req.user });
    }
});

// Protected routes
router.get('/profile', authController.requireAuth, (req, res) => {
    res.render('profile', { 
        title: 'My Profile',
        user: req.user
    });
});

router.get('/sell', authController.requireAuth, (req, res) => {
    res.render('sell', { 
        title: 'Sell an Item',
        user: req.user
    });
});

// Auth routes
router.get('/login', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('login', { 
        title: 'Login',
        error: req.flash('error')
    });
});

router.get('/register', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('register', { 
        title: 'Register',
        error: req.flash('error')
    });
});

// Static pages
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us', user: req.user });
});

router.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy', { title: 'Privacy Policy', user: req.user });
});

router.get('/safety-guidelines', (req, res) => {
    res.render('safety-guidelines', { title: 'Safety Guidelines', user: req.user });
});

router.get('/terms-of-service', (req, res) => {
    res.render('terms-of-service', { title: 'Terms of Service', user: req.user });
});

module.exports = router;