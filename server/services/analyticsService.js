const Habit = require("../models/Habit");

// ========================================
// DATE HELPERS
// ========================================

// Normalize date to local midnight
const normalizeDate = (date) => {
  const normalized = new Date(date);

  normalized.setHours(0, 0, 0, 0);

  return normalized;
};

// Convert date to YYYY-MM-DD
const getDateKey = (date) => {
  const d = normalizeDate(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Get unique completed date keys
const getCompletedDateSet = (habit) => {
  return new Set(
    (habit.completedDates || []).map((date) =>
      getDateKey(date)
    )
  );
};

// Check whether habit was completed on date
const isCompletedOnDate = (habit, date) => {
  const completedDateSet =
    getCompletedDateSet(habit);

  return completedDateSet.has(
    getDateKey(date)
  );
};

// ========================================
// SCHEDULE HELPERS
// ========================================

const isScheduledDay = (habit, date) => {
  // Daily habit
  if (habit.frequency === "daily") {
    return true;
  }

  // Weekly habit
  if (habit.frequency === "weekly") {
    const targetDays = habit.targetDays || [];

    if (targetDays.length === 0) {
      return false;
    }

    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayName =
      weekdayNames[date.getDay()];

    return targetDays.includes(dayName);
  }

  return false;
};

// ========================================
// STREAK CALCULATION
// ========================================

const calculateStreaks = (completedDates) => {
  if (!completedDates.length) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const uniqueDates = [
    ...new Set(
      completedDates.map((date) =>
        getDateKey(date)
      )
    ),
  ].sort();

  let longestStreak = 1;
  let runningStreak = 1;

  for (
    let i = 1;
    i < uniqueDates.length;
    i++
  ) {
    const previousDate =
      normalizeDate(uniqueDates[i - 1]);

    const currentDate =
      normalizeDate(uniqueDates[i]);

    const difference =
      (currentDate - previousDate) /
      (1000 * 60 * 60 * 24);

    if (difference === 1) {
      runningStreak++;

      longestStreak = Math.max(
        longestStreak,
        runningStreak
      );
    } else {
      runningStreak = 1;
    }
  }

  const completedDateSet =
    new Set(uniqueDates);

  let currentStreak = 0;

  let checkDate =
    normalizeDate(new Date());

  while (
    completedDateSet.has(
      getDateKey(checkDate)
    )
  ) {
    currentStreak++;

    checkDate.setDate(
      checkDate.getDate() - 1
    );
  }

  return {
    currentStreak,
    longestStreak,
  };
};

// ========================================
// GET HABIT STREAK
// ========================================

const getHabitStreak = async (
  habitId,
  userId
) => {
  const habit = await Habit.findOne({
    _id: habitId,
    user: userId,
    isActive: true,
  });

  if (!habit) {
    const error = new Error(
      "Habit not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const completedDates =
    habit.completedDates || [];

  const streaks =
    calculateStreaks(completedDates);

  return {
    habitId: habit._id,
    habitTitle: habit.title,
    ...streaks,
    totalCompletedDays:
      completedDates.length,
  };
};

// ========================================
// GET HABIT COMPLETION PERCENTAGE
// ========================================

const getHabitCompletionPercentage = async (
  habitId,
  userId,
  filters = {}
) => {
  const habit = await Habit.findOne({
    _id: habitId,
    user: userId,
    isActive: true,
  });

  if (!habit) {
    const error = new Error(
      "Habit not found"
    );

    error.statusCode = 404;

    throw error;
  }

  const today =
    normalizeDate(new Date());

  // Start date
  let startDate = filters.startDate
    ? normalizeDate(filters.startDate)
    : normalizeDate(habit.createdAt);

  // Habit creation date
  const habitCreatedDate =
    normalizeDate(habit.createdAt);

  // Never count days before habit existed
  if (startDate < habitCreatedDate) {
    startDate = habitCreatedDate;
  }

  // End date
  let endDate = filters.endDate
    ? normalizeDate(filters.endDate)
    : today;

  // Never calculate future dates
  if (endDate > today) {
    endDate = today;
  }

  const completedDateSet =
    getCompletedDateSet(habit);

  let totalDays = 0;
  let completedDays = 0;

  const currentDate =
    new Date(startDate);

  while (currentDate <= endDate) {
    if (
      isScheduledDay(
        habit,
        currentDate
      )
    ) {
      totalDays++;

      if (
        completedDateSet.has(
          getDateKey(currentDate)
        )
      ) {
        completedDays++;
      }
    }

    currentDate.setDate(
      currentDate.getDate() + 1
    );
  }

  const incompleteDays =
    totalDays - completedDays;

  const completionPercentage =
    totalDays === 0
      ? 0
      : Number(
          (
            (completedDays /
              totalDays) *
            100
          ).toFixed(2)
        );

  return {
    habitId: habit._id,
    habitTitle: habit.title,
    totalDays,
    completedDays,
    incompleteDays,
    completionPercentage,
  };
};

// ========================================
// GET WEEKLY ANALYTICS
// ========================================

const getWeeklyAnalytics = async (
  userId
) => {
  const today =
    normalizeDate(new Date());

  const startDate =
    new Date(today);

  startDate.setDate(
    startDate.getDate() - 6
  );

  const habits = await Habit.find({
    user: userId,
    isActive: true,
  });

  const dailyPerformance = [];

  let totalLogs = 0;
  let completed = 0;
  let incomplete = 0;

  for (let i = 0; i < 7; i++) {
    const currentDate =
      new Date(startDate);

    currentDate.setDate(
      startDate.getDate() + i
    );

    let dailyTotal = 0;
    let dailyCompleted = 0;

    for (const habit of habits) {
      const habitCreatedDate =
        normalizeDate(
          habit.createdAt
        );

      // Do not count days before
      // habit creation
      if (
        currentDate <
        habitCreatedDate
      ) {
        continue;
      }

      // Check schedule
      if (
        !isScheduledDay(
          habit,
          currentDate
        )
      ) {
        continue;
      }

      dailyTotal++;

      if (
        isCompletedOnDate(
          habit,
          currentDate
        )
      ) {
        dailyCompleted++;
      }
    }

    const dailyIncomplete =
      dailyTotal -
      dailyCompleted;

    totalLogs += dailyTotal;
    completed += dailyCompleted;
    incomplete += dailyIncomplete;

    dailyPerformance.push({
      date: getDateKey(currentDate),
      completed: dailyCompleted,
      incomplete: dailyIncomplete,
      total: dailyTotal,
    });
  }

  const completionPercentage =
    totalLogs === 0
      ? 0
      : Number(
          (
            (completed /
              totalLogs) *
            100
          ).toFixed(2)
        );

  return {
    period: "Last 7 Days",
    startDate:
      getDateKey(startDate),
    endDate:
      getDateKey(today),
    totalLogs,
    completed,
    incomplete,
    completionPercentage,
    dailyPerformance,
  };
};

// ========================================
// GET MONTHLY ANALYTICS
// ========================================

const getMonthlyAnalytics = async (
  userId
) => {
  const today =
    normalizeDate(new Date());

  const startDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

  const habits = await Habit.find({
    user: userId,
    isActive: true,
  });

  let totalLogs = 0;
  let completed = 0;
  let incomplete = 0;

  const dailyPerformance = [];

  for (
    let day = 1;
    day <= today.getDate();
    day++
  ) {
    const currentDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        day
      );

    let dailyTotal = 0;
    let dailyCompleted = 0;

    for (const habit of habits) {
      const habitCreatedDate =
        normalizeDate(
          habit.createdAt
        );

      // Do not count days before
      // habit creation
      if (
        currentDate <
        habitCreatedDate
      ) {
        continue;
      }

      // Check schedule
      if (
        !isScheduledDay(
          habit,
          currentDate
        )
      ) {
        continue;
      }

      dailyTotal++;

      if (
        isCompletedOnDate(
          habit,
          currentDate
        )
      ) {
        dailyCompleted++;
      }
    }

    const dailyIncomplete =
      dailyTotal -
      dailyCompleted;

    totalLogs += dailyTotal;
    completed += dailyCompleted;
    incomplete += dailyIncomplete;

    dailyPerformance.push({
      date: getDateKey(currentDate),
      completed: dailyCompleted,
      incomplete: dailyIncomplete,
      total: dailyTotal,
    });
  }

  const completionPercentage =
    totalLogs === 0
      ? 0
      : Number(
          (
            (completed /
              totalLogs) *
            100
          ).toFixed(2)
        );

  return {
    period: "Current Month",
    month:
      today.toLocaleString(
        "default",
        {
          month: "long",
        }
      ),
    year: today.getFullYear(),
    startDate:
      getDateKey(startDate),
    endDate:
      getDateKey(today),
    totalLogs,
    completed,
    incomplete,
    completionPercentage,
    dailyPerformance,
  };
};

// ========================================
// CALCULATE WEEKLY TREND
// ========================================

const calculateWeeklyTrend = (
  weeklyAnalytics
) => {
  const dailyPerformance =
    weeklyAnalytics?.dailyPerformance ||
    [];

  if (dailyPerformance.length < 6) {
    return "Not enough data";
  }

  const firstHalf =
    dailyPerformance.slice(0, 3);

  const secondHalf =
    dailyPerformance.slice(-3);

  const firstTotal =
    firstHalf.reduce(
      (sum, day) =>
        sum + (day.total || 0),
      0
    );

  const firstCompleted =
    firstHalf.reduce(
      (sum, day) =>
        sum + (day.completed || 0),
      0
    );

  const secondTotal =
    secondHalf.reduce(
      (sum, day) =>
        sum + (day.total || 0),
      0
    );

  const secondCompleted =
    secondHalf.reduce(
      (sum, day) =>
        sum + (day.completed || 0),
      0
    );

  const firstRate =
    firstTotal === 0
      ? 0
      : (firstCompleted /
          firstTotal) *
        100;

  const secondRate =
    secondTotal === 0
      ? 0
      : (secondCompleted /
          secondTotal) *
        100;

  if (secondRate > firstRate + 5) {
    return "Improving";
  }

  if (secondRate < firstRate - 5) {
    return "Declining";
  }

  return "Stable";
};

// ========================================
// CALCULATE RISK ANALYSIS
// ========================================

const calculateRiskAnalysis = (
  overallCompletionPercentage,
  weeklyAnalytics,
  habitPerformance
) => {
  // ----------------------------------------
  // CONSISTENCY STATUS
  // ----------------------------------------

  let consistencyStatus = "At Risk";

  if (
    overallCompletionPercentage >= 85
  ) {
    consistencyStatus = "Excellent";
  } else if (
    overallCompletionPercentage >= 70
  ) {
    consistencyStatus = "Good";
  } else if (
    overallCompletionPercentage >= 40
  ) {
    consistencyStatus =
      "Needs Improvement";
  }

  // ----------------------------------------
  // WEEKLY TREND
  // ----------------------------------------

  const weeklyTrend =
    calculateWeeklyTrend(
      weeklyAnalytics
    );

  // ----------------------------------------
  // STRONG / WEAK HABITS
  // ----------------------------------------

  const strongHabits =
    habitPerformance.filter(
      (habit) =>
        habit.completionPercentage >= 70
    );

  const weakHabits =
    habitPerformance.filter(
      (habit) =>
        habit.completionPercentage < 40
    );

  // ----------------------------------------
  // DATA QUALITY
  // ----------------------------------------

  const totalTrackedDays =
    habitPerformance.reduce(
      (sum, habit) =>
        sum + (habit.totalDays || 0),
      0
    );

  let dataQuality = "Limited";

  if (totalTrackedDays >= 30) {
    dataQuality = "Good";
  } else if (totalTrackedDays >= 7) {
    dataQuality = "Moderate";
  }

  // ----------------------------------------
  // RISK REASONS
  // ----------------------------------------

  const riskReasons = [];

  if (
    overallCompletionPercentage < 40
  ) {
    riskReasons.push(
      "Overall completion rate is below 40%"
    );
  }

  if (strongHabits.length === 0) {
    riskReasons.push(
      "No habit currently has a completion rate of 70% or higher"
    );
  }

  if (weakHabits.length > 0) {
    riskReasons.push(
      `${weakHabits.length} habit${
        weakHabits.length > 1
          ? "s currently need attention"
          : " currently needs attention"
      }`
    );
  }

  if (weeklyTrend === "Declining") {
    riskReasons.push(
      "Recent weekly performance is declining"
    );
  }

  if (dataQuality === "Limited") {
    riskReasons.push(
      "There is not enough historical data to establish a reliable long-term pattern"
    );
  }

  // ----------------------------------------
  // RISK LEVEL
  // ----------------------------------------

  let riskLevel = "Low";

  if (
    consistencyStatus === "At Risk"
  ) {
    riskLevel = "High";
  } else if (
    consistencyStatus ===
    "Needs Improvement"
  ) {
    riskLevel = "Medium";
  }

  return {
    consistencyStatus,
    riskLevel,
    weeklyTrend,
    dataQuality,
    totalTrackedDays,
    strongHabitCount:
      strongHabits.length,
    habitsNeedingAttention:
      weakHabits.length,
    riskReasons,
  };
};

// ========================================
// GET HABIT PERFORMANCE ANALYTICS
// ========================================

const getHabitPerformanceAnalytics =
  async (userId) => {
    const habits = await Habit.find({
      user: userId,
      isActive: true,
    });

    const habitPerformance = [];

    for (const habit of habits) {
      const result =
        await getHabitCompletionPercentage(
          habit._id,
          userId
        );

      habitPerformance.push({
        habitId: habit._id,
        habitTitle: habit.title,
        totalDays:
          result.totalDays,
        completedDays:
          result.completedDays,
        incompleteDays:
          result.incompleteDays,
        completionPercentage:
          result.completionPercentage,
      });
    }

    // ----------------------------------------
    // SORT HABITS
    // ----------------------------------------

    habitPerformance.sort(
      (a, b) =>
        b.completionPercentage -
        a.completionPercentage
    );

    // ----------------------------------------
    // BEST / WORST HABIT
    // ----------------------------------------

    const STRONG_HABIT_THRESHOLD = 70;

    const strongHabits =
      habitPerformance.filter(
        (habit) =>
          habit.completionPercentage >=
          STRONG_HABIT_THRESHOLD
      );

    const bestPerformingHabit =
      strongHabits.length > 0
        ? strongHabits[0]
        : null;

    const needsAttentionHabits =
      habitPerformance.filter(
        (habit) =>
          habit.completionPercentage <
          STRONG_HABIT_THRESHOLD
      );

    const worstPerformingHabit =
      needsAttentionHabits.length > 0
        ? needsAttentionHabits[
            needsAttentionHabits.length - 1
          ]
        : null;

    // ----------------------------------------
    // OVERALL PERFORMANCE
    // ----------------------------------------

    const totalHabits =
      habits.length;

    const totalCompletedDays =
      habitPerformance.reduce(
        (sum, habit) =>
          sum + habit.completedDays,
        0
      );

    const totalTrackedDays =
      habitPerformance.reduce(
        (sum, habit) =>
          sum + habit.totalDays,
        0
      );

    const overallCompletionPercentage =
      totalTrackedDays === 0
        ? 0
        : Number(
            (
              (totalCompletedDays /
                totalTrackedDays) *
              100
            ).toFixed(2)
          );

    // ----------------------------------------
    // RISK ANALYSIS
    // ----------------------------------------

    const weeklyAnalytics =
      await getWeeklyAnalytics(
        userId
      );

    const riskAnalysis =
      calculateRiskAnalysis(
        overallCompletionPercentage,
        weeklyAnalytics,
        habitPerformance
      );

    // ----------------------------------------
    // FINAL RESULT
    // ----------------------------------------

    return {
      totalHabits,
      overallCompletionPercentage,
      bestPerformingHabit,
      worstPerformingHabit,
      habitPerformance,
      riskAnalysis,
    };
  };

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getHabitStreak,
  getHabitCompletionPercentage,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getHabitPerformanceAnalytics,
};