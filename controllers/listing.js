const Listing = require("../models/listing.js");
const { getCoordinates }= require("../public/js/map.js");


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings, layout: 'boilerplate'});
};

module.exports.renderNewForm = (req, res) => {
    console.log(req.user);
    if(!req.isAuthenticated()) {
        req.flash("error", "you must be Logged in to create Listing");
        return res.redirect("/login");
    }
    res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
                             .populate({
                                path: "reviews",
                                populate: {path: "author"},
                             })
                             .populate("owner");
    if(!listing) {
       req.flash("error", "Listing you requested for does not exist!");
       return res.redirect("/listings");
    }
    res.render("./listings/show.ejs", {listing});
};

module.exports.createListing = async(req,res) => {
   
    const newListing  = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    // newListing.image = {url, filename};
    if (req.files && req.files.length > 0) {
        newListing.image = req.files.map(file => ({ url: file.path, filename: file.filename }));
    } else {
        req.flash("error", "Please upload at least one image");
        return res.redirect('back');
    }

    const address = `${req.body.listing.location}`;
    const coordinates = await getCoordinates(address);
    if (coordinates) {
        newListing.geometry = {
            type: 'Point',    // Set geometry type to 'Point'
            coordinates: [parseFloat(coordinates.lon), parseFloat(coordinates.lat)] // [longitude, latitude]
        };
    } else {
        console.error('Failed to get coordinates.');
        // Optionally handle the case where coordinates could not be retrieved
        newListing.geometry = {
            type: 'Point', // Default value
            coordinates: [null, null] // Or handle as needed
        };
    }

    let savedListing =  await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
     req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }

    let originalImageUrls = listing.image.map(image => {
        return image.url.replace("/upload", "/upload/h_250,w_250");
    });
    console.log(originalImageUrls);
    res.render("./listings/edit.ejs", {listing, originalImageUrls});
};

module.exports.updateListing = async(req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
    if (req.files && req.files.length > 0) {
      let images = req.files.map(file => ({ url: file.path, filename: file.filename }));
      listing.image = images;
      await listing.save();
    } else {
      req.flash("error", "Please upload at least one image");
      return res.redirect('back');
    }
  
    req.flash("success", "Listing Updated!");
    res.redirect("/listings");
  }

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    
    try {
        let deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }

        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error deleting listing:", err);
        req.flash("error", "Failed to delete listing.");
        res.redirect("/listings");
    }
};


module.exports.filterByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        // Fetch listings that match the specified category
        const filteredListings = await Listing.find({ category: category });
        
        // Render the filtered listings page
        res.render("./listings/filter.ejs", {
            filteredListings,
            filterCategory: category,
            layout: 'boilerplate' // Add this line if you're using a layout
        });
    } catch (err) {
        console.error("Error fetching filtered listings:", err);
        req.flash("error", "Failed to fetch filtered listings.");
        res.redirect("/listings");
    }
};

module.exports.searchListing =  async (req, res) => {
    const query = req.query.query;
  
    try {
        // Find listings that match the search query
        const listings = await Listing.find({
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Search by title
                { location: { $regex: query, $options: 'i' } } // Search by location
            ]
        });
  
        // Render search results page with listings
        res.render('./listings/searchResults', { listings });
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while searching.');
        res.redirect('/listings');
    }
};