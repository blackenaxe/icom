import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api", // Backend IP/port’unu buraya yaz
});

// Token varsa otomatik ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Elle token ayarlamak istersen (opsiyonel)
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

export default api;
