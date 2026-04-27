const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    item_code: {
        type: String,
        required: true,
    },

    HSN: {
        type: String,
        required: true,
    },

    item: {
        type: String,
        required: true,
    },

    profit: {
        type: String,
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    GST: {
        type: String,
        required: true,
    },

    Stock: {
        type: String,
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

const Product = new mongoose.model("Product", productSchema);
module.exports = Product;