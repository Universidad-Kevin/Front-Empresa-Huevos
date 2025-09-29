import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import api from '../../services/api';

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);

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
    alert(`Agregado ${cantidad} unidad(es) de ${producto.nombre} al carrito`);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando producto...</p>
      </Container>
    );
  }

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
            <h2 className="text-success fw-bold">${producto.precio}</h2>
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
              <Button 
                variant="success" 
                size="lg"
                onClick={handleAgregarCarrito}
                disabled={producto.stock === 0}
              >
                🛒 Agregar al Carrito
              </Button>
            </div>
          </div>

          <div className="d-flex gap-3 mt-4">
            <Button as={Link} to="/productos" variant="outline-success">
              ← Volver a Productos
            </Button>
            <Button as={Link} to="/" variant="outline-primary">
              🏠 Ir al Inicio
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default ProductoDetalle;