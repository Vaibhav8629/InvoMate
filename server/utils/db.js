const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const URI = process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log('Database connection successful');
    }
    catch (error) {
        console.log("Database connection Failed");
        process.exit(0);
    }
}

module.exports = connectDB;