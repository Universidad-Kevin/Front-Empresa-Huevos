import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Modal, Form, Button, Alert } from "react-bootstrap";

function AuthModal({ show, onHide, initialView = "login" }) {
  const [view, setView] = useState(initialView); // "login" or "register"
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());

  const { login, Register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      setView(initialView);
      setFormData({ nombre: "", email: "", password: "" });
      setError("");
    }
  }, [show, initialView]);

  useEffect(() => {
    if (view === "login") {
      const t1 = setTimeout(() => setFormKey(Date.now()), 20);
      return () => clearTimeout(t1);
    }
  }, [view]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (view === "login") {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          onHide();
          const rol = result.data?.rol;
          navigate(rol === "admin" ? "/admin" : rol === "mayorista" ? "/mayorista" : "/");
        } else {
          setError(result.error || "Credenciales inválidas");
        }
      } else {
        const result = await Register(formData);
        if (result.success) {
          setView("login");
          setError(""); // Opcional: mostrar un mensaje de éxito
        } else {
          setError(result.error || "No se pudo crear el usuario");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold text-success">
          {view === "login" ? "Ingresar" : "Registro"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <p className="text-muted">
            {view === "login"
              ? "Bienvenido de vuelta"
              : "Crear tu cuenta"}
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Inputs ocultos anti-autofill (útil para login) */}
        {view === "login" && (
          <>
            <input
              type="text"
              name="fakeusernameremembered"
              style={{ display: "none" }}
              autoComplete="username"
            />
            <input
              type="password"
              name="fakepasswordremembered"
              style={{ display: "none" }}
              autoComplete="new-password"
            />
          </>
        )}

        <Form key={formKey} onSubmit={handleSubmit} autoComplete="off">
          {view === "register" && (
            <Form.Group className="mb-3">
              <Form.Label>Nombres y Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombres y Apellidos"
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={view === "login" ? "email@example.com" : "Email"}
              required
              autoComplete="off"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
              autoComplete="new-password"
            />
          </Form.Group>

          <Button
            variant="success"
            type="submit"
            className="w-100"
            disabled={loading}
          >
            {loading
              ? view === "login"
                ? "Ingresando..."
                : "Registrando..."
              : view === "login"
                ? "Ingresar"
                : "Registrar"}
          </Button>

          <Button
            variant="outline-success"
            className="w-100 mt-2"
            onClick={() => {
              setView(view === "login" ? "register" : "login");
              setError("");
            }}
          >
            {view === "login"
              ? "Registrar nuevo cliente"
              : "¿Ya tienes cuenta? Ingresar"}
          </Button>

          {view === "login" && (
            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-link p-0 text-muted small text-decoration-none"
                onClick={() => { onHide(); navigate("/recuperar-password"); }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AuthModal;
