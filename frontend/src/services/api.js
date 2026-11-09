import axios from "axios";

const DEFAULT_API_URL = "http://localhost:3000/api";

export function getApiBaseUrl() {
  return (
    localStorage.getItem("apiBaseUrl") || DEFAULT_API_URL
  ).replace(/\/+$/, "");
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setApiBaseUrl(url) {
  const cleanUrl = url.trim().replace(/\/+$/, "");

  localStorage.setItem("apiBaseUrl", cleanUrl);

  api.defaults.baseURL = cleanUrl;
}

export default api;
