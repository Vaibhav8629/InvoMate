const Invoice = require("../models/Invoice");

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
      paymode,
      profit
    } = req.body;

    const invoice = await Invoice.create({
      user: req.user.id,   
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
      paymode,
      profit
    });

    res.status(200).json(invoice);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};



const getInvoices = async (req, res) => {
    const userData = req.user;
    try {
        const invoices = await Invoice.find({
            user: userData._id
        });

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

module.exports = { saveInvoice, getInvoices, getInvoiceById };