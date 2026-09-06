import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHabitById } from "../services/habitService";
import {
  getHabitStreak,
  getHabitCompletion,
} from "../services/analyticsService";
import "./HabitDetails.css";

function HabitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [habit, setHabit] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [completionData, setCompletionData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHabitDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const today = new Date();

        const startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        const endDate = today;

        const [
          habitResponse,
          streakResponse,
          completionResponse,
        ] = await Promise.all([
          getHabitById(id),
          getHabitStreak(id),
          getHabitCompletion(
            id,
            startDate.toISOString(),
            endDate.toISOString()
          ),
        ]);

        setHabit(habitResponse.data);
        setStreakData(streakResponse.data);
        setCompletionData(completionResponse.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load habit details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHabitDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="habit-details-loading">
        Loading habit analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="habit-details-container">
        <div className="habit-details-error">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate("/habits")}
        >
          Back to Habits
        </button>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="habit-details-container">
        <p>Habit not found.</p>

        <button
          type="button"
          onClick={() => navigate("/habits")}
        >
          Back to Habits
        </button>
      </div>
    );
  }

  return (
    <div className="habit-details-container">

      {/* HEADER */}
      <div className="habit-details-header">
        <div>
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/habits")}
          >
            ← Back to Habits
          </button>

          <h1>{habit.title}</h1>

          {habit.description && (
            <p>{habit.description}</p>
          )}
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="habit-info">
        <div>
          <span>Category</span>
          <strong>{habit.category}</strong>
        </div>

        <div>
          <span>Frequency</span>
          <strong>{habit.frequency}</strong>
        </div>
      </div>

      {/* ANALYTICS CARDS */}
      <section className="habit-stats-grid">

        {/* CURRENT STREAK */}
        <div className="habit-stat-card">
          <span className="habit-stat-icon">🔥</span>

          <div>
            <p>Current Streak</p>

            <h2>
              {streakData?.currentStreak ?? 0}
            </h2>

            <span>days</span>
          </div>
        </div>

        {/* LONGEST STREAK */}
        <div className="habit-stat-card">
          <span className="habit-stat-icon">🏆</span>

          <div>
            <p>Longest Streak</p>

            <h2>
              {streakData?.longestStreak ?? 0}
            </h2>

            <span>days</span>
          </div>
        </div>

        {/* COMPLETION RATE */}
        <div className="habit-stat-card">
          <span className="habit-stat-icon">📊</span>

          <div>
            <p>Completion Rate</p>

            <h2>
              {completionData?.completionPercentage ?? 0}%
            </h2>

            <span>this month</span>
          </div>
        </div>

        {/* COMPLETED DAYS */}
        <div className="habit-stat-card">
          <span className="habit-stat-icon">✅</span>

          <div>
            <p>Completed Days</p>

            <h2>
              {completionData?.completedDays ?? 0}
            </h2>

            <span>
              of {completionData?.totalDays ?? 0}
            </span>
          </div>
        </div>

      </section>

      {/* PERFORMANCE OVERVIEW */}
      <section className="habit-details-card">
        <h2>📈 Performance Overview</h2>

        <div className="performance-summary">

          <div>
            <span>Scheduled Days</span>

            <strong>
              {completionData?.totalDays ?? 0}
            </strong>
          </div>

          <div>
            <span>Completed</span>

            <strong>
              {completionData?.completedDays ?? 0}
            </strong>
          </div>

          <div>
            <span>Incomplete</span>

            <strong>
              {completionData?.incompleteDays ?? 0}
            </strong>
          </div>

        </div>

        <div className="completion-progress">

          <div className="completion-progress-header">
            <span>Monthly Progress</span>

            <strong>
              {completionData?.completionPercentage ?? 0}%
            </strong>
          </div>

          <div className="completion-progress-track">

            <div
              className="completion-progress-fill"
              style={{
                width: `${
                  completionData?.completionPercentage ?? 0
                }%`,
              }}
            />

          </div>

        </div>
      </section>

      {/* COMPLETION HISTORY */}
      <section className="habit-details-card">
        <h2>📅 Completion History</h2>

        {habit.completedDates?.length > 0 ? (
          <div className="completed-dates">

            {habit.completedDates
              .slice()
              .sort(
                (a, b) =>
                  new Date(b) - new Date(a)
              )
              .map((date, index) => (
                <div
                  className="completed-date"
                  key={`${date}-${index}`}
                >
                  ✓{" "}
                  {new Date(date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </div>
              ))}

          </div>
        ) : (
          <p className="empty-text">
            No completed days yet.
          </p>
        )}
      </section>

    </div>
  );
}

export default HabitDetails;