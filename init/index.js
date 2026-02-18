if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
}

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const initData = require("./data.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
};

main()
 .then((res) => {
    console.log("connection succesful");
 })
 .catch((err) => {
    console.log("error is occuring", err);
});

const initDb = async() => {
    try {
        // Find or create dummy owner
        let dummyOwner = await User.findOne({ username: "dummyOwner" });
        
        if (!dummyOwner) {
            console.log("Creating dummy owner...");
            dummyOwner = new User({
                email: "dummy@housetrip.com",
                username: "dummyOwner"
            });
            await User.register(dummyOwner, "dummy123");
            console.log("Dummy owner created!");
        }
        
        console.log("Using owner ID:", dummyOwner._id);
        
        // Delete existing listings
        await Listing.deleteMany({});
        console.log("Existing listings deleted");
        
        // Map listings with dummy owner
        initData.data = initData.data.map((obj) => ({
            ...obj,
            owner: dummyOwner._id
        }));
       
        // Insert listings
        const data = await Listing.insertMany(initData.data);
        console.log("data was initialized");
        console.log(`${data.length} listings were added to the database`);
        
        // Close the connection after initialization
        await mongoose.connection.close();
        console.log("Database connection closed");
    } catch (err) {
        console.error("Error initializing database:", err);
        await mongoose.connection.close();
    }
}

initDb();

