import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form, Badge } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const METODOS_PAGO = [
  {
    id: 'efectivo',
    label: 'Pago contra entrega',
    descripcion: 'Paga en efectivo cuando recibas tu pedido.',
    icono: '💵',
  },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    descripcion: 'Recibirás los datos bancarios por correo después de confirmar.',
    icono: '🏦',
  },
  {
    id: 'tarjeta',
    label: 'Tarjeta de crédito / débito',
    descripcion: 'Pago seguro con tarjeta. Te contactaremos para procesar el cobro.',
    icono: '💳',
  },
];

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) return null;

  const handleConfirmar = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const items = cartItems.map(item => ({
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.precio,
        nombre_producto: item.nombre,
      }));

      const { data } = await api.post('/pedidos', { items, metodo_pago: metodoPago });

      clearCart();
      navigate(`/mis-pedidos/${data.data.id}`, { state: { pedido: data.data, nuevo: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const metodoSeleccionado = METODOS_PAGO.find(m => m.id === metodoPago);

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Finalizar Compra</h1>
          <p className="text-muted">Hola {user.nombre}, revisa tu pedido y elige cómo pagar.</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {/* Columna izquierda */}
        <Col lg={8} className="mb-4">
          {/* Productos */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Tus Productos</h5>
            </Card.Header>
            <Card.Body>
              {cartItems.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No tienes productos para comprar.</p>
                  <Button as={Link} to="/productos" variant="success">Volver a Productos</Button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img
                      src={item.imagen || "/images/placeholder.jpg"}
                      alt={item.nombre}
                      style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                      className="rounded me-3"
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{item.nombre}</h6>
                      <small className="text-muted">{item.quantity} × ${parseFloat(item.precio).toFixed(2)}</small>
                    </div>
                    <div className="fw-bold text-success">
                      ${(item.precio * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          {/* Métodos de pago */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Método de Pago</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {METODOS_PAGO.map(metodo => (
                  <Col key={metodo.id} md={4}>
                    <div
                      onClick={() => setMetodoPago(metodo.id)}
                      className="p-3 rounded border h-100"
                      style={{
                        cursor: 'pointer',
                        borderColor: metodoPago === metodo.id ? '#2D5A27' : '#dee2e6',
                        borderWidth: metodoPago === metodo.id ? '2px' : '1px',
                        backgroundColor: metodoPago === metodo.id ? '#f0f9f0' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <Form.Check
                          type="radio"
                          checked={metodoPago === metodo.id}
                          onChange={() => setMetodoPago(metodo.id)}
                          className="me-2"
                          readOnly
                        />
                        <span className="fs-5 me-2">{metodo.icono}</span>
                        <span className="fw-bold small">{metodo.label}</span>
                      </div>
                      <small className="text-muted">{metodo.descripcion}</small>
                    </div>
                  </Col>
                ))}
              </Row>

              {metodoPago === 'transferencia' && (
                <Alert variant="info" className="mt-3 mb-0">
                  <strong>Datos bancarios:</strong> Los recibirás por correo electrónico al confirmar el pedido. Tienes 48 horas para realizar la transferencia.
                </Alert>
              )}
              {metodoPago === 'tarjeta' && (
                <Alert variant="warning" className="mt-3 mb-0">
                  Un asesor se pondrá en contacto contigo para procesar el pago con tarjeta de forma segura.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Resumen */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Envío</span>
                <span className="text-success">Gratis</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Método de pago</span>
                <Badge bg="secondary">{metodoSeleccionado?.icono} {metodoSeleccionado?.label}</Badge>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold fs-5 text-success">${cartTotal.toFixed(2)}</span>
              </div>

              <Button
                variant="success"
                size="lg"
                className="w-100"
                onClick={handleConfirmar}
                disabled={cartItems.length === 0 || loading}
              >
                {loading
                  ? <><Spinner size="sm" className="me-2" />Procesando...</>
                  : 'Confirmar Pedido'}
              </Button>
              <p className="text-muted text-center mt-2 small">
                Al confirmar aceptas nuestros términos y condiciones.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
