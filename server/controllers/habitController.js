const habitService = require("../services/habitService");

// CREATE HABIT
const createHabit = async (req, res, next) => {
  try {
    const habit = await habitService.createHabit(
      req.user._id,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Habit created successfully",
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL USER HABITS
const getHabits = async (req, res, next) => {
  try {
    const habits = await habitService.getUserHabits(
      req.user._id
    );

    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE HABIT
const getHabitById = async (req, res, next) => {
  try {
    const habit = await habitService.getHabitById(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE HABIT
const updateHabit = async (req, res, next) => {
  try {
    const habit = await habitService.updateHabit(
      req.params.id,
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Habit updated successfully",
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE HABIT
const deleteHabit = async (req, res, next) => {
  try {
    await habitService.deleteHabit(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Habit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// TOGGLE HABIT COMPLETION FOR TODAY
const toggleHabitCompletion = async (req, res, next) => {
  try {
    const result = await habitService.toggleHabitCompletion(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: result.completed
        ? "Habit completed for today"
        : "Habit marked incomplete for today",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
};