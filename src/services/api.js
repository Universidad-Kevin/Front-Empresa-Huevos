import axios from 'axios';

// Configurar axios para conectarse al backend
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('huevos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - hacer logout
      localStorage.removeItem('huevos_token');
      localStorage.removeItem('huevos_user');
      window.location.href = '/login';
    }
    
    // Manejar errores de conexión
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Error de conexión con el servidor');
    }
    
    return Promise.reject(error);
  }
);

export default api;