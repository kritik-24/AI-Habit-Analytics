const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const habitRoutes = require("./routes/habitRoutes");
const habitLogRoutes = require("./routes/habitLogRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");

const errorHandler = require("./middleware/errorMiddleware");

// Create Express application
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

// AI routes
app.use("/api/ai", aiRoutes);

// IMPORTANT:
// Habit log routes must come BEFORE habitRoutes
app.use("/api/habits", habitLogRoutes);
app.use("/api/habits", habitRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Habit Analytics API is running",
  });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});