import axios from "axios";
import toast  from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || "Something went wrong";
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (err.response?.status >= 500) {
      toast.error("Server error — please try again");
    }
    return Promise.reject({ ...err, message });
  }
);

export default api;
