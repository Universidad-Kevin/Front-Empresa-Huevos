import { useState } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Error al procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm border-0 p-4">
        <h4 className="mb-1 fw-bold">Recuperar contraseña</h4>
        <p className="text-muted mb-4">Te enviaremos un enlace para restablecer tu contraseña.</p>

        {sent ? (
          <Alert variant="success">
            Si el email está registrado, recibirás un enlace en los próximos minutos.
            <div className="mt-2">
              <Link to="/">Volver al inicio</Link>
            </div>
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>
            <Button type="submit" variant="success" className="w-100" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
            <div className="text-center mt-3">
              <Link to="/" className="text-muted small">Volver al inicio</Link>
            </div>
          </Form>
        )}
      </Card>
    </Container>
  );
}
