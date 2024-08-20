
const express = require("express");
const router = express.Router();
const wrapAsync = require("../public/utils/wrapAsync.js");
const ExpressError = require("../public/utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ 
    storage,
    limits: {
        fileSize: 3 * 1024 * 1024 // 5 MB
    }
});

const listingController = require("../controllers/listing.js");

// Routes for listing operations
router.route("/")
    .get(wrapAsync(listingController.index)) // Get all listings
    .post(
        isLoggedIn,  // Ensure user is logged in
        upload.array('listing[image][]', 5), // Upload up to 5 images
        validateListing, // Validate listing data
        wrapAsync(listingController.createListing) // Create new listing
    );

// Route to render the form for creating a new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Route for searching listings
router.get("/search", listingController.searchListing);

// Routes for individual listing operations
router.route("/:id")
    .get(wrapAsync(listingController.showListing)) // Show details of a specific listing
    .put(
        isLoggedIn,  
        isOwner,
        upload.array('listing[image][]', 5), 
        validateListing,
        wrapAsync(listingController.updateListing) // Update the listing
    )
    .delete(
        isLoggedIn,  // Ensure user is logged in
        isOwner, // Ensure user is the owner
        wrapAsync(listingController.deleteListing) // Delete the listing
    );

// Route to render the form for editing a listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Route to filter listings by category
router.get("/category/:category", wrapAsync(listingController.filterByCategory));

module.exports = router;
