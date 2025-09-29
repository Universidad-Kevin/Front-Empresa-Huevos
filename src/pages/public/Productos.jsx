import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import api from '../../services/api';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/productos');
      console.log('Productos cargados:', response.data.data);
      setProductos(response.data.data);
    } catch (error) {
      console.error('Error fetching productos:', error);
      setError('Error al cargar los productos. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoriaFilter === '' || producto.categoria === categoriaFilter)
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando productos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Nuestros Productos</h1>
          <p className="text-muted">Descubre nuestra variedad de huevos orgánicos</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">
          <h5>Error</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchProductos}>
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Filtros */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="especial">Especial</option>
            <option value="gourmet">Gourmet</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Lista de Productos */}
      <Row>
        {productosFiltrados.map(producto => (
          <Col key={producto.id} lg={3} md={6} className="mb-4">
            <Card className="h-100 shadow-sm product-card">
              <Card.Img 
                variant="top" 
                src={producto.imagen || "/images/placeholder.jpg"}
                style={{ height: '200px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = "/images/placeholder.jpg";
                }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title>{producto.nombre}</Card.Title>
                <Card.Text className="flex-grow-1 text-muted">
                  {producto.descripcion}
                </Card.Text>
                <div className="mt-auto">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="text-success mb-0">${producto.precio}</h5>
                    <small className="text-muted">Stock: {producto.stock}</small>
                  </div>
                  <Button 
                    as={Link} 
                    to={`/producto/${producto.id}`}
                    variant="success" 
                    className="w-100"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {productosFiltrados.length === 0 && !loading && (
        <Row>
          <Col className="text-center py-5">
            <h4 className="text-muted">No se encontraron productos</h4>
            <Button variant="outline-primary" onClick={fetchProductos}>
              Recargar productos
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Productos;