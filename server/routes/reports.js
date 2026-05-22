const express = require('express');
const router = express.Router();
const moment = require('moment');
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const generateDailyReport = require('../utils/generateDailyReport');
const authMiddleware = require('../middleware/auth-middleware');
const checkSubscription = require('../middleware/subscription-middleware');

router.get('/daily', authMiddleware, checkSubscription, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const dayStart = moment(date).startOf('day').toDate();
    const dayEnd = moment(date).endOf('day').toDate();

    // ── Build query — works with OR without auth ──────────────────────
    const invoiceQuery = { createdAt: { $gte: dayStart, $lte: dayEnd } };
    const productQuery = {};

    // Only filter by user if auth middleware has set req.user
    if (req.user && req.user._id) {
      invoiceQuery.user = req.user._id;
      productQuery.user = req.user._id;
    }

    const invoices = await Invoice.find(invoiceQuery).sort({ createdAt: 1 });
    const allProducts = await Product.find(productQuery);

    const lowStockItems = allProducts
      .filter(p => (parseInt(p.Stock) || 0) <= 10)
      .map(p => ({ ...p.toObject(), lowStockLimit: 10 }));

    // ── Set headers BEFORE any async that could fail ──────────────────
    const dateStr = moment(date).format('YYYY-MM-DD');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sales-report-${dateStr}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');

    await generateDailyReport(res, {
      businessName: process.env.BUSINESS_NAME || 'My Business',
      invoices,
      lowStockItems,
      date,
    });

  } catch (err) {
    console.error('Report generation error:', err.message);
    // Only send JSON error if PDF headers haven't been flushed yet
    if (!res.headersSent) {
      res.status(500).json({ message: err.message });
    }
  }
});

module.exports = router;