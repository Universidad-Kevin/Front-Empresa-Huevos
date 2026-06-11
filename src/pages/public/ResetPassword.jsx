import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/?reset=ok");
    } catch (err) {
      setError(err.response?.data?.error || "Token inválido o expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Container className="py-5" style={{ maxWidth: 480 }}>
        <Alert variant="danger">
          Enlace inválido. <Link to="/">Volver al inicio</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm border-0 p-4">
        <h4 className="mb-1 fw-bold">Nueva contraseña</h4>
        <p className="text-muted mb-4">Ingresa tu nueva contraseña.</p>

        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3">
            <Form.Label>Nueva contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirmar contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" variant="success" className="w-100" disabled={loading}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </Button>
          <div className="text-center mt-3">
            <Link to="/" className="text-muted small">Cancelar</Link>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
