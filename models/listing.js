const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: [
      {
          filename: String,
          url: String,

      }
  ],
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry:{ 
      type: {
        type: String, 
        enum: ['Point'], // 'location.type' must be 'Point'
        
      },
      coordinates: {
        type: [Number],
        
      }
    },
    category: {  // Added category field for filtering
      type: String,  
      enum: ["trending", "iconic-cities", "mountains", "castles", "amazing-pools", "camping", "farms", "arctic", "domes", "boats"], 
  }
});

//mongoose middleware -> to delete reviews of that listing from db when we delete a listing
listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
      await Review.deleteMany({_id: {$in: listing.reviews}});
    }
   });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;