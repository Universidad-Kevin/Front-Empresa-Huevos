import { useState } from "react";
import { Container, Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ASUNTOS = [
  "Consulta sobre un pedido",
  "Solicitar nuevo pedido",
  "Cambio de datos de empresa",
  "Consulta de precios",
  "Problema con entrega",
  "Otro",
];

function ContactoMayorista() {
  const [formData, setFormData] = useState({ asunto: ASUNTOS[0], mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mensaje.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/mayorista/contacto", formData);
      setSuccess("Mensaje enviado correctamente. Te responderemos pronto.");
      setFormData({ asunto: ASUNTOS[0], mensaje: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar el mensaje.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: 680 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Contactar a CampOrganic</h2>
          <p className="text-muted mb-0 small">Nuestro equipo te responderá a la brevedad</p>
        </div>
        <Button as={Link} to="/mayorista" variant="outline-secondary" size="sm">← Volver</Button>
      </div>

      <Card className="shadow-sm">
        <div style={{ background: "#2D5A27", padding: "18px 28px", borderRadius: "7px 7px 0 0" }}>
          <h5 style={{ color: "#fff", margin: 0 }}>💬 Mensaje directo al equipo</h5>
          <small style={{ color: "#c8e6c9" }}>Tu información de empresa se envía automáticamente</small>
        </div>
        <Card.Body className="p-4">
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Asunto</Form.Label>
              <Form.Select name="asunto" value={formData.asunto} onChange={handleChange}>
                {ASUNTOS.map(a => <option key={a} value={a}>{a}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Mensaje</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Describe tu consulta con el mayor detalle posible..."
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="success" disabled={loading || !formData.mensaje.trim()}>
                {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                Enviar mensaje
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mt-3">
        <Card.Body className="py-3 px-4">
          <p className="mb-0 text-muted small">
            También puedes escribirnos directamente a{" "}
            <a href={`mailto:${import.meta.env.VITE_ADMIN_EMAIL || "camporganic@gmail.com"}`} className="text-success fw-bold">
              {import.meta.env.VITE_ADMIN_EMAIL || "camporganic@gmail.com"}
            </a>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ContactoMayorista;
