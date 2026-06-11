import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Modal, Form, Button, Alert } from "react-bootstrap";

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "", color: "", checks: {} };
  const checks = {
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  if (password.length < 8 || passed <= 2) return { level: 1, label: "Débil", color: "#dc3545", checks };
  if (passed === 3) return { level: 2, label: "Medio", color: "#ffc107", checks };
  return { level: 3, label: "Fuerte", color: "#198754", checks };
}

function AuthModal({ show, onHide, initialView = "login" }) {
  const [view, setView] = useState(initialView);
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { login, Register } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  useEffect(() => {
    if (show) {
      setView(initialView);
      setFormData({ nombre: "", email: "", password: "", confirmPassword: "" });
      setError("");
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [show, initialView]);

  useEffect(() => {
    if (view === "login") {
      const t1 = setTimeout(() => setFormKey(Date.now()), 20);
      return () => clearTimeout(t1);
    }
  }, [view]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nombre" && /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/.test(value)) return;
    setFormData({ ...formData, [name]: value });
  };

  const switchView = (next) => {
    setView(next);
    setError("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (view === "register" && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

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
          setFormData({ nombre: "", email: "", password: "", confirmPassword: "" });
        }
      } else {
        const { confirmPassword, ...registerData } = formData;
        const result = await Register(registerData);
        if (result.success) {
          switchView("login");
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
            {view === "login" ? "Bienvenido de vuelta" : "Crear tu cuenta"}
          </p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {view === "login" && (
          <>
            <input type="text" name="fakeusernameremembered" style={{ display: "none" }} autoComplete="username" />
            <input type="password" name="fakepasswordremembered" style={{ display: "none" }} autoComplete="new-password" />
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

          <Form.Group className={view === "register" ? "mb-2" : "mb-4"}>
            <Form.Label>Contraseña</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </Form.Group>

          {view === "register" && formData.password.length > 0 && (
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-1">
                <div className="flex-grow-1 d-flex gap-1">
                  {[1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        height: 4,
                        flex: 1,
                        borderRadius: 2,
                        backgroundColor: strength.level >= lvl ? strength.color : "#dee2e6",
                        transition: "background-color 0.2s",
                      }}
                    />
                  ))}
                </div>
                <small style={{ color: strength.color, fontWeight: 600, minWidth: 42 }}>
                  {strength.label}
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { key: "upper", label: "Mayúscula" },
                  { key: "lower", label: "Minúscula" },
                  { key: "number", label: "Número" },
                  { key: "special", label: "Símbolo" },
                ].map(({ key, label }) => (
                  <small
                    key={key}
                    style={{ color: strength.checks[key] ? "#198754" : "#6c757d", fontSize: "0.75rem" }}
                  >
                    {strength.checks[key] ? "✓" : "○"} {label}
                  </small>
                ))}
              </div>
            </div>
          )}

          {view === "register" && (
            <Form.Group className="mb-4">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <div className="input-group has-validation">
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  required
                  autoComplete="new-password"
                  isValid={passwordsMatch}
                  isInvalid={passwordsMismatch}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
              {formData.confirmPassword.length > 0 && (
                <small style={{ color: passwordsMatch ? "#198754" : "#dc3545" }}>
                  {passwordsMatch ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                </small>
              )}
            </Form.Group>
          )}

          <Button
            variant="success"
            type="submit"
            className="w-100"
            disabled={loading || (view === "register" && passwordsMismatch)}
          >
            {loading
              ? view === "login" ? "Ingresando..." : "Registrando..."
              : view === "login" ? "Ingresar" : "Registrar"}
          </Button>

          <Button
            variant="outline-success"
            className="w-100 mt-2"
            onClick={() => switchView(view === "login" ? "register" : "login")}
          >
            {view === "login" ? "Registrar nuevo cliente" : "¿Ya tienes cuenta? Ingresar"}
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
