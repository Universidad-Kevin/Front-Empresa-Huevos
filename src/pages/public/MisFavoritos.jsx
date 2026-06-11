import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavoritos } from '../../hooks/useFavoritos';

function MisFavoritos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart, isStaff } = useCart();
  const { isFav, toggle: toggleFav } = useFavoritos(user);

  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (user.rol === 'admin' || user.rol === 'mayorista') { navigate('/'); return; }
    cargar();
  }, [user]);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/favoritos');
      setFavoritos(data.data);
    } catch {
      setError('Error al cargar tus favoritos.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuitar = async (productoId) => {
    await toggleFav(productoId);
    setFavoritos(prev => prev.filter(f => f.id !== productoId));
  };

  if (!user || user.rol === 'admin' || user.rol === 'mayorista') return null;

  return (
    <Container className="py-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="fw-bold">❤️ Mis Favoritos</h1>
          <p className="text-muted mb-0">Productos que guardaste para después</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/productos" variant="outline-success" size="sm">
            ← Seguir comprando
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <Row>
          {[1, 2, 3, 4].map(i => (
            <Col key={i} lg={3} md={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <div style={{ height: 200, background: '#eee' }} />
                <Card.Body>
                  <div style={{ height: 16, background: '#eee', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ height: 12, background: '#eee', borderRadius: 4, width: '60%' }} />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : favoritos.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: 64 }}>🤍</div>
          <h4 className="mt-3 text-muted">Aún no tienes favoritos</h4>
          <p className="text-muted">Guarda productos para encontrarlos fácilmente después.</p>
          <Button as={Link} to="/productos" variant="success" className="mt-2">
            Explorar productos
          </Button>
        </div>
      ) : (
        <>
          <p className="text-muted mb-4">
            {favoritos.length} producto{favoritos.length !== 1 ? 's' : ''} guardado{favoritos.length !== 1 ? 's' : ''}
          </p>
          <Row>
            {favoritos.map(producto => (
              <Col key={producto.id} lg={3} md={6} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={producto.imagen || '/images/placeholder.jpg'}
                      style={{ height: 200, objectFit: 'cover' }}
                      onError={e => { e.target.src = '/images/placeholder.jpg'; }}
                    />
                    <button
                      onClick={() => handleQuitar(producto.id)}
                      className="position-absolute top-0 end-0 m-2 border-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 16 }}
                      title="Quitar de favoritos"
                    >
                      ❤️
                    </button>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between mb-1">
                      <Badge bg="secondary" className="text-capitalize">{producto.categoria}</Badge>
                      {producto.stock === 0 && <Badge bg="danger">Sin stock</Badge>}
                      {producto.stock > 0 && producto.stock <= 5 && (
                        <Badge bg="warning" text="dark">Últimas {producto.stock}</Badge>
                      )}
                    </div>
                    <Card.Title className="mt-2 fs-6">{producto.nombre}</Card.Title>
                    <Card.Text className="flex-grow-1 text-muted small">{producto.descripcion}</Card.Text>
                    <div className="mt-auto">
                      <h5 className="text-success mb-2">S/.{parseFloat(producto.precio).toFixed(2)}</h5>
                      <div className="d-flex gap-2">
                        <Button
                          as={Link}
                          to={`/producto/${producto.id}`}
                          variant="outline-success"
                          size="sm"
                          className="flex-grow-1"
                        >
                          Ver detalles
                        </Button>
                        {!isStaff && (
                          <Button
                            variant="success"
                            size="sm"
                            disabled={producto.stock === 0}
                            onClick={() => addToCart(producto)}
                            title="Agregar al carrito"
                          >
                            🛒
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default MisFavoritos;
