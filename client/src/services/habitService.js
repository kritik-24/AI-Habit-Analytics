import axios from "axios";

const API_URL = "http://localhost:5000/api/habits";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// GET ALL HABITS
export const getHabits = async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
};

// GET SINGLE HABIT
export const getHabitById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    getAuthConfig()
  );

  return response.data;
};

// CREATE HABIT
export const createHabit = async (habitData) => {
  const response = await axios.post(
    API_URL,
    habitData,
    getAuthConfig()
  );

  return response.data;
};

// UPDATE HABIT
export const updateHabit = async (id, habitData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    habitData,
    getAuthConfig()
  );

  return response.data;
};

// DELETE HABIT
export const deleteHabit = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthConfig()
  );

  return response.data;
};

// TOGGLE HABIT COMPLETION FOR TODAY
export const toggleHabitCompletion = async (id) => {
  const response = await axios.patch(
    `${API_URL}/${id}/toggle`,
    {},
    getAuthConfig()
  );

  return response.data;
};
