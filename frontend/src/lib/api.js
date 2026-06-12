import axios from "axios";

// Default to same-origin "/api" when REACT_APP_BACKEND_URL isn't set
// (e.g. on Vercel, where the app and API share one domain).
const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("p90_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function avatarUrl(seed) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || "fan")}&backgroundColor=1a1f2e&textColor=FFD700&fontWeight=700`;
}

export default api;
