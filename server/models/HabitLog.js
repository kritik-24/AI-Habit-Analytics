const mongoose = require("mongoose");

const habitLogSchema = new mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    completed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One log per habit per user per day
habitLogSchema.index(
  { habit: 1, user: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model("HabitLog", habitLogSchema);