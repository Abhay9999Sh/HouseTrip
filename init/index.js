const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");
const path = require("path");

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/housetrip');
};

main()
 .then((res) => {
    console.log("connection succesful");
 })
 .catch((err) => {
    console.log("error is occuring", err);
});

const initDb = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "66ab89c800a3d8d2ac688d00"
    }));
   
    const data = await Listing.insertMany(initData.data);//we want first insert then console is printed
    console.log("data was initialized");
    
}

initDb();

