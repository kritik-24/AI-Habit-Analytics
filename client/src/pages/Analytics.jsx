import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getHabitPerformance,
} from "../services/analyticsService";

import {
  getAIInsights,
  getImprovementPlan,
} from "../services/aiService";

// ========================================
// ANALYTICS PAGE
// ========================================

function Analytics() {
  const navigate = useNavigate();

  // ========================================
  // ANALYTICS STATE
  // ========================================

  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  // ========================================
  // AI STATE
  // ========================================

  const [aiInsight, setAIInsight] = useState(null);
  const [improvementPlan, setImprovementPlan] = useState(null);

  // ========================================
  // LOADING STATE
  // ========================================

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(false);

  // ========================================
  // ERROR STATE
  // ========================================

  const [error, setError] = useState("");
  const [aiError, setAIError] = useState("");

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ========================================
  // LOAD ANALYTICS
  // ========================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        weeklyResponse,
        monthlyResponse,
        performanceResponse,
      ] = await Promise.all([
        getWeeklyAnalytics(),
        getMonthlyAnalytics(),
        getHabitPerformance(),
      ]);

      setWeeklyData(weeklyResponse.data);
      setMonthlyData(monthlyResponse.data);
      setPerformanceData(performanceResponse.data);

      // Load AI after analytics loads
      loadAIAnalysis();
    } catch (err) {
      console.error("Analytics loading error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD AI ANALYSIS
  // ========================================

  const loadAIAnalysis = async () => {
    try {
      setAILoading(true);
      setAIError("");

      const [
        insightResponse,
        planResponse,
      ] = await Promise.all([
        getAIInsights(),
        getImprovementPlan(),
      ]);

      console.log(
        "AI Insight Response:",
        insightResponse.data
      );

      console.log(
        "Improvement Plan Response:",
        planResponse.data
      );

      // Supports multiple possible backend formats

      setAIInsight(
        insightResponse.data?.insight ||
          insightResponse.data?.data ||
          insightResponse.data
      );

      setImprovementPlan(
        planResponse.data?.improvementPlan ||
          planResponse.data?.data ||
          planResponse.data
      );
    } catch (err) {
      console.error("AI loading error:", err);

      setAIError(
        err.response?.data?.message ||
          "Unable to generate AI analysis"
      );
    } finally {
      setAILoading(false);
    }
  };

  // ========================================
  // REFRESH AI
  // ========================================

  const handleRefreshAI = async () => {
    await loadAIAnalysis();
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
          fontFamily: "Arial, sans-serif",
          background: "#f5f7fb",
        }}
      >
        Loading analytics...
      </div>
    );
  }

  // ========================================
  // ERROR SCREEN
  // ========================================

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Analytics</h2>

        <p style={{ color: "#dc2626" }}>
          {error}
        </p>

        <button
          onClick={loadAnalytics}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ========================================
  // RISK ANALYSIS
  // ========================================

  const riskAnalysis =
    performanceData?.riskAnalysis;

  // ========================================
  // MAIN PAGE
  // ========================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* ========================================
          HEADER
      ======================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Habit Analytics
          </h1>

          <p
            style={{
              color: "#666",
              marginBottom: 0,
            }}
          >
            Track your habit performance and
            consistency
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleRefreshAI}
            disabled={aiLoading}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              cursor: aiLoading
                ? "not-allowed"
                : "pointer",
              background: "#4f46e5",
              color: "white",
              opacity: aiLoading ? 0.7 : 1,
            }}
          >
            {aiLoading
              ? "Analyzing..."
              : "🤖 Refresh AI"}
          </button>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: "#e5e7eb",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* ========================================
          OVERALL PERFORMANCE
      ======================================== */}

      <h2>Overall Performance</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <StatCard
          title="Total Habits"
          value={
            performanceData?.totalHabits || 0
          }
        />

        <StatCard
          title="Overall Completion"
          value={`${performanceData?.overallCompletionPercentage || 0}%`}
        />

        <StatCard
          title="Consistency Status"
          value={
            riskAnalysis?.consistencyStatus ||
            "No Data"
          }
        />

        <StatCard
          title="Risk Level"
          value={
            riskAnalysis?.riskLevel ||
            "No Data"
          }
        />
      </div>

      {/* ========================================
          AI ERROR
      ======================================== */}

      {aiError && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            padding: "18px",
            borderRadius: "12px",
            marginBottom: "25px",
            color: "#991b1b",
          }}
        >
          <strong>
            AI Analysis Unavailable
          </strong>

          <p style={{ marginBottom: 0 }}>
            {aiError}
          </p>
        </div>
      )}

      {/* ========================================
          AI HABIT COACH
      ======================================== */}

      <h2>🤖 AI Habit Coach</h2>

      {aiLoading && !aiInsight ? (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            marginBottom: "30px",
          }}
        >
          Generating personalized AI insights...
        </div>
      ) : aiInsight ? (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            marginBottom: "30px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <h3>
            Your Performance Summary
          </h3>

          <p
            style={{
              color: "#555",
              lineHeight: "1.7",
            }}
          >
            {aiInsight.performanceSummary ||
              "AI analysis is available based on your habit performance."}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "25px",
            }}
          >
            <AIInfoCard
              title="🏆 Strongest Area"
              content={
                aiInsight.strongestArea ||
                "Keep maintaining your strongest habits."
              }
            />

            <AIInfoCard
              title="⚠️ Improvement Area"
              content={
                aiInsight.improvementArea ||
                "Focus on improving consistency."
              }
            />
          </div>

          {/* RECOMMENDATIONS */}

          <div style={{ marginTop: "25px" }}>
            <h3>
              🎯 AI Recommendations
            </h3>

            {Array.isArray(
              aiInsight.recommendations
            ) &&
            aiInsight.recommendations.length >
              0 ? (
              <ol
                style={{
                  paddingLeft: "22px",
                  lineHeight: "1.9",
                  color: "#444",
                }}
              >
                {aiInsight.recommendations.map(
                  (recommendation, index) => (
                    <li key={index}>
                      {recommendation}
                    </li>
                  )
                )}
              </ol>
            ) : (
              <p>
                Continue tracking your habits to
                receive more personalized
                recommendations.
              </p>
            )}
          </div>

          {/* AI STATUS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginTop: "25px",
            }}
          >
            <StatusCard
              title="Consistency"
              value={
                aiInsight.consistencyStatus ||
                riskAnalysis?.consistencyStatus ||
                "No Data"
              }
              message={
                aiInsight.consistencyMessage ||
                "Based on your habit completion data."
              }
            />

            <StatusCard
              title="Risk Level"
              value={
                aiInsight.riskLevel ||
                riskAnalysis?.riskLevel ||
                "No Data"
              }
              message={
                aiInsight.riskMessage ||
                "Risk is calculated from your habit performance."
              }
            />

            <StatusCard
              title="Weekly Trend"
              value={
                aiInsight.weeklyTrend ||
                riskAnalysis?.weeklyTrend ||
                "No Data"
              }
              message="Based on your verified habit analytics."
            />
          </div>
        </div>
      ) : (
        !aiError && (
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "30px",
            }}
          >
            Click <strong>Refresh AI</strong> to
            generate personalized insights.
          </div>
        )
      )}

      {/* ========================================
          IMPROVEMENT PLAN
      ======================================== */}

      <h2>
        🎯 Personalized Improvement Plan
      </h2>

      {aiLoading && !improvementPlan ? (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            marginBottom: "30px",
          }}
        >
          Creating your personalized improvement
          plan...
        </div>
      ) : improvementPlan ? (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "14px",
            marginBottom: "30px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "8px",
                }}
              >
                {improvementPlan.goal ||
                  "Improve Habit Consistency"}
              </h3>

              <p style={{ color: "#666" }}>
                Focus Habit:{" "}
                <strong>
                  {improvementPlan.focusHabit ||
                    "Your lowest performing habit"}
                </strong>
              </p>
            </div>

            <PriorityBadge
              priority={
                improvementPlan.priority ||
                "Medium"
              }
            />
          </div>

          {/* REASON */}

          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#f8fafc",
              borderRadius: "10px",
            }}
          >
            <strong>
              Why this matters:
            </strong>

            <p
              style={{
                marginBottom: 0,
                color: "#555",
                lineHeight: "1.6",
              }}
            >
              {improvementPlan.reason ||
                "Improving consistency will help you build stronger long-term habits."}
            </p>
          </div>

          {/* ACTIONS */}

          <div style={{ marginTop: "25px" }}>
            <h3>
              Your 3 Action Steps
            </h3>

            {Array.isArray(
              improvementPlan.actions
            ) &&
            improvementPlan.actions.length >
              0 ? (
              <ol
                style={{
                  paddingLeft: "22px",
                  lineHeight: "2",
                  color: "#444",
                }}
              >
                {improvementPlan.actions.map(
                  (action, index) => (
                    <li key={index}>
                      {action}
                    </li>
                  )
                )}
              </ol>
            ) : (
              <p>
                Keep tracking your habits to
                generate a detailed action plan.
              </p>
            )}
          </div>

          {/* SHORT TERM TARGET */}

          <div
            style={{
              marginTop: "20px",
              padding: "18px",
              background: "#eef2ff",
              borderRadius: "10px",
            }}
          >
            <strong>
              🎯 Short-Term Target
            </strong>

            <p
              style={{
                marginBottom: 0,
                marginTop: "8px",
              }}
            >
              {improvementPlan.shortTermTarget ||
                "Improve your completion rate during the next week."}
            </p>
          </div>

          {/* ENCOURAGEMENT */}

          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "500",
              color: "#4f46e5",
            }}
          >
            💪{" "}
            {improvementPlan.encouragement ||
              "Small consistent actions create big results!"}
          </div>
        </div>
      ) : (
        !aiError && (
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "30px",
            }}
          >
            Click <strong>Refresh AI</strong> to
            generate your personalized improvement
            plan.
          </div>
        )
      )}

      {/* ========================================
          WEEKLY ANALYTICS
      ======================================== */}

      <h2>Weekly Analytics</h2>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3>{weeklyData?.period}</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
          }}
        >
          <StatCard
            title="Total Scheduled"
            value={weeklyData?.totalLogs || 0}
          />

          <StatCard
            title="Completed"
            value={weeklyData?.completed || 0}
          />

          <StatCard
            title="Incomplete"
            value={weeklyData?.incomplete || 0}
          />

          <StatCard
            title="Completion Rate"
            value={`${weeklyData?.completionPercentage || 0}%`}
          />
        </div>
      </div>

      {/* ========================================
          MONTHLY ANALYTICS
      ======================================== */}

      <h2>Monthly Analytics</h2>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3>
          {monthlyData?.month}{" "}
          {monthlyData?.year}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
          }}
        >
          <StatCard
            title="Total Scheduled"
            value={monthlyData?.totalLogs || 0}
          />

          <StatCard
            title="Completed"
            value={monthlyData?.completed || 0}
          />

          <StatCard
            title="Incomplete"
            value={monthlyData?.incomplete || 0}
          />

          <StatCard
            title="Completion Rate"
            value={`${monthlyData?.completionPercentage || 0}%`}
          />
        </div>
      </div>

      {/* ========================================
          HABIT PERFORMANCE
      ======================================== */}

      <h2>Habit Performance</h2>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        {!performanceData?.habitPerformance ||
        performanceData.habitPerformance.length ===
          0 ? (
          <p>No habits available.</p>
        ) : (
          performanceData.habitPerformance.map(
            (habit) => (
              <div
                key={habit.habitId}
                style={{
                  padding: "18px 0",
                  borderBottom:
                    "1px solid #eee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <strong>
                    {habit.habitTitle}
                  </strong>

                  <strong>
                    {
                      habit.completionPercentage
                    }
                    %
                  </strong>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    background: "#eee",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(
                        habit.completionPercentage ||
                          0,
                        100
                      )}%`,
                      height: "100%",
                      background: "#4CAF50",
                    }}
                  />
                </div>

                <p
                  style={{
                    color: "#666",
                    marginBottom: 0,
                  }}
                >
                  Completed:{" "}
                  {habit.completedDays || 0} /{" "}
                  {habit.totalDays || 0} days
                </p>
              </div>
            )
          )
        )}
      </div>

      {/* ========================================
          HABIT INSIGHTS
      ======================================== */}

      <h2>Habit Insights</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h3>
            🏆 Best Performing Habit
          </h3>

          {performanceData?.bestPerformingHabit ? (
            <>
              <h4>
                {
                  performanceData
                    .bestPerformingHabit
                    .habitTitle
                }
              </h4>

              <p>
                {
                  performanceData
                    .bestPerformingHabit
                    .completionPercentage
                }
                % completion rate
              </p>
            </>
          ) : (
            <p>
              No habit has reached the strong
              performance threshold yet.
            </p>
          )}
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
          }}
        >
          <h3>⚠️ Needs Attention</h3>

          {performanceData?.worstPerformingHabit ? (
            <>
              <h4>
                {
                  performanceData
                    .worstPerformingHabit
                    .habitTitle
                }
              </h4>

              <p>
                {
                  performanceData
                    .worstPerformingHabit
                    .completionPercentage
                }
                % completion rate
              </p>
            </>
          ) : (
            <p>
              All habits are performing well!
            </p>
          )}
        </div>
      </div>

      {/* ========================================
          RISK ANALYSIS
      ======================================== */}

      <h2>Risk Analysis</h2>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            title="Weekly Trend"
            value={
              riskAnalysis?.weeklyTrend ||
              "No Data"
            }
          />

          <StatCard
            title="Data Quality"
            value={
              riskAnalysis?.dataQuality ||
              "Limited"
            }
          />

          <StatCard
            title="Strong Habits"
            value={
              riskAnalysis?.strongHabitCount ||
              0
            }
          />

          <StatCard
            title="Habits Needing Attention"
            value={
              riskAnalysis?.habitsNeedingAttention ||
              0
            }
          />
        </div>

        <h3>Reasons</h3>

        {riskAnalysis?.riskReasons?.length >
        0 ? (
          <ul>
            {riskAnalysis.riskReasons.map(
              (reason, index) => (
                <li key={index}>
                  {reason}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>
            No major risk factors detected.
          </p>
        )}
      </div>
    </div>
  );
}

// ========================================
// STAT CARD
// ========================================

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#666",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          marginBottom: 0,
          marginTop: "10px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

// ========================================
// AI INFO CARD
// ========================================

function AIInfoCard({ title, content }) {
  return (
    <div
      style={{
        padding: "20px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <h4>{title}</h4>

      <p
        style={{
          color: "#555",
          lineHeight: "1.6",
          marginBottom: 0,
        }}
      >
        {content}
      </p>
    </div>
  );
}

// ========================================
// STATUS CARD
// ========================================

function StatusCard({
  title,
  value,
  message,
}) {
  return (
    <div
      style={{
        padding: "18px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#666",
        }}
      >
        {title}
      </p>

      <h3
        style={{
          margin: "8px 0",
        }}
      >
        {value}
      </h3>

      <p
        style={{
          marginBottom: 0,
          color: "#666",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        {message}
      </p>
    </div>
  );
}

// ========================================
// PRIORITY BADGE
// ========================================

function PriorityBadge({ priority }) {
  const priorityStyles = {
    High: {
      background: "#fee2e2",
      color: "#dc2626",
    },

    Medium: {
      background: "#fef3c7",
      color: "#d97706",
    },

    Low: {
      background: "#dcfce7",
      color: "#16a34a",
    },
  };

  const style =
    priorityStyles[priority] ||
    priorityStyles.Medium;

  return (
    <div
      style={{
        padding: "10px 16px",
        borderRadius: "20px",
        fontWeight: "bold",
        ...style,
      }}
    >
      Priority: {priority || "Medium"}
    </div>
  );
}

export default Analytics;