

const Joi = require('joi'); // Import Joi for server-side validation

// Schema for validating listing data
module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(), 
        description: Joi.string().required(), 
        location: Joi.string().required(), // Location of the listing, required and must be a string
        country: Joi.string().required(), 
        price: Joi.number().required().min(0), 
        image: Joi.array().items( // Array of images
            Joi.object({
                filename: Joi.string().required(), // Image filename, required and must be a string
                url: Joi.string().uri().required() // Image URL, required and must be a valid URI
            })
        ).required() // The image array itself is required
    }).required() // The 'listing' object is required
});

// Schema for validating review data
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(), 
        comment: Joi.string().required(),
    }).required() 
});
