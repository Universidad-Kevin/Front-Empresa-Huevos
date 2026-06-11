import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const estadoVariant = {
  pendiente: "warning", confirmado: "info", preparando: "secondary",
  enviado: "primary", entregado: "success", cancelado: "danger", devuelto: "dark",
};
const estadoLabel = {
  pendiente: "Pendiente", confirmado: "Confirmado", preparando: "En Preparación",
  enviado: "En Camino", entregado: "Entregado", cancelado: "Cancelado", devuelto: "Devuelto",
};

function DashboardMayorista() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/mayorista/pedidos")
      .then(({ data }) => setPedidos(data.data))
      .catch(() => setError("No se pudieron cargar tus pedidos."))
      .finally(() => setLoading(false));
  }, []);

  const activos = pedidos.filter(p => !["entregado", "devuelto", "cancelado"].includes(p.estado));
  const total = pedidos.reduce((s, p) => s + parseFloat(p.total || 0), 0);
  const ultimoPedido = pedidos[0];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Bienvenido, {user?.nombre}</h1>
          <p className="text-muted">{user?.nombre_empresa} · Portal Mayorista</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Stats */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="border-0 bg-warning bg-opacity-10 h-100">
            <Card.Body className="text-center">
              <h2 className="text-warning">{activos.length}</h2>
              <Card.Text className="text-muted">Pedidos activos</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 bg-success bg-opacity-10 h-100">
            <Card.Body className="text-center">
              <h2 className="text-success">{pedidos.length}</h2>
              <Card.Text className="text-muted">Total pedidos</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 bg-primary bg-opacity-10 h-100">
            <Card.Body className="text-center">
              <h2 className="text-primary">S/.{total.toFixed(2)}</h2>
              <Card.Text className="text-muted">Monto total</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Último pedido */}
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center">
              <span>Último Pedido</span>
              <Button as={Link} to="/mayorista/pedidos" size="sm" variant="outline-success">
                Ver todos →
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p className="text-muted">Cargando...</p>
              ) : !ultimoPedido ? (
                <p className="text-muted text-center py-3">Aún no tienes pedidos registrados.</p>
              ) : (
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="mb-1">Pedido #{ultimoPedido.id}</h5>
                      <small className="text-muted">
                        {new Date(ultimoPedido.creado_en).toLocaleDateString("es-PE", { dateStyle: "long" })}
                      </small>
                    </div>
                    <Badge bg={estadoVariant[ultimoPedido.estado]} className="fs-6 px-3">
                      {estadoLabel[ultimoPedido.estado]}
                    </Badge>
                  </div>
                  <div className="mb-3">
                    {ultimoPedido.items?.map(item => (
                      <div key={item.id} className="d-flex justify-content-between py-1 border-bottom small">
                        <span>{item.nombre_producto} × {item.cantidad}</span>
                        <span className="text-muted">S/.{(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span className="text-success">S/.{parseFloat(ultimoPedido.total).toFixed(2)}</span>
                  </div>
                  <Button as={Link} to={`/mayorista/pedidos/${ultimoPedido.id}`} variant="outline-success" size="sm" className="mt-3 w-100">
                    Ver recibo
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Acciones rápidas */}
        <Col lg={5} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-white fw-bold">Acciones rápidas</Card.Header>
            <Card.Body className="d-flex flex-column gap-3">
              <Button as={Link} to="/mayorista/pedidos" variant="outline-success" className="w-100">
                📋 Ver mis pedidos
              </Button>
              <Button as={Link} to="/mayorista/perfil" variant="outline-primary" className="w-100">
                🏢 Mi empresa
              </Button>
              <Button as={Link} to="/mayorista/contacto" variant="outline-secondary" className="w-100">
                💬 Contactar a CampOrganic
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DashboardMayorista;
