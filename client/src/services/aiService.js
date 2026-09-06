import api from "./api";

// ========================================
// GET AI INSIGHTS
// ========================================

export const getAIInsights = async () => {
  const response = await api.get("/ai/insights");

  return response.data;
};

// ========================================
// GET AI IMPROVEMENT PLAN
// ========================================

export const getImprovementPlan = async () => {
  const response = await api.get("/ai/improvement-plan");

  return response.data;
};