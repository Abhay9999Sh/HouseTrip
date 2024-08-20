const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../public/utils/wrapAsync.js");
const ExpressError = require("../public/utils/ExpressError.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { validateReview, isReviewAuthor, isLoggedIn } = require("../middleware.js");

const reviewController = require("../controllers/review.js");

//reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));


//delete reviews
router.delete("/:reviewId", isReviewAuthor, wrapAsync(reviewController.destroyReview));



module.exports = router;