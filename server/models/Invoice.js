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
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      item_code: String,
      item: String,
      HSN: String,
      GST: Number,
      price: Number,
      qty: Number,
      discount: Number,
      quantity: Number,
      taxableAmount: Number,
      gstRate: Number,
      gstType: {
        type: String,
        enum: ["INTRA", "INTER"]
      },
      cgst: Number,
      sgst: Number,
      igst: Number,
      totalGST: Number,
      grandTotal: Number
    }
  ],

  subtotal: Number,
  tax: Number,
  total: Number,
  gstSummary: {
    totalTaxableAmount: Number,
    totalGST: Number,
    cgstTotal: Number,
    sgstTotal: Number,
    igstTotal: Number
  },

  date: String,
  time: String,
  phone:Number,
  paymentStatus: {
    type: String,
    enum: ["PAID", "PENDING"],
    default: "PAID"
  },
  paymode: String,
  profit: Number

}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);