const habitLogService = require("../services/habitLogService");

// MARK HABIT AS COMPLETED
const completeHabit = async (req, res, next) => {
  try {
    const { date } = req.body;

    const log = await habitLogService.markHabitComplete(
      req.params.id,
      req.user._id,
      date
    );

    res.status(200).json({
      success: true,
      message: "Habit marked as completed",
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// MARK HABIT AS INCOMPLETE
const incompleteHabit = async (req, res, next) => {
  try {
    const { date } = req.body;

    const log = await habitLogService.markHabitIncomplete(
      req.params.id,
      req.user._id,
      date
    );

    res.status(200).json({
      success: true,
      message: "Habit marked as incomplete",
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL LOGS OF LOGGED-IN USER
const getUserHabitLogs = async (req, res, next) => {
  try {
    const logs = await habitLogService.getUserHabitLogs(
      req.user._id,
      {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      }
    );

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// GET LOGS FOR A SINGLE HABIT
const getHabitLogs = async (req, res, next) => {
  try {
    const logs = await habitLogService.getHabitLogs(
      req.params.id,
      req.user._id,
      {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      }
    );

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeHabit,
  incompleteHabit,
  getUserHabitLogs,
  getHabitLogs,
};