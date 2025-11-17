import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendChatMessage = async (message: string) => {
  try {
    const response = await api.post("/chat", { message });
    return response.data.reply;
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
    throw new Error("Failed to fetch coach response");
  }
};

export default api;
