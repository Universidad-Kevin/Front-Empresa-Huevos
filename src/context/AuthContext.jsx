import { createContext, useState, useContext, useEffect } from "react";
import api from "/src/services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("huevos_user");
    const savedToken = localStorage.getItem("huevos_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log("🔐 Intentando login con:", { email, password });

      const response = await api.post("/auth/login", { email, password });

      console.log("📨 Respuesta completa:", response);
      console.log("📊 response.data:", response.data);

      // VERIFICACIÓN DE SEGURIDAD
      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.error || "Error en la respuesta del servidor"
        );
      }

      if (
        !response.data.data ||
        !response.data.data.user ||
        !response.data.data.token
      ) {
        throw new Error("Estructura de respuesta inválida");
      }

      const { user: userData, token } = response.data.data;

      console.log("👤 User data:", userData);
      console.log("🔑 Token:", token);

      // Guardar en localStorage
      localStorage.setItem("huevos_token", token);
      localStorage.setItem("huevos_user", JSON.stringify(userData));

      setUser(userData);
      return { success: true, data: userData };
    } catch (error) {
      console.error("❌ Error en login:", error);

      // Manejo de errores
      let errorMessage = "Error al iniciar sesión";

      if (error.response) {
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          "Error del servidor";
      } else if (error.request) {
        errorMessage = "Error de conexión con el servidor";
      } else {
        errorMessage = error.message || "Error desconocido";
      }

      return { success: false, error: errorMessage };
    }
  };

  const Register = async (formData) => {
    try {
      const response = await api.post("/auth/register", formData);

      return {
        success: response.data?.success || false,
        data: response.data?.data || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al registrar usuario.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("huevos_token");
    localStorage.removeItem("huevos_user");
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    Register,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
