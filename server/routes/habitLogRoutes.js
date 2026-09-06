const express = require("express");

const {
  completeHabit,
  incompleteHabit,
  getUserHabitLogs,
  getHabitLogs,
} = require("../controllers/habitLogController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all habit log routes
router.use(protect);

// ==========================================
// GET ALL LOGS FOR LOGGED-IN USER
// GET /api/habits/logs
// ==========================================
router.get("/logs", getUserHabitLogs);

// ==========================================
// GET LOGS FOR A SPECIFIC HABIT
// GET /api/habits/:id/logs
// ==========================================
router.get("/:id/logs", getHabitLogs);

// ==========================================
// MARK HABIT AS COMPLETED
// POST /api/habits/:id/complete
// ==========================================
router.post("/:id/complete", completeHabit);

// ==========================================
// MARK HABIT AS INCOMPLETE
// POST /api/habits/:id/incomplete
// ==========================================
router.post("/:id/incomplete", incompleteHabit);

module.exports = router;