const User = require("../models/User");

const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  // Explicitly select password because password has select: false
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // Compare entered password with hashed password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
};