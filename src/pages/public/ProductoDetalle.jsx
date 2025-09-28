import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap'

function ProductoDetalle() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cantidad, setCantidad] = useState(1)

  useEffect(() => {
    // Simular carga de datos
    const productos = [
      {
        id: 1,
        nombre: "Huevos Orgánicos Grade A",
        descripcion: "Huevos frescos de gallinas criadas libremente en pastoreo. Nuestras gallinas disfrutan de espacio abierto, alimentación 100% orgánica y cuidado responsable.",
        precio: 8.99,
        categoria: "standard",
        imagen: "/images/huevo-organico.jpg",
        stock: 150,
        caracteristicas: [
          "Gallinas criadas libremente",
          "Alimentación orgánica certificada",
          "Libre de antibióticos y hormonas",
          "Frescura garantizada"
        ],
        nutricion: {
          proteinas: "13g",
          calorias: "155",
          grasas: "11g"
        }
      },
      {
        id: 2,
        nombre: "Huevos Premium Omega-3",
        descripcion: "Enriquecidos naturalmente con ácidos grasos Omega-3 mediante alimentación especial con linaza y algas marinas.",
        precio: 12.99,
        categoria: "premium", 
        imagen: "/images/huevo-omega3.jpg",
        stock: 80,
        caracteristicas: [
          "Alto contenido en Omega-3",
          "Yema de color intenso",
          "Sabor premium",
          "Beneficios cardiovasculares"
        ],
        nutricion: {
          proteinas: "14g",
          calorias: "160",
          grasas: "12g",
          omega3: "350mg"
        }
      }
    ]

    const productoEncontrado = productos.find(p => p.id === parseInt(id))
    setProducto(productoEncontrado)
    setLoading(false)
  }, [id])

  const handleAgregarCarrito = () => {
    alert(`Agregado ${cantidad} unidad(es) de ${producto.nombre} al carrito`)
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    )
  }

  if (!producto) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h4>Producto no encontrado</h4>
          <p>El producto que buscas no existe.</p>
          <Link to="/productos" className="btn btn-outline-danger">
            Volver a Productos
          </Link>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <img 
            src={producto.imagen} 
            alt={producto.nombre}
            className="img-fluid rounded shadow"
            style={{ maxHeight: '500px', width: '100%', objectFit: 'cover' }}
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

          {/* Selector de cantidad */}
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

          {/* Características */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">✨ Características</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                {producto.caracteristicas.map((caract, index) => (
                  <li key={index} className="mb-2">✅ {caract}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>

          {/* Información Nutricional */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">📊 Información Nutricional (por 100g)</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}>
                  <p><strong>Proteínas:</strong> {producto.nutricion.proteinas}</p>
                  <p><strong>Calorías:</strong> {producto.nutricion.calorias}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Grasas:</strong> {producto.nutricion.grasas}</p>
                  {producto.nutricion.omega3 && (
                    <p><strong>Omega-3:</strong> {producto.nutricion.omega3}</p>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Productos relacionados */}
      <Row className="mt-5">
        <Col>
          <h3 className="mb-4">Productos Relacionados</h3>
          <div className="d-flex gap-3">
            <Button as={Link} to="/productos" variant="outline-success">
              Ver Todos los Productos
            </Button>
            <Button as={Link} to="/" variant="outline-primary">
              Volver al Inicio
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default ProductoDetalle