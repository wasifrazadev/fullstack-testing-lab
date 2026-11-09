import axios from "axios";

export async function checkBackendHealth(baseUrl) {
  const response = await axios.get(`${baseUrl}/health`, {
    timeout: 3000,
  });

  if (response.data.status !== "ok") {
    throw new Error("Backend health check failed.");
  }

  return response.data;
}
