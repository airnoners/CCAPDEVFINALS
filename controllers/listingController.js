const Listing = require('../models/listing');

const getListings = async (req, res) => {
    try {
      const listings = await Listing.find().sort({ createdAt: -1 });
      res.render("browse", { listings });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  };

const getListingById = async (req, res) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).render("error", { message: "Listing not found" });
      }
      res.render("product-details", { listing });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  };
  exports.createListing = async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  
      const { title, description, price, category, condition } = req.body;
      const images = req.files?.map(file => file.path) || [];
  
      const listing = new Listing({
        title,
        description,
        price,
        category,
        condition,
        images,
        seller: req.user._id
      });
  
      await listing.save();
      res.status(201).redirect("/browse");
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: err.message });
    }
  };
  

const deleteListing = async (req, res) => {
    try {
      const listing = await Listing.findByIdAndDelete(req.params.id);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      res.status(200).redirect("/browse");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  };

module.exports = {
    getListings,
    getListingById,
    createListing,
    deleteListing,
};
