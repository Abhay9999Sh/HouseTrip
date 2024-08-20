

// Load environment variables in non-production environments
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config(); // For credentials protection
}

// Import necessary modules
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ExpressError = require("./public/utils/ExpressError.js");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");

// Import route handlers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Initialize express app
const app = express();

// Middleware setup
app.use(methodOverride("_method")); // Allows overriding HTTP methods
app.engine('ejs', ejsMate); // Use ejs-mate for templating
app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.set("views", path.join(__dirname, "views")); // Set views directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

const dbUrl = process.env.ATLASDB_URL;


main()
    .then(() => console.log("Connection successful"))
    .catch(err => console.log("Error occurred", err));


// Database connection
async function main() {
    await mongoose.connect(dbUrl);
};


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("Error in Mongo Session Store", err);
});


// Session configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Cookie expiration
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie max age
        httpOnly: true // Prevent client-side JavaScript from accessing the cookie
    }
};



app.use(session(sessionOptions));
app.use(flash()); // Middleware for flash messages

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); // Use LocalStrategy for authentication
passport.serializeUser(User.serializeUser()); // Serialize user
passport.deserializeUser(User.deserializeUser()); // Deserialize user

// Middleware for setting flash messages and current user in res.locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings", listingRouter); // Routes for listings
app.use("/listings/:id/review", reviewRouter); // Routes for reviews
app.use("/", userRouter); // Routes for users

// Search route
app.get('/search', async (req, res) => {
    const query = req.query.query;

    try {
        // Search for listings that match the query
        const listings = await Listing.find({
            $or: [
                { title: { $regex: query, $options: 'i' } }, // Search by title
                { location: { $regex: query, $options: 'i' } } // Search by location
            ]
        });

        // Render search results
        res.render('./listings/searchResults', { listings });
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while searching.');
        res.redirect('/listings'); // Redirect on error
    }
});

// Error handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err; // Default to 500 and generic message
    res.status(statusCode).render("./listings/error.ejs", { message });
});

// Start server
app.listen(8020, () => {
    console.log(`App is listening on port 8020`);
});
