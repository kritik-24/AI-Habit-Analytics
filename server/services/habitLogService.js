const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");

// Normalize a date to local midnight
const normalizeDate = (date) => {
  const normalized = date ? new Date(date) : new Date();

  normalized.setHours(0, 0, 0, 0);

  return normalized;
};

// Verify that the habit belongs to the logged-in user
const verifyHabitOwnership = async (habitId, userId) => {
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

// MARK HABIT AS COMPLETED
const markHabitComplete = async (habitId, userId, date) => {
  await verifyHabitOwnership(habitId, userId);

  const completionDate = normalizeDate(date);

  const log = await HabitLog.findOneAndUpdate(
    {
      habit: habitId,
      user: userId,
      date: completionDate,
    },
    {
      completed: true,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return log;
};

// MARK HABIT AS INCOMPLETE
const markHabitIncomplete = async (habitId, userId, date) => {
  await verifyHabitOwnership(habitId, userId);

  const completionDate = normalizeDate(date);

  const log = await HabitLog.findOneAndUpdate(
    {
      habit: habitId,
      user: userId,
      date: completionDate,
    },
    {
      completed: false,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return log;
};

// GET ALL LOGS OF LOGGED-IN USER
const getUserHabitLogs = async (userId, filters = {}) => {
  const query = {
    user: userId,
  };

  if (filters.startDate || filters.endDate) {
    query.date = {};

    if (filters.startDate) {
      query.date.$gte = normalizeDate(filters.startDate);
    }

    if (filters.endDate) {
      const endDate = normalizeDate(filters.endDate);
      endDate.setHours(23, 59, 59, 999);

      query.date.$lte = endDate;
    }
  }

  const logs = await HabitLog.find(query)
    .populate("habit", "title category frequency")
    .sort({ date: -1 });

  return logs;
};

// GET LOGS FOR A SINGLE HABIT
const getHabitLogs = async (habitId, userId, filters = {}) => {
  await verifyHabitOwnership(habitId, userId);

  const query = {
    habit: habitId,
    user: userId,
  };

  if (filters.startDate || filters.endDate) {
    query.date = {};

    if (filters.startDate) {
      query.date.$gte = normalizeDate(filters.startDate);
    }

    if (filters.endDate) {
      const endDate = normalizeDate(filters.endDate);
      endDate.setHours(23, 59, 59, 999);

      query.date.$lte = endDate;
    }
  }

  const logs = await HabitLog.find(query)
    .sort({ date: -1 });

  return logs;
};

module.exports = {
  markHabitComplete,
  markHabitIncomplete,
  getUserHabitLogs,
  getHabitLogs,
};