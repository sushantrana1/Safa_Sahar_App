import axios from "axios";

const api = axios.create({
  baseURL: "https://safa-sahar-project.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT later (Phase 2) — placeholder for now
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;