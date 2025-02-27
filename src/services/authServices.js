import axios from "axios";

const API_URL = "http://localhost:5173/api"; // Update this to match your backend URL

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
}; 