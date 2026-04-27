const express = require("express");

const router = express.Router();

const { getAIDashboardAnalytics } = require("../controllers/aiDashboardController");

const authMiddleware = require("../middleware/auth-middleware");

router.get(
  "/dashboard-analytics",
  authMiddleware,
  getAIDashboardAnalytics
);

module.exports = router;