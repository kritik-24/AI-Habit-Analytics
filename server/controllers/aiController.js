const analyticsService = require("../services/analyticsService");

const {
  generateHabitInsight,
  generateImprovementPlan,
} = require("../services/aiService");

// ========================================
// GET AI INSIGHTS
// ========================================

const getAIInsights = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const [
      weeklyAnalytics,
      monthlyAnalytics,
      habitPerformance,
    ] = await Promise.all([
      analyticsService.getWeeklyAnalytics(
        userId
      ),

      analyticsService.getMonthlyAnalytics(
        userId
      ),

      analyticsService.getHabitPerformanceAnalytics(
        userId
      ),
    ]);

    const analyticsData = {
      weekly: weeklyAnalytics,
      monthly: monthlyAnalytics,
      performance: habitPerformance,
    };

    const insight =
      await generateHabitInsight(
        analyticsData,
        userId
      );

    res.status(200).json({
      success: true,

      data: {
        insight,
        analytics: analyticsData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET AI IMPROVEMENT PLAN
// ========================================

const getImprovementPlan = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const [
      weeklyAnalytics,
      monthlyAnalytics,
      habitPerformance,
    ] = await Promise.all([
      analyticsService.getWeeklyAnalytics(
        userId
      ),

      analyticsService.getMonthlyAnalytics(
        userId
      ),

      analyticsService.getHabitPerformanceAnalytics(
        userId
      ),
    ]);

    const analyticsData = {
      weekly: weeklyAnalytics,
      monthly: monthlyAnalytics,
      performance: habitPerformance,
    };

    const improvementPlan =
      await generateImprovementPlan(
        analyticsData,
        userId
      );

    res.status(200).json({
      success: true,

      data: {
        improvementPlan,
        analytics: analyticsData,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAIInsights,
  getImprovementPlan,
};