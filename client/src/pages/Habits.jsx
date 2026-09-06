import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
} from "../services/habitService";

import "./Habits.css";

function Habits() {
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingHabit, setEditingHabit] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    frequency: "daily",
    targetDays: [],
  });

  // ================================
  // FETCH HABITS
  // ================================

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getHabits();

      setHabits(response.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load habits"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // ================================
  // FORM HANDLING
  // ================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================================
  // CREATE / UPDATE
  // ================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Habit title is required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingHabit) {
        await updateHabit(
          editingHabit._id,
          formData
        );

        setSuccess(
          "Habit updated successfully"
        );
      } else {
        await createHabit(formData);

        setSuccess(
          "Habit created successfully"
        );
      }

      resetForm();

      await fetchHabits();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to save habit"
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // EDIT
  // ================================

  const handleEdit = (habit) => {
    setEditingHabit(habit);

    setFormData({
      title: habit.title || "",
      description: habit.description || "",
      category: habit.category || "General",
      frequency: habit.frequency || "daily",
      targetDays: habit.targetDays || [],
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================================
  // DELETE
  // ================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this habit?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteHabit(id);

      setSuccess(
        "Habit deleted successfully"
      );

      await fetchHabits();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to delete habit"
      );
    }
  };

  // ================================
  // RESET FORM
  // ================================

  const resetForm = () => {
    setEditingHabit(null);

    setFormData({
      title: "",
      description: "",
      category: "General",
      frequency: "daily",
      targetDays: [],
    });
  };

  // ================================
  // CHECK TODAY'S COMPLETION
  // ================================

  const isCompletedToday = (habit) => {
    if (!habit.completedDates?.length) {
      return false;
    }

    const today = new Date();

    return habit.completedDates.some(
      (date) => {
        const completedDate =
          new Date(date);

        return (
          completedDate.getFullYear() ===
            today.getFullYear() &&
          completedDate.getMonth() ===
            today.getMonth() &&
          completedDate.getDate() ===
            today.getDate()
        );
      }
    );
  };

  // ================================
  // TOGGLE COMPLETION
  // ================================

  const handleToggleCompletion = async (
    id
  ) => {
    try {
      setError("");
      setSuccess("");

      await toggleHabitCompletion(id);

      setSuccess(
        "Habit completion updated"
      );

      await fetchHabits();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to update habit completion"
      );
    }
  };

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="habits-loading">
        <div className="habits-loading-spinner"></div>

        <p>Loading your habits...</p>
      </div>
    );
  }

  // ================================
  // UI
  // ================================

  return (
    <div className="habits-container">

      {/* ================================
          HEADER
      ================================= */}

      <header className="habits-header">
        <div className="habits-brand">
          <div className="habits-brand-icon">
            ⚡
          </div>

          <div>
            <span className="habits-eyebrow">
              HABIT MANAGEMENT
            </span>

            <h1>My Habits</h1>

            <p>
              Build consistency. Track progress.
              Keep improving.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="back-dashboard-btn"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>
      </header>

      {/* ================================
          MESSAGES
      ================================= */}

      {error && (
        <div className="habits-message habits-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="habits-message habits-success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* ================================
          CREATE / EDIT FORM
      ================================= */}

      <section className="habit-form-card">

        <div className="form-card-header">
          <div>
            <span className="section-eyebrow">
              {editingHabit
                ? "UPDATE YOUR ROUTINE"
                : "START A NEW ROUTINE"}
            </span>

            <h2>
              {editingHabit
                ? "Edit Habit"
                : "Create New Habit"}
            </h2>

            <p>
              {editingHabit
                ? "Make changes to your habit and keep moving forward."
                : "Add something meaningful that you want to do consistently."}
            </p>
          </div>

          <div className="form-header-icon">
            {editingHabit ? "✏️" : "➕"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">
              Habit Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Morning Exercise"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What does this habit mean to you?"
              rows="3"
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="General">
                  General
                </option>

                <option value="Health">
                  Health
                </option>

                <option value="Fitness">
                  Fitness
                </option>

                <option value="Study">
                  Study
                </option>

                <option value="Work">
                  Work
                </option>

                <option value="Personal">
                  Personal
                </option>

                <option value="Finance">
                  Finance
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="frequency">
                Frequency
              </label>

              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option value="daily">
                  Daily
                </option>

                <option value="weekly">
                  Weekly
                </option>
              </select>
            </div>

          </div>

          <div className="form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingHabit
                ? "✓ Update Habit"
                : "＋ Create Habit"}
            </button>

            {editingHabit && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </section>

      {/* ================================
          HABITS LIST
      ================================= */}

      <section className="habits-list-section">

        <div className="list-section-header">

          <div>
            <span className="section-eyebrow">
              YOUR ROUTINE
            </span>

            <h2>Your Habits</h2>

            <p>
              {habits.length} active habit
              {habits.length !== 1
                ? "s"
                : ""}{" "}
              being tracked
            </p>
          </div>

          <div className="habit-count-badge">
            {habits.length}
          </div>

        </div>

        {habits.length === 0 ? (
          <div className="empty-habits">

            <div className="empty-icon">
              🌱
            </div>

            <h3>
              No habits yet
            </h3>

            <p>
              Create your first habit above
              and start building your
              consistency streak.
            </p>

            <button
              type="button"
              className="empty-action"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
            >
              ＋ Create Your First Habit
            </button>

          </div>
        ) : (
          <div className="habits-grid">

            {habits.map((habit) => {

              const completedToday =
                isCompletedToday(habit);

              const completedCount =
                habit.completedDates?.length ||
                0;

              return (
                <article
                  className={`habit-item ${
                    completedToday
                      ? "habit-completed"
                      : ""
                  }`}
                  key={habit._id}
                >

                  {/* CARD TOP */}

                  <div className="habit-item-top">

                    <div className="habit-title-area">

                      <div className="habit-icon">
                        {completedToday
                          ? "✓"
                          : "⚡"}
                      </div>

                      <div>
                        <h3>
                          {habit.title}
                        </h3>

                        <div className="habit-badges">
                          <span className="category-badge">
                            {habit.category}
                          </span>

                          <span className="frequency-badge">
                            {habit.frequency}
                          </span>
                        </div>
                      </div>

                    </div>

                    <div
                      className={
                        completedToday
                          ? "today-status completed-status"
                          : "today-status"
                      }
                    >
                      {completedToday
                        ? "Done today"
                        : "Today"}
                    </div>

                  </div>

                  {/* DESCRIPTION */}

                  {habit.description && (
                    <p className="habit-description">
                      {habit.description}
                    </p>
                  )}

                  {/* STATS */}

                  <div className="habit-stats">

                    <div className="habit-stat">

                      <span className="habit-stat-icon">
                        🔥
                      </span>

                      <div>
                        <span>
                          Current Streak
                        </span>

                        <strong>
                          {habit.streak || 0}
                        </strong>

                        <small>
                          days
                        </small>
                      </div>

                    </div>

                    <div className="habit-stat">

                      <span className="habit-stat-icon">
                        🏆
                      </span>

                      <div>
                        <span>
                          Best Streak
                        </span>

                        <strong>
                          {habit.longestStreak ||
                            0}
                        </strong>

                        <small>
                          days
                        </small>
                      </div>

                    </div>

                    <div className="habit-stat">

                      <span className="habit-stat-icon">
                        📅
                      </span>

                      <div>
                        <span>
                          Completed
                        </span>

                        <strong>
                          {completedCount}
                        </strong>

                        <small>
                          times
                        </small>
                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="habit-actions">

                    <button
                      type="button"
                      className={
                        completedToday
                          ? "complete-btn completed"
                          : "complete-btn"
                      }
                      onClick={() =>
                        handleToggleCompletion(
                          habit._id
                        )
                      }
                    >
                      {completedToday
                        ? "✓ Completed Today"
                        : "✓ Mark Complete Today"}
                    </button>

                    <button
                      type="button"
                      className="details-btn"
                      onClick={() =>
                        navigate(
                          `/habits/${habit._id}`
                        )
                      }
                    >
                      📊 Analytics
                    </button>

                    <div className="secondary-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(habit)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(
                            habit._id
                          )
                        }
                      >
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

    </div>
  );
}

export default Habits;