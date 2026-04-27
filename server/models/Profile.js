const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({

    ShopName: {
        type: String,
        required: true,
    },

    GSTNumber: {
        type: String,
        required: true,
    },

    Address: {
        type: String,
        required: true,
    },

    Phone: {
        type: String,
        required: true,
    },

    Email: {
        type: String,
        required: true,
    },

    Pincode: {
        type: String,
        required: true,
    },

    ShopCode: {
        type: String,
        required: true,
    },

    // DigitalStamp: {
    //     type: String,
    //     required: true,
    // },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const Profile = new mongoose.model("Profile", profileSchema);
module.exports = Profile;