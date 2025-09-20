// src/services/apiAuth.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const registerUser = (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

export const loginUser = async (loginData) => {
  const response = await axios.post(`${API_URL}/login`, loginData);

  if (response.data.access_token) {
    localStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);
    localStorage.setItem("name", response.data.name);
    localStorage.setItem("surname", response.data.surname);
  }

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("name");
  localStorage.removeItem("surname");
};
