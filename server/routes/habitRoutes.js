const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
} = require("../controllers/habitController");

// Protect all habit routes
router.use(protect);

// CREATE HABIT
router.post("/", createHabit);

// GET ALL HABITS
router.get("/", getHabits);

// TOGGLE HABIT COMPLETION FOR TODAY
router.patch("/:id/toggle", toggleHabitCompletion);

// TOGGLE TODAY'S COMPLETION
router.put("/:id/complete", toggleHabitCompletion);

// GET SINGLE HABIT
router.get("/:id", getHabitById);

// UPDATE HABIT
router.put("/:id", updateHabit);

// DELETE HABIT
router.delete("/:id", deleteHabit);



module.exports = router;