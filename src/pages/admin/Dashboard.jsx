import { Container, Row, Col, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Dashboard() {
  const stats = [
    { title: 'Total Productos', value: '24', icon: '📦', color: 'primary', link: '/admin/productos' },
    { title: 'Ventas del Mes', value: '$2,845', icon: '💰', color: 'success', link: '/admin/estadisticas' },
    { title: 'Pedidos Pendientes', value: '12', icon: '📋', color: 'warning', link: '/admin/pedidos' },
    { title: 'Clientes Nuevos', value: '48', icon: '👥', color: 'info', link: '/admin/estadisticas' }
  ]

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Dashboard</h1>
          <p className="text-muted">Resumen general del sistema</p>
        </Col>
      </Row>

      {/* Estadísticas */}
      <Row className="mb-5">
        {stats.map((stat, index) => (
          <Col key={index} lg={3} md={6} className="mb-3">
            <Card as={Link} to={stat.link} className="text-decoration-none h-100 shadow-sm">
              <Card.Body className="text-center">
                <div className={`fs-1 mb-2 text-${stat.color}`}>{stat.icon}</div>
                <h3 className={`text-${stat.color}`}>{stat.value}</h3>
                <Card.Text className="text-muted">{stat.title}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Acciones Rápidas */}
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-bold">Acciones Rápidas</h5>
              <Row className="mt-3">
                <Col md={6} className="mb-3">
                  <Link to="/admin/agregar-producto" className="btn btn-success w-100">
                    ➕ Agregar Producto
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link to="/admin/productos" className="btn btn-outline-primary w-100">
                    📦 Gestionar Productos
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link to="/admin/estadisticas" className="btn btn-outline-info w-100">
                    📊 Ver Estadísticas
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link to="/admin/pedidos" className="btn btn-outline-warning w-100">
                    📋 Ver Pedidos
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-bold">Actividad Reciente</h5>
              <div className="mt-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success rounded-circle p-2 me-3">📦</div>
                  <div>
                    <small className="fw-bold">Nuevo producto agregado</small>
                    <br/>
                    <small className="text-muted">Hace 2 horas</small>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-warning rounded-circle p-2 me-3">💰</div>
                  <div>
                    <small className="fw-bold">Venta realizada</small>
                    <br/>
                    <small className="text-muted">Hace 4 horas</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="bg-info rounded-circle p-2 me-3">👤</div>
                  <div>
                    <small className="fw-bold">Nuevo cliente registrado</small>
                    <br/>
                    <small className="text-muted">Hace 1 día</small>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard