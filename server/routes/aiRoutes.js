const express = require("express");

const {
  getAIInsights,
  getImprovementPlan,
} = require("../controllers/aiController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// Existing AI insights endpoint
router.get(
  "/insights",
  getAIInsights
);

// New personalized improvement plan
router.get(
  "/improvement-plan",
  getImprovementPlan
);

module.exports = router;