import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap'

function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('')

  // Datos de ejemplo (luego se conectarán con el backend)
  useEffect(() => {
    const productosEjemplo = [
      {
        id: 1,
        nombre: "Huevos Orgánicos Grade A",
        descripcion: "Huevos frescos de gallinas criadas libremente en pastoreo",
        precio: 8.99,
        categoria: "standard",
        imagen: "/images/huevo-organico.jpg",
        stock: 150
      },
      {
        id: 2,
        nombre: "Huevos Premium Omega-3",
        descripcion: "Enriquecidos naturalmente con ácidos grasos Omega-3",
        precio: 12.99,
        categoria: "premium", 
        imagen: "/images/huevo-omega3.jpg",
        stock: 80
      },
      {
        id: 3,
        nombre: "Huevos de Codorniz",
        descripcion: "Huevos pequeños llenos de sabor y nutrientes concentrados",
        precio: 6.99,
        categoria: "especial",
        imagen: "/images/huevo-codorniz.jpg",
        stock: 200
      },
      {
        id: 4,
        nombre: "Huevos Azules Araucana",
        descripcion: "Huevos de color azul natural de gallinas Araucana chilenas",
        precio: 15.99,
        categoria: "gourmet",
        imagen: "/images/huevo-azul.jpg",
        stock: 50
      }
    ]

    setProductos(productosEjemplo)
    setLoading(false)
  }, [])

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoriaFilter === '' || producto.categoria === categoriaFilter)
  )

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Nuestros Productos</h1>
          <p className="text-muted">Descubre nuestra variedad de huevos orgánicos</p>
        </Col>
      </Row>

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
                src={producto.imagen}
                style={{ height: '200px', objectFit: 'cover' }}
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

      {productosFiltrados.length === 0 && (
        <Row>
          <Col className="text-center py-5">
            <h4 className="text-muted">No se encontraron productos</h4>
          </Col>
        </Row>
      )}
    </Container>
  )
}

export default Productos