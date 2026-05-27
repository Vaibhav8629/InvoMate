const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { computeInvoiceGST } = require("../services/gstService");
const { resolveInvoicePaymentDetails } = require("../utils/invoicePayment");

const buildInvoiceSnapshot = async (req, items, existingInvoice = null) => {
  const incomingItems = Array.isArray(items) ? items : [];
  const productIds = incomingItems
    .map((item) => item?.productId || item?._id)
    .filter((id) => id && mongoose.Types.ObjectId.isValid(id));
  const itemCodes = incomingItems
    .map((item) => item?.item_code)
    .filter(Boolean);

  const products = await Product.find({
    user: req.user._id,
    $or: [
      { _id: { $in: productIds } },
      { item_code: { $in: itemCodes } }
    ]
  });

  const gstSnapshot = computeInvoiceGST({
    items: incomingItems
  }, products);

  return gstSnapshot;
};

const saveInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      shopName,
      shopAddress,
      shopGST,
      items,
      subtotal,
      tax,
      total,
      date, 
      time,
      phone,
      paymentStatus,
      paymode,
      profit,
      templateId = "classic"
    } = req.body;
    const gstSnapshot = await buildInvoiceSnapshot(req, items);
    const paymentDetails = resolveInvoicePaymentDetails({ paymentStatus, paymode });

    const invoice = await Invoice.create({
      user: req.user.id,   
      invoiceNumber,
      customerName,
      shopName,
      shopAddress,
      shopGST,
      templateId,
      items: gstSnapshot.items,
      subtotal,
      tax: gstSnapshot.gstSummary.totalGST || tax,
      total,
      gstSummary: gstSnapshot.gstSummary,
      date, 
      time,
      phone,
      paymentStatus: paymentDetails.paymentStatus,
      paymode: paymentDetails.paymode,
      profit
    });

    // Create notification for invoice creation
    const notificationService = req.app.get("notificationService");
    if (notificationService) {
      await notificationService.createInvoiceNotification(
        req.user.id,
        invoiceNumber,
        invoice._id
      );
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const existingInvoice = await Invoice.findOne({ _id: invoiceId, user: req.user._id });

    if (!existingInvoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const {
      invoiceNumber,
      customerName,
      shopName,
      shopAddress,
      shopGST,
      items,
      subtotal,
      tax,
      total,
      date,
      time,
      phone,
      paymentStatus,
      paymode,
      profit,
      templateId = existingInvoice.templateId || "classic"
    } = req.body;

    const gstSnapshot = await buildInvoiceSnapshot(req, items || existingInvoice.items, existingInvoice);
    const paymentDetails = resolveInvoicePaymentDetails({
      paymentStatus,
      paymode,
      existingInvoice,
    });

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        invoiceNumber,
        customerName,
        shopName,
        shopAddress,
        shopGST,
        templateId,
        items: gstSnapshot.items,
        subtotal,
        tax: gstSnapshot.gstSummary.totalGST || tax,
        total,
        gstSummary: gstSnapshot.gstSummary,
        date,
        time,
        phone,
        paymentStatus: paymentDetails.paymentStatus,
        paymode: paymentDetails.paymode,
        profit
      },
      { new: true }
    );

    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};



const getInvoices = async (req, res) => {
    const userData = req.user;
    try {
    const limit = Number.parseInt(req.query.limit, 10);

    let query = Invoice.find({
      user: userData._id
    }).sort({ createdAt: -1 });

    if (Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const invoices = await query;

        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ msg: "Error fetching products" });
    }
}


const getInvoiceById = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const deletedInvoice = await Invoice.findOneAndDelete({
      _id: invoiceId,
      user: req.user._id,
    });

    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { saveInvoice, updateInvoice, getInvoices, getInvoiceById, deleteInvoice };