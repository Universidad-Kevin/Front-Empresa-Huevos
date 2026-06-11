import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Alert, Form, Collapse } from 'react-bootstrap';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavoritos } from '../../hooks/useFavoritos';
import { SkeletonProductDetail } from '../../components/SkeletonLoader';
import SeccionValoraciones from '../../components/SeccionValoraciones';

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const { addToCart, isStaff } = useCart();

  const [reporteAbierto, setReporteAbierto] = useState(false);
  const [reporteTipo, setReporteTipo] = useState('poco_stock');
  const [reporteMensaje, setReporteMensaje] = useState('');
  const [reporteEnviando, setReporteEnviando] = useState(false);
  const [reporteExito, setReporteExito] = useState('');
  const [reporteError, setReporteError] = useState('');

  const puedeReportar = user && user.rol !== 'admin' && user.rol !== 'mayorista';
  const { isFav, toggle: toggleFav, esCliente } = useFavoritos(user);

  const handleReporte = async (e) => {
    e.preventDefault();
    setReporteEnviando(true);
    setReporteError('');
    try {
      const res = await api.post(`/productos/${id}/reportar-stock`, {
        tipo: reporteTipo,
        mensaje: reporteMensaje,
      });
      setReporteExito(res.data.message);
      setReporteAbierto(false);
      setReporteMensaje('');
    } catch (err) {
      setReporteError(err.response?.data?.error || 'Error al enviar el reporte');
    } finally {
      setReporteEnviando(false);
    }
  };

  useEffect(() => {
    fetchProducto();
  }, [id]);

  const fetchProducto = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/productos/${id}`);
      setProducto(response.data.data);
    } catch (error) {
      console.error('Error fetching producto:', error);
      setError('Producto no encontrado o error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCarrito = () => {
    addToCart(producto, cantidad);
  };

  if (loading) return <SkeletonProductDetail />;

  if (error || !producto) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Error</h4>
          <p>{error}</p>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={() => navigate('/productos')}>
              Volver a Productos
            </Button>
            <Button variant="outline-primary" onClick={fetchProducto}>
              Reintentar
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <img 
            src={producto.imagen || "/images/placeholder.jpg"} 
            alt={producto.nombre}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = "/images/placeholder.jpg";
            }}
          />
        </Col>
        
        <Col md={6}>
          <Badge bg="success" className="mb-3">{producto.categoria}</Badge>
          <h1 className="fw-bold mb-3">{producto.nombre}</h1>
          <p className="text-muted lead mb-4">{producto.descripcion}</p>
          
          <div className="mb-4">
            <h2 className="text-success fw-bold">S/.{producto.precio}</h2>
            <p className={producto.stock > 10 ? 'text-success' : 'text-warning'}>
              <strong>Stock disponible:</strong> {producto.stock} unidades
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="cantidad" className="form-label fw-bold">Cantidad:</label>
            <div className="d-flex align-items-center gap-3">
              <select 
                id="cantidad"
                className="form-select w-auto"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value))}
              >
                {[...Array(Math.min(producto.stock, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              {!isStaff && (
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleAgregarCarrito}
                  disabled={producto.stock === 0}
                >
                  🛒 Agregar al Carrito
                </Button>
              )}
            </div>
          </div>

          <div className="d-flex gap-3 mt-4 flex-wrap">
            <Button as={Link} to="/productos" variant="outline-success">
              ← Volver a Productos
            </Button>
            <Button as={Link} to="/" variant="outline-primary">
              🏠 Ir al Inicio
            </Button>
            {esCliente && producto && (
              <Button
                variant={isFav(producto.id) ? 'danger' : 'outline-danger'}
                onClick={() => toggleFav(producto.id)}
              >
                {isFav(producto.id) ? '❤️ En favoritos' : '🤍 Guardar'}
              </Button>
            )}
          </div>

          {puedeReportar && (
            <div className="mt-4 pt-3 border-top">
              {reporteExito && (
                <Alert variant="success" className="py-2 small" dismissible onClose={() => setReporteExito('')}>
                  {reporteExito}
                </Alert>
              )}
              {!reporteAbierto ? (
                <button
                  className="btn btn-link text-muted p-0 small"
                  onClick={() => setReporteAbierto(true)}
                >
                  ⚠️ Reportar problema de stock
                </button>
              ) : (
                <div className="border rounded p-3 bg-light">
                  <p className="fw-bold small mb-2">Reportar problema de stock</p>
                  {reporteError && <Alert variant="danger" className="py-1 small">{reporteError}</Alert>}
                  <Form onSubmit={handleReporte}>
                    <Form.Group className="mb-2">
                      <Form.Select
                        size="sm"
                        value={reporteTipo}
                        onChange={e => setReporteTipo(e.target.value)}
                      >
                        <option value="poco_stock">Stock muy bajo / casi sin existencias</option>
                        <option value="sin_stock">Sin stock (producto agotado)</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        placeholder="Comentario adicional (opcional)..."
                        value={reporteMensaje}
                        onChange={e => setReporteMensaje(e.target.value)}
                      />
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button type="submit" size="sm" variant="warning" disabled={reporteEnviando}>
                        {reporteEnviando ? 'Enviando...' : 'Enviar reporte'}
                      </Button>
                      <Button size="sm" variant="outline-secondary" onClick={() => setReporteAbierto(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          <SeccionValoraciones productoId={id} user={user} />
        </Col>
      </Row>
    </Container>
  );
}

export default ProductoDetalle;