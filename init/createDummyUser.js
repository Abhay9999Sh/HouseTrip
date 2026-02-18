if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
}

const mongoose = require("mongoose");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connection successful");
}

const createDummyUser = async() => {
    try {
        // Check if dummy user already exists
        let dummyUser = await User.findOne({ username: "dummyOwner" });
        
        if (!dummyUser) {
            // Create new dummy user
            dummyUser = new User({
                email: "dummy@housetrip.com",
                username: "dummyOwner"
            });
            
            // Register with password
            await User.register(dummyUser, "dummy123");
            console.log("Dummy user created successfully!");
            console.log("Dummy User ID:", dummyUser._id);
        } else {
            console.log("Dummy user already exists!");
            console.log("Dummy User ID:", dummyUser._id);
        }
        
        // Close connection
        await mongoose.connection.close();
        console.log("Database connection closed");
    } catch (err) {
        console.error("Error creating dummy user:", err);
        await mongoose.connection.close();
    }
}

main()
    .then(() => createDummyUser())
    .catch((err) => {
        console.log("Error occurred", err);
    });
