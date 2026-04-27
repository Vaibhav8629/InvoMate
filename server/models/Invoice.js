const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  invoiceNumber: String,

  customerName: String,

  shopName: String,
  shopAddress: String,
  shopGST: String,

  items: [
    {
      item_code: String,
      item: String,
      HSN: String,
      GST: Number,
      price: Number,
      qty: Number,
      discount: Number
    }
  ],

  subtotal: Number,
  tax: Number,
  total: Number,

  date: String,
  time: String,
  phone:Number,
  paymode: String,
  profit: Number

}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);