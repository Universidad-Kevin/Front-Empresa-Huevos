import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../../services/api";

function PerfilMayorista() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/mayorista/perfil")
      .then(({ data }) => setPerfil(data.data))
      .catch(() => setError("No se pudo cargar el perfil."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Container className="py-5"><p className="text-muted">Cargando...</p></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!perfil) return null;

  const campos = [
    { label: "Empresa", value: perfil.nombre_empresa },
    { label: "Contacto", value: perfil.contacto_nombre },
    { label: "Email", value: perfil.email },
    { label: "Teléfono", value: perfil.telefono || "—" },
    { label: "RUC", value: perfil.ruc || "—" },
    { label: "Dirección", value: perfil.direccion || "—" },
    { label: "Límite de crédito", value: `S/.${parseFloat(perfil.limite_credito || 0).toLocaleString()}` },
    { label: "Miembro desde", value: new Date(perfil.creado_en).toLocaleDateString("es-PE", { dateStyle: "long" }) },
  ];

  return (
    <Container className="py-4" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Mi Empresa</h2>
        <Button as={Link} to="/mayorista" variant="outline-secondary" size="sm">← Volver</Button>
      </div>

      <Card className="shadow-sm">
        <div style={{ background: "#2D5A27", padding: "20px 28px", borderRadius: "7px 7px 0 0" }}>
          <h4 style={{ color: "#fff", margin: 0 }}>🏢 {perfil.nombre_empresa}</h4>
          <small style={{ color: "#c8e6c9" }}>Cliente Mayorista · CampOrganic</small>
        </div>
        <Card.Body className="p-4">
          {campos.map(({ label, value }) => (
            <Row key={label} className="mb-3 pb-2 border-bottom">
              <Col xs={4} className="text-muted small fw-bold">{label}</Col>
              <Col xs={8}>{value}</Col>
            </Row>
          ))}
        </Card.Body>
      </Card>

      <Card className="shadow-sm mt-4">
        <Card.Body className="text-center py-4">
          <p className="text-muted mb-3">¿Necesitas actualizar tus datos o tienes alguna consulta?</p>
          <Button as={Link} to="/contacto" variant="success">
            💬 Contactar a CampOrganic
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PerfilMayorista;
