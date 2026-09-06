const analyticsService = require("../services/analyticsService");

// GET HABIT STREAK
const getHabitStreak = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getHabitStreak(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// GET HABIT COMPLETION PERCENTAGE
const getHabitCompletionPercentage = async (req, res, next) => {
  try {
    const analytics =
      await analyticsService.getHabitCompletionPercentage(
        req.params.id,
        req.user._id,
        {
          startDate: req.query.startDate,
          endDate: req.query.endDate,
        }
      );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// GET WEEKLY ANALYTICS
const getWeeklyAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getWeeklyAnalytics(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// GET MONTHLY ANALYTICS
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getMonthlyAnalytics(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// GET HABIT PERFORMANCE ANALYTICS
const getHabitPerformanceAnalytics = async (req, res, next) => {
  try {
    const analytics =
      await analyticsService.getHabitPerformanceAnalytics(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHabitStreak,
  getHabitCompletionPercentage,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getHabitPerformanceAnalytics,
};