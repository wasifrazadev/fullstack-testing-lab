import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function checkBackendHealth() {
  const response = await axios.get(`${API_URL}/health`, {
    timeout: 3000,
  });

  return response.data;
}