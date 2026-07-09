import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("recstacy_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Centralize "invalid/expired token" handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("recstacy_token");
      localStorage.removeItem("recstacy_user");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Small helper so callers can write: const {data} = await call(...)
// and always get back a normalized { success, message, ...payload }
export const apiMessage = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || fallback;

export default api;
