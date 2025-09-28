import { useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Form } from 'react-bootstrap'

function Pedidos() {
  const [pedidos, setPedidos] = useState([
    {
      id: 'PED-001',
      cliente: 'María González',
      email: 'maria@email.com',
      total: 45.97,
      fecha: '2024-01-15',
      estado: 'pendiente',
      productos: [
        { nombre: 'Huevos Orgánicos Grade A', cantidad: 2, precio: 8.99 },
        { nombre: 'Huevos de Codorniz', cantidad: 1, precio: 6.99 }
      ]
    },
    {
      id: 'PED-002',
      cliente: 'Carlos López',
      email: 'carlos@email.com',
      total: 25.98,
      fecha: '2024-01-14',
      estado: 'procesando',
      productos: [
        { nombre: 'Huevos Premium Omega-3', cantidad: 2, precio: 12.99 }
      ]
    },
    {
      id: 'PED-003',
      cliente: 'Ana Martínez',
      email: 'ana@email.com',
      total: 68.95,
      fecha: '2024-01-13',
      estado: 'completado',
      productos: [
        { nombre: 'Huevos Orgánicos Grade A', cantidad: 3, precio: 8.99 },
        { nombre: 'Huevos Azules Araucana', cantidad: 2, precio: 15.99 }
      ]
    },
    {
      id: 'PED-004',
      cliente: 'Roberto Díaz',
      email: 'roberto@email.com',
      total: 12.99,
      fecha: '2024-01-12',
      estado: 'cancelado',
      productos: [
        { nombre: 'Huevos Premium Omega-3', cantidad: 1, precio: 12.99 }
      ]
    }
  ])

  const [filtroEstado, setFiltroEstado] = useState('')

  const getEstadoVariant = (estado) => {
    const variants = {
      pendiente: 'warning',
      procesando: 'info',
      completado: 'success',
      cancelado: 'danger'
    }
    return variants[estado] || 'secondary'
  }

  const cambiarEstado = (pedidoId, nuevoEstado) => {
    setPedidos(prev => prev.map(pedido => 
      pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido
    ))
  }

  const pedidosFiltrados = filtroEstado 
    ? pedidos.filter(pedido => pedido.estado === filtroEstado)
    : pedidos

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Gestión de Pedidos</h1>
              <p className="text-muted">Administra y sigue los pedidos de clientes</p>
            </div>
            <div className="d-flex gap-3">
              <Form.Select 
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="procesando">En Proceso</option>
                <option value="completado">Completados</option>
                <option value="cancelado">Cancelados</option>
              </Form.Select>
              <Button variant="success">
                📊 Reportes
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Resumen de Estados */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 bg-warning bg-opacity-10">
            <Card.Body className="text-center">
              <h4 className="text-warning">
                {pedidos.filter(p => p.estado === 'pendiente').length}
              </h4>
              <Card.Text className="text-muted">Pendientes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 bg-info bg-opacity-10">
            <Card.Body className="text-center">
              <h4 className="text-info">
                {pedidos.filter(p => p.estado === 'procesando').length}
              </h4>
              <Card.Text className="text-muted">En Proceso</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 bg-success bg-opacity-10">
            <Card.Body className="text-center">
              <h4 className="text-success">
                {pedidos.filter(p => p.estado === 'completado').length}
              </h4>
              <Card.Text className="text-muted">Completados</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 bg-danger bg-opacity-10">
            <Card.Body className="text-center">
              <h4 className="text-danger">
                {pedidos.filter(p => p.estado === 'cancelado').length}
              </h4>
              <Card.Text className="text-muted">Cancelados</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Pedidos */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => (
                <tr key={pedido.id}>
                  <td>
                    <strong>{pedido.id}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{pedido.cliente}</strong>
                      <br/>
                      <small className="text-muted">{pedido.email}</small>
                    </div>
                  </td>
                  <td>{pedido.fecha}</td>
                  <td>
                    <small>
                      {pedido.productos.map((p, index) => (
                        <div key={index}>
                          {p.cantidad}x {p.nombre}
                        </div>
                      ))}
                    </small>
                  </td>
                  <td>${pedido.total}</td>
                  <td>
                    <Badge bg={getEstadoVariant(pedido.estado)}>
                      {pedido.estado}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {/* Ver detalles */}}
                      >
                        👁️
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => cambiarEstado(pedido.id, 'completado')}
                        disabled={pedido.estado === 'completado'}
                      >
                        ✅
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => cambiarEstado(pedido.id, 'cancelado')}
                        disabled={pedido.estado === 'cancelado'}
                      >
                        ✕
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No hay pedidos con el filtro seleccionado</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Pedidos