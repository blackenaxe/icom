import axios from "axios";
import storage from "./storage"; // ✅ Platform uyumlu storage import

const api = axios.create({
  baseURL: "http://192.168.1.83:8000", // Backend IP/port
});

// Token varsa otomatik ekle (platforma uygun)
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Elle token ayarlamak istersen (opsiyonel)
export async function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await storage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    await storage.removeItem("token");
  }
}

export default api;
