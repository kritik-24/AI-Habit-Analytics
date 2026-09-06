const Habit = require("../models/Habit");

// CREATE HABIT
const createHabit = async (userId, habitData) => {
  const habit = await Habit.create({
    ...habitData,
    user: userId,
  });

  return habit;
};

// GET ALL HABITS OF LOGGED-IN USER
const getUserHabits = async (userId) => {
  const habits = await Habit.find({
    user: userId,
    isActive: true,
  }).sort({ createdAt: -1 });

  return habits;
};

// GET SINGLE HABIT
const getHabitById = async (habitId, userId) => {
  const habit = await Habit.findOne({
    _id: habitId,
    user: userId,
    isActive: true,
  });

  if (!habit) {
    const error = new Error("Habit not found");
    error.statusCode = 404;
    throw error;
  }

  return habit;
};

// UPDATE HABIT
const updateHabit = async (habitId, userId, updateData) => {
  const habit = await Habit.findOneAndUpdate(
    {
      _id: habitId,
      user: userId,
      isActive: true,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!habit) {
    const error = new Error("Habit not found");
    error.statusCode = 404;
    throw error;
  }

  return habit;
};

// DELETE HABIT (SOFT DELETE)
const deleteHabit = async (habitId, userId) => {
  const habit = await Habit.findOneAndUpdate(
    {
      _id: habitId,
      user: userId,
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      new: true,
    }
  );

  if (!habit) {
    const error = new Error("Habit not found");
    error.statusCode = 404;
    throw error;
  }

  return habit;
};

// TOGGLE HABIT COMPLETION FOR TODAY
const toggleHabitCompletion = async (habitId, userId) => {
  const habit = await Habit.findOne({
    _id: habitId,
    user: userId,
    isActive: true,
  });

  if (!habit) {
    const error = new Error("Habit not found");
    error.statusCode = 404;
    throw error;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Normalize existing dates
  const completedDates = habit.completedDates.map((date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  });

  const existingIndex = completedDates.findIndex(
    (date) => date.getTime() === today.getTime()
  );

  let completed;

  if (existingIndex !== -1) {
    // UNCOMPLETE TODAY
    completedDates.splice(existingIndex, 1);
    completed = false;
  } else {
    // COMPLETE TODAY
    completedDates.push(today);
    completed = true;
  }

  // Sort dates chronologically
  completedDates.sort((a, b) => a - b);

  // Calculate current streak
  let currentStreak = 0;

  if (completedDates.length > 0) {
    const dateSet = new Set(
      completedDates.map((date) => date.getTime())
    );

    let checkDate = new Date(today);

    while (dateSet.has(checkDate.getTime())) {
      currentStreak++;

      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate = null;

  for (const date of completedDates) {
    if (!previousDate) {
      runningStreak = 1;
    } else {
      const difference =
        (date.getTime() - previousDate.getTime()) /
        (1000 * 60 * 60 * 24);

      if (difference === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    previousDate = date;
  }

  habit.completedDates = completedDates;
  habit.streak = currentStreak;
  habit.longestStreak = longestStreak;

  await habit.save();

  return {
    habit,
    completed,
    streak: currentStreak,
    longestStreak,
  };
};


module.exports = {
  createHabit,
  getUserHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
};