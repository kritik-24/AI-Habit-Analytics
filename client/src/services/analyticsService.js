import axios from "axios";

const API_URL = "http://localhost:5000/api/analytics";
const AI_API_URL = "http://localhost:5000/api/ai";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ========================================
// WEEKLY ANALYTICS
// ========================================

export const getWeeklyAnalytics = async () => {
  const response = await axios.get(
    `${API_URL}/weekly`,
    getAuthHeaders()
  );

  return response.data;
};

// ========================================
// MONTHLY ANALYTICS
// ========================================

export const getMonthlyAnalytics = async () => {
  const response = await axios.get(
    `${API_URL}/monthly`,
    getAuthHeaders()
  );

  return response.data;
};

// ========================================
// HABIT PERFORMANCE
// ========================================

export const getHabitPerformance = async () => {
  const response = await axios.get(
    `${API_URL}/performance`,
    getAuthHeaders()
  );

  return response.data;
};

// ========================================
// HABIT STREAK
// ========================================

export const getHabitStreak = async (habitId) => {
  const response = await axios.get(
    `${API_URL}/habits/${habitId}/streak`,
    getAuthHeaders()
  );

  return response.data;
};

// ========================================
// HABIT COMPLETION
// ========================================

export const getHabitCompletion = async (
  habitId,
  startDate,
  endDate
) => {
  const response = await axios.get(
    `${API_URL}/habits/${habitId}/completion`,
    {
      ...getAuthHeaders(),
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};

// ========================================
// AI INSIGHTS
// ========================================

export const getAIInsights = async () => {
  const response = await axios.get(
    `${AI_API_URL}/insights`,
    getAuthHeaders()
  );

  return response.data;
};

// ========================================
// AI IMPROVEMENT PLAN
// ========================================

export const getAIImprovementPlan = async () => {
  const response = await axios.get(
    `${AI_API_URL}/improvement-plan`,
    getAuthHeaders()
  );

  return response.data;
};
