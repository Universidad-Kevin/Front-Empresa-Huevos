import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Button } from 'react-bootstrap';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SkeletonOrderList, SkeletonOrderDetail } from '../../components/SkeletonLoader';

const estadoVariant = { pendiente: 'warning', procesando: 'info', enviado: 'primary', completado: 'success', cancelado: 'danger' };
const estadoLabel = { pendiente: 'Pendiente', procesando: 'En proceso', enviado: 'Enviado', completado: 'Completado', cancelado: 'Cancelado' };
const metodoPagoLabel = { efectivo: '💵 Pago contra entrega', transferencia: '🏦 Transferencia bancaria', tarjeta: '💳 Tarjeta de crédito/débito' };

function DetallePedido() {
  const { id } = useParams();
  const location = useLocation();
  const [pedido, setPedido] = useState(location.state?.pedido || null);
  const [loading, setLoading] = useState(!pedido);
  const [error, setError] = useState('');
  const nuevo = location.state?.nuevo;

  useEffect(() => {
    if (!pedido) {
      api.get(`/pedidos/${id}`)
        .then(({ data }) => setPedido(data.data))
        .catch(() => setError('No se pudo cargar el pedido.'))
        .finally(() => setLoading(false));
    }
  }, [id, pedido]);

  if (loading) return <SkeletonOrderDetail />;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!pedido) return null;

  return (
    <Container className="py-5">
      {nuevo && (
        <Alert variant="success" className="mb-4">
          ¡Tu pedido fue confirmado exitosamente! Te contactaremos pronto.
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Pedido #{pedido.id}</h2>
          <p className="text-muted mb-0">{new Date(pedido.creado_en).toLocaleDateString('es-ES', { dateStyle: 'long' })}</p>
        </div>
        <Badge bg={estadoVariant[pedido.estado]} className="fs-6 px-3 py-2">
          {estadoLabel[pedido.estado]}
        </Badge>
      </div>

      <Row>
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white fw-bold">Productos</Card.Header>
            <Card.Body>
              {pedido.items?.map(item => (
                <div key={item.id} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <h6 className="mb-0">{item.nombre_producto}</h6>
                    <small className="text-muted">Cantidad: {item.cantidad} × S/.{parseFloat(item.precio_unitario).toFixed(2)}</small>
                  </div>
                  <span className="fw-bold text-success">S/.{(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Código de verificación */}
          {pedido.codigo_verificacion && (
            <Card className="shadow-sm mb-3 border-success">
              <Card.Header className="bg-success text-white fw-bold text-center">
                Código de verificación
              </Card.Header>
              <Card.Body className="text-center py-4">
                <div
                  className="fw-bold text-success mb-2"
                  style={{ fontSize: '2rem', letterSpacing: '0.3rem', fontFamily: 'monospace' }}
                >
                  {pedido.codigo_verificacion}
                </div>
                <small className="text-muted d-block">
                  Muestra este código al retirar tu pedido para que puedan verificarlo.
                </small>
              </Card.Body>
            </Card>
          )}

          <Card className="shadow-sm mb-3">
            <Card.Header className="bg-white fw-bold">Resumen</Card.Header>
            <Card.Body>
              {pedido.metodo_pago && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Método de pago</span>
                  <span className="small">{metodoPagoLabel[pedido.metodo_pago] || pedido.metodo_pago}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Envío</span><span className="text-success">Gratis</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-5 text-success">S/.{parseFloat(pedido.total).toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
          <Button as={Link} to="/mis-pedidos" variant="outline-secondary" className="w-100">
            Ver todos mis pedidos
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/pedidos/mis-pedidos')
      .then(({ data }) => setPedidos(data.data))
      .catch(() => setError('No se pudieron cargar tus pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonOrderList />;

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">Mis Pedidos</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {pedidos.length === 0 ? (
        <Card className="shadow-sm text-center py-5">
          <Card.Body>
            <p className="text-muted mb-3">Aún no tienes pedidos.</p>
            <Button as={Link} to="/productos" variant="success">Explorar Productos</Button>
          </Card.Body>
        </Card>
      ) : (
        pedidos.map(pedido => (
          <Card key={pedido.id} className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-1">Pedido #{pedido.id}</h6>
                  <small className="text-muted">
                    {new Date(pedido.creado_en).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                    {' · '}{pedido.items?.length} producto(s)
                  </small>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-success mb-1">S/.{parseFloat(pedido.total).toFixed(2)}</div>
                  <Badge bg={estadoVariant[pedido.estado]}>{estadoLabel[pedido.estado]}</Badge>
                </div>
              </div>
              <div className="mt-2">
                <Button as={Link} to={`/mis-pedidos/${pedido.id}`} size="sm" variant="outline-success">
                  Ver detalle
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export function MisPedidos() {
  return <ListaPedidos />;
}

export function DetallePedidoPage() {
  return <DetallePedido />;
}
