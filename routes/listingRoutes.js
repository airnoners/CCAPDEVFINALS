const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

// GET all listings (API endpoint)
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().populate('seller', 'fullName');
    res.json(listings);
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    res.status(500).json({ message: "❌ Server error" });
  }
});

// POST create new listing (protected route)
router.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '❌ Not authenticated' });
    }

    const newListing = new Listing({
      ...req.body,
      seller: req.user._id
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    res.status(400).json({ message: "❌ Bad request" });
  }
});

module.exports = router;