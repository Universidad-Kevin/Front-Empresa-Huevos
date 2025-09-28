import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap'

function ProductosAdmin() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    // Datos de ejemplo
    const productosEjemplo = [
      {
        id: 1,
        nombre: "Huevos Orgánicos Grade A",
        precio: 8.99,
        categoria: "standard",
        stock: 150,
        vendidos: 45,
        estado: "activo"
      },
      {
        id: 2,
        nombre: "Huevos Premium Omega-3",
        precio: 12.99,
        categoria: "premium", 
        stock: 80,
        vendidos: 32,
        estado: "activo"
      },
      {
        id: 3,
        nombre: "Huevos de Codorniz",
        precio: 6.99,
        categoria: "especial",
        stock: 200,
        vendidos: 78,
        estado: "activo"
      }
    ]
    setProductos(productosEjemplo)
  }, [])

  const getEstadoVariant = (stock) => {
    if (stock > 50) return 'success'
    if (stock > 10) return 'warning'
    return 'danger'
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Gestión de Productos</h1>
              <p className="text-muted">Administra tu inventario de productos</p>
            </div>
            <Button as={Link} to="/admin/agregar-producto" variant="success">
              ➕ Agregar Producto
            </Button>
          </div>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Vendidos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(producto => (
                <tr key={producto.id}>
                  <td>{producto.id}</td>
                  <td>
                    <strong>{producto.nombre}</strong>
                  </td>
                  <td>
                    <Badge bg="secondary">{producto.categoria}</Badge>
                  </td>
                  <td>${producto.precio}</td>
                  <td>
                    <Badge bg={getEstadoVariant(producto.stock)}>
                      {producto.stock} unidades
                    </Badge>
                  </td>
                  <td>{producto.vendidos}</td>
                  <td>
                    <Badge bg={producto.estado === 'activo' ? 'success' : 'secondary'}>
                      {producto.estado}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary">
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger">
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default ProductosAdmin