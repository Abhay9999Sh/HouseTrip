

  // Import necessary modules and models
const Listing = require("./models/listing");
const ExpressError = require("./public/utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review");

// Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path, "", req.originalUrl);
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Save the URL the user tried to access
        req.flash("error", "You must be logged in!");
        return res.redirect("/login"); // Redirect to login if not authenticated
    }
    next(); // Proceed to the next middleware or route handler
};

// Middleware to save the redirect URL if authentication fails
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; // Save redirect URL in res.locals
    }
    next(); // Proceed to the next middleware or route handler
};

// Middleware to check if the user is the owner of a listing
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`); // Redirect if not the owner
    }
    next(); // Proceed to the next middleware or route handler
};

// Middleware for listing validation
module.exports.validateListing = (req, res, next) => {
    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
        req.flash("error", "Please upload at least one image");
        return res.redirect('back'); // Redirect back if no files are uploaded
    }

    // Validate the number of uploaded files
    if (req.files.length > 5) {
        req.flash("error", "You cannot upload more than 5 images.");
        return res.redirect('back'); // Redirect back if more than 5 files are uploaded
    }

    // Add image information to req.body.listing
    req.body.listing.image = req.files.map(file => ({ filename: file.filename, url: file.path }));

    // Validate listing data using schema
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Throw custom error if validation fails
    } else {
        next(); // Proceed to the next middleware or route handler
    }
};
// Middleware for review validation
module.exports.validateReview = (req, res, next) => {
    // Validate review data using schema
    let { error } = reviewSchema.validate(req.body);

    // If validation fails, throw an error
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg); // Throw custom error if validation fails
    } 

    // Check if rating is provided; if not, set default to 5
    if (!req.body.review.rating) {
        req.body.review.rating = 5;
    }

    next(); // Proceed to the next middleware or route handler
};

// Middleware to check if the user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!res.locals.currUser) {
        req.flash("error", "Please log in first!");
        return res.redirect(`/listings`); // Redirect if not logged in
    }
    if (!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`); // Redirect if not the author
    }
    next(); // Proceed to the next middleware or route handler
};
