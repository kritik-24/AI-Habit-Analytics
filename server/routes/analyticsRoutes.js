const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getHabitStreak,
  getHabitCompletionPercentage,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getHabitPerformanceAnalytics,
} = require("../controllers/analyticsController");

// Protect all analytics routes
router.use(protect);

// GET HABIT STREAK
// GET /api/analytics/habits/:id/streak
router.get("/habits/:id/streak", getHabitStreak);

// GET HABIT COMPLETION PERCENTAGE
// GET /api/analytics/habits/:id/completion
router.get(
  "/habits/:id/completion",
  getHabitCompletionPercentage
);

// GET WEEKLY ANALYTICS
// GET /api/analytics/weekly
router.get("/weekly", getWeeklyAnalytics);

// GET MONTHLY ANALYTICS
// GET /api/analytics/monthly
router.get("/monthly", getMonthlyAnalytics);
// GET HABIT PERFORMANCE ANALYTICS
// GET /api/analytics/performance
router.get("/performance", getHabitPerformanceAnalytics);


module.exports = router;