import axios from "axios";

// Detecta si estás en producción o desarrollo
const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://back-empresa-huevos.onrender.com/api" 
    : "http://localhost:3000/api";

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos de espera
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("huevos_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("huevos_token");
      localStorage.removeItem("huevos_user");
      window.location.href = "/login";
    }

    if (error.code === "ECONNABORTED" || !error.response) {
      console.error("Error de conexión con el servidor");
    }

    return Promise.reject(error);
  }
);

export default api;
