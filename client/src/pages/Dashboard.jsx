import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import {
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getHabitPerformance,
  getAIInsights,
  getAIImprovementPlan,
} from "../services/analyticsService";

import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // ================================
  // ANALYTICS STATE
  // ================================

  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  // ================================
  // AI HABIT COACH STATE
  // ================================

  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState("");

  // ================================
  // AI IMPROVEMENT PLAN STATE
  // ================================

  const [improvementPlan, setImprovementPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");

  // ================================
  // GENERAL ANALYTICS STATE
  // ================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // FETCH ANALYTICS DATA
  // ================================

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [weekly, monthly, performance] = await Promise.all([
        getWeeklyAnalytics(),
        getMonthlyAnalytics(),
        getHabitPerformance(),
      ]);

      setWeeklyData(weekly.data);
      setMonthlyData(monthly.data);
      setPerformanceData(performance.data);
    } catch (err) {
      console.error("Analytics Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // FETCH AI INSIGHTS
  // ================================

  const fetchAIInsights = async () => {
    try {
      setAiLoading(true);
      setAiError("");

      const response = await getAIInsights();

      setAiInsight(response.data?.insight || null);
    } catch (err) {
      console.error("AI Insight Error:", err);

      setAiError(
        err.response?.data?.message ||
          "Failed to generate AI insight"
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ================================
  // FETCH AI IMPROVEMENT PLAN
  // ================================

  const fetchImprovementPlan = async () => {
    try {
      setPlanLoading(true);
      setPlanError("");

      const response = await getAIImprovementPlan();

      setImprovementPlan(
        response.data?.improvementPlan || null
      );
    } catch (err) {
      console.error("Improvement Plan Error:", err);

      setPlanError(
        err.response?.data?.message ||
          "Failed to generate improvement plan"
      );
    } finally {
      setPlanLoading(false);
    }
  };

  // ================================
  // LOAD DASHBOARD
  // ================================

  useEffect(() => {
    fetchAnalytics();
    fetchAIInsights();
    fetchImprovementPlan();
  }, []);

  // ================================
  // DAILY PERCENTAGE
  // ================================

  const getDayPercentage = (day) => {
    if (!day?.total || day.total === 0) {
      return 0;
    }

    return Math.round(
      (day.completed / day.total) * 100
    );
  };

  // ================================
  // MAIN METRICS
  // ================================

  const overallCompletion =
    performanceData?.overallCompletionPercentage ?? 0;

  const monthlyCompletion =
    monthlyData?.completionPercentage ?? 0;

  // ================================
  // LOADING SCREEN
  // ================================

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading your habit analytics...
        </p>
      </div>
    );
  }

  // ================================
  // DASHBOARD
  // ================================

  return (
    <div className="dashboard-container">

      {/* ================================
          TOP HEADER
      ================================= */}

      <header className="dashboard-header">
        <div className="dashboard-brand">

          <div className="brand-icon">
            ⚡
          </div>

          <div>
            <span className="brand-label">
              PERSONAL PERFORMANCE
            </span>

            <h1>AI Habit Analytics</h1>

            <p>
              Welcome back,{" "}
              <strong>
                {user?.name || "there"}
              </strong>{" "}
              👋
            </p>
          </div>
        </div>

        <div className="header-actions">

          <button
            type="button"
            className="habits-nav-btn"
            onClick={() => navigate("/habits")}
          >
            📝 My Habits
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>
      </header>

      {/* ================================
          ERROR
      ================================= */}

      {error && (
        <div className="dashboard-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* ================================
          PERFORMANCE HERO
      ================================= */}

      <section className="performance-hero">

        <div className="hero-content">

          <div className="hero-label">
            <span className="live-dot"></span>
            YOUR PERFORMANCE
          </div>

          <h2>
            Build consistency.
            <br />
            <span>
              Become unstoppable.
            </span>
          </h2>

          <p>
            Track your habits, understand your
            progress, and keep improving every
            day.
          </p>

          <button
            type="button"
            className="hero-action"
            onClick={() => navigate("/habits")}
          >
            Manage My Habits
            <span>→</span>
          </button>

        </div>

        <div className="hero-progress">

          <div className="progress-ring">

            <div
              className="progress-ring-fill"
              style={{
                "--progress": `${overallCompletion}%`,
              }}
            >
              <div className="progress-ring-inner">

                <strong>
                  {overallCompletion}%
                </strong>

                <span>Overall</span>

              </div>
            </div>

          </div>

          <div className="hero-progress-label">

            <span>
              Overall completion
            </span>

            <strong>
              Keep pushing 🔥
            </strong>

          </div>

        </div>

      </section>

      {/* ================================
          SUMMARY STATS
      ================================= */}

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon blue">
            🎯
          </div>

          <div className="stat-content">

            <span>Total Habits</span>

            <strong>
              {performanceData?.totalHabits ?? 0}
            </strong>

            <small>
              Active habits
            </small>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon green">
            ✅
          </div>

          <div className="stat-content">

            <span>
              Completed This Month
            </span>

            <strong>
              {monthlyData?.completed ?? 0}
            </strong>

            <small>
              Successful completions
            </small>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon purple">
            📈
          </div>

          <div className="stat-content">

            <span>Overall Rate</span>

            <strong>
              {overallCompletion}%
            </strong>

            <small>
              Across your habits
            </small>

          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            🔥
          </div>

          <div className="stat-content">

            <span>Monthly Rate</span>

            <strong>
              {monthlyCompletion}%
            </strong>

            <small>
              {monthlyData?.month || "Current month"}
            </small>

          </div>

        </div>

      </section>

      {/* ================================
          MAIN ANALYTICS GRID
      ================================= */}

      <section className="dashboard-grid">

        {/* WEEKLY PERFORMANCE */}

        <div className="dashboard-card weekly-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                LAST 7 DAYS
              </span>

              <h2>
                Weekly Performance
              </h2>

            </div>

            <div className="card-icon">
              📅
            </div>

          </div>

          {weeklyData?.dailyPerformance?.length > 0 ? (

            <div className="weekly-list">

              {weeklyData.dailyPerformance.map((day) => {

                const percentage =
                  getDayPercentage(day);

                return (

                  <div
                    className="day-row"
                    key={day.date}
                  >

                    <div className="day-name">

                      {new Date(
                        day.date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "short",
                        }
                      )}

                      <small>
                        {new Date(
                          day.date
                        ).getDate()}
                      </small>

                    </div>

                    <div className="day-progress-area">

                      <div className="progress-container">

                        <div
                          className="progress-bar"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                    <div className="day-result">

                      <strong>
                        {percentage}%
                      </strong>

                      <span>
                        {day.completed}/{day.total}
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>

          ) : (

            <div className="empty-state">

              <span>🎉</span>

              <p>
                Great! All your habits are
                on track.
              </p>

            </div>

          )}

        </div>

        {/* MONTHLY ANALYTICS */}

        <div className="dashboard-card monthly-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                MONTHLY OVERVIEW
              </span>

              <h2>
                Monthly Analytics
              </h2>

            </div>

            <div className="card-icon">
              📊
            </div>

          </div>

          <div className="monthly-main">

            <div className="monthly-score">

              <strong>
                {monthlyCompletion}%
              </strong>

              <span>
                completion rate
              </span>

            </div>

            <div className="monthly-progress">

              <div className="monthly-progress-track">

                <div
                  className="monthly-progress-fill"
                  style={{
                    width: `${monthlyCompletion}%`,
                  }}
                />

              </div>

              <div className="monthly-progress-label">

                <span>
                  {monthlyData?.completed ?? 0} completed
                </span>

                <span>
                  {monthlyData?.incomplete ?? 0} incomplete
                </span>

              </div>

            </div>

          </div>

          <div className="monthly-info">

            <div>

              <span>Month</span>

              <strong>
                {monthlyData?.month || "Current Month"}
              </strong>

            </div>

            <div>

              <span>Total Days</span>

              <strong>
                {monthlyData?.totalLogs ?? 0}
              </strong>

            </div>

            <div>

              <span>Completed</span>

              <strong>
                {monthlyData?.completed ?? 0}
              </strong>

            </div>

            <div>

              <span>Incomplete</span>

              <strong>
                {monthlyData?.incomplete ?? 0}
              </strong>

            </div>

          </div>

        </div>

        {/* BEST HABIT */}

        <div className="dashboard-card habit-performance-card best-habit">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                TOP PERFORMER
              </span>

              <h2>
                Best Performing Habit
              </h2>

            </div>

            <div className="achievement-icon">
              🏆
            </div>

          </div>

          {performanceData?.bestPerformingHabit ? (

            <div className="habit-performance-content">

              <div className="habit-title-row">

                <div className="habit-mini-icon">
                  ⚡
                </div>

                <h3>
                  {performanceData.bestPerformingHabit.habitTitle}
                </h3>

              </div>

              <div className="habit-performance-rate">

                <strong>
                  {performanceData.bestPerformingHabit.completionPercentage}%
                </strong>

                <span>
                  completion
                </span>

              </div>

              <div className="habit-progress-track">

                <div
                  className="habit-progress-fill"
                  style={{
                    width: `${performanceData.bestPerformingHabit.completionPercentage}%`,
                  }}
                />

              </div>

              <div className="habit-meta">

                <span>

                  <strong>
                    {performanceData.bestPerformingHabit.completedDays}
                  </strong>{" "}
                  completed days

                </span>

                <span>
                  ⭐ Excellent consistency
                </span>

              </div>

            </div>

          ) : (

            <div className="empty-state">

              <span>🌱</span>

              <p>
                Add habits to start tracking
                performance.
              </p>

            </div>

          )}

        </div>

        {/* NEEDS ATTENTION */}

        <div className="dashboard-card habit-performance-card attention-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                IMPROVEMENT AREA
              </span>

              <h2>
                Needs Attention
              </h2>

            </div>

            <div className="achievement-icon">
              ⚠️
            </div>

          </div>

          {performanceData?.worstPerformingHabit ? (

            <div className="habit-performance-content">

              <div className="habit-title-row">

                <div className="habit-mini-icon warning">
                  🎯
                </div>

                <h3>
                  {performanceData.worstPerformingHabit.habitTitle}
                </h3>

              </div>

              <div className="habit-performance-rate">

                <strong>
                  {performanceData.worstPerformingHabit.completionPercentage}%
                </strong>

                <span>
                  completion
                </span>

              </div>

              <div className="habit-progress-track">

                <div
                  className="habit-progress-fill warning-fill"
                  style={{
                    width: `${performanceData.worstPerformingHabit.completionPercentage}%`,
                  }}
                />

              </div>

              <div className="habit-meta">

                <span>

                  <strong>
                    {performanceData.worstPerformingHabit.completedDays}
                  </strong>{" "}
                  completed days

                </span>

                <span>
                  💪 Time to improve
                </span>

              </div>

            </div>

          ) : (

            <div className="empty-state success-state">

              <span>🎉</span>

              <p>
                Amazing! All your habits are
                on track.
              </p>

            </div>

          )}

        </div>

      </section>

      {/* ================================
          AI HABIT COACH
      ================================= */}

      <section className="ai-coach-section">

        <div className="ai-coach-header">

          <div className="ai-coach-title">

            <div className="ai-coach-icon">
              🤖
            </div>

            <div>

              <span className="card-eyebrow">
                PERSONALIZED INTELLIGENCE
              </span>

              <h2>
                AI Habit Coach
              </h2>

              <p>
                Personalized insights based on
                your actual habit performance.
              </p>

            </div>

          </div>

          <div className="ai-powered-badge">
            ✨ AI POWERED
          </div>

        </div>

        {aiLoading ? (

          <div className="ai-loading">

            <div className="ai-loading-icon">
              🤖
            </div>

            <div>

              <strong>
                Analyzing your habits...
              </strong>

              <p>
                Your personal AI coach is
                preparing your insights.
              </p>

            </div>

          </div>

        ) : aiError ? (

          <div className="ai-error-state">

            <div className="ai-error-icon">
              ⚠️
            </div>

            <div>

              <strong>
                AI insights are temporarily unavailable
              </strong>

              <p>{aiError}</p>

              <button
                type="button"
                className="hero-action"
                onClick={fetchAIInsights}
              >
                Try Again
              </button>

            </div>

          </div>

        ) : aiInsight ? (

          <div className="ai-coach-content">

            <div className="ai-summary-card">

              <div className="ai-section-heading">

                <span>📊</span>

                <h3>
                  Performance Summary
                </h3>

              </div>

              <p>
                {aiInsight.performanceSummary}
              </p>

            </div>

            <div className="ai-highlights-grid">

              <div className="ai-highlight-card strongest">

                <div className="ai-highlight-icon">
                  💪
                </div>

                <div>

                  <span>
                    STRONGEST AREA
                  </span>

                  <h3>
                    {aiInsight.strongestArea}
                  </h3>

                </div>

              </div>

              <div className="ai-highlight-card improvement">

                <div className="ai-highlight-icon">
                  🎯
                </div>

                <div>

                  <span>
                    FOCUS AREA
                  </span>

                  <h3>
                    {aiInsight.improvementArea}
                  </h3>

                </div>

              </div>

            </div>

            <div className="ai-recommendations">

              <div className="ai-section-heading">

                <span>⚡</span>

                <h3>
                  Recommended Actions
                </h3>

              </div>

              <div className="ai-recommendation-list">

                {aiInsight.recommendations?.map(
                  (recommendation, index) => (

                    <div
                      className="ai-recommendation"
                      key={index}
                    >

                      <div className="recommendation-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <p>
                        {recommendation}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

            <div className="ai-consistency">

              <div className="ai-consistency-left">

                <div className="ai-consistency-icon">
                  🔥
                </div>

                <div>

                  <span>
                    CONSISTENCY STATUS
                  </span>

                  <h3>
                    {aiInsight.consistencyStatus}
                  </h3>

                </div>

              </div>

              <p>
                {aiInsight.consistencyMessage}
              </p>

            </div>

          </div>

        ) : (

          <div className="ai-empty-state">

            <span>🧠</span>

            <p>
              No AI insights are available yet.
            </p>

          </div>

        )}

      </section>

      {/* ================================
          AI IMPROVEMENT PLAN
      ================================= */}

      <section className="ai-improvement-section">

        <div className="ai-coach-header">

          <div className="ai-coach-title">

            <div className="ai-coach-icon">
              🚀
            </div>

            <div>

              <span className="card-eyebrow">
                PERSONALIZED ACTION PLAN
              </span>

              <h2>
                AI Improvement Plan
              </h2>

              <p>
                A practical plan generated from
                your current habit performance.
              </p>

            </div>

          </div>

          <div className="ai-powered-badge">
            ✨ AI POWERED
          </div>

        </div>

        {planLoading ? (

          <div className="ai-loading">

            <div className="ai-loading-icon">
              🚀
            </div>

            <div>

              <strong>
                Building your improvement plan...
              </strong>

              <p>
                AI is creating practical next
                steps for you.
              </p>

            </div>

          </div>

        ) : planError ? (

          <div className="ai-error-state">

            <div className="ai-error-icon">
              ⚠️
            </div>

            <div>

              <strong>
                Improvement plan is temporarily unavailable
              </strong>

              <p>{planError}</p>

              <button
                type="button"
                className="hero-action"
                onClick={fetchImprovementPlan}
              >
                Try Again
              </button>

            </div>

          </div>

        ) : improvementPlan ? (

          <div className="ai-improvement-content">

            <div className="improvement-plan-top">

              <div className="improvement-plan-card">

                <span>
                  🎯 GOAL
                </span>

                <h3>
                  {improvementPlan.goal}
                </h3>

              </div>

              <div className="improvement-plan-card">

                <span>
                  🚨 PRIORITY
                </span>

                <h3>
                  {improvementPlan.priority}
                </h3>

              </div>

              <div className="improvement-plan-card">

                <span>
                  🔎 FOCUS HABIT
                </span>

                <h3>
                  {improvementPlan.focusHabit}
                </h3>

              </div>

            </div>

            <div className="improvement-reason-card">

              <div className="ai-section-heading">

                <span>💡</span>

                <h3>
                  Why This Habit?
                </h3>

              </div>

              <p>
                {improvementPlan.reason}
              </p>

            </div>

            <div className="ai-recommendations">

              <div className="ai-section-heading">

                <span>⚡</span>

                <h3>
                  Your Action Plan
                </h3>

              </div>

              <div className="ai-recommendation-list">

                {improvementPlan.actions?.map(
                  (action, index) => (

                    <div
                      className="ai-recommendation"
                      key={index}
                    >

                      <div className="recommendation-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <p>
                        {action}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

            <div className="improvement-target-card">

              <div>

                <span>
                  🏁 SHORT-TERM TARGET
                </span>

                <h3>
                  {improvementPlan.shortTermTarget}
                </h3>

              </div>

            </div>

            <div className="improvement-encouragement">

              <div className="ai-consistency-icon">
                🔥
              </div>

              <div>

                <span>
                  AI COACH MESSAGE
                </span>

                <p>
                  {improvementPlan.encouragement}
                </p>

              </div>

            </div>

          </div>

        ) : (

          <div className="ai-empty-state">

            <span>🚀</span>

            <p>
              No improvement plan is available yet.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}

export default Dashboard;