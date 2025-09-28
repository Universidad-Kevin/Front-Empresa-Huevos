import { Container, Row, Col, Card, Table } from 'react-bootstrap'

function Estadisticas() {
  // Datos de ejemplo para las estadísticas
  const estadisticas = {
    ventas: {
      total: 2845,
      mensual: 12450,
      crecimiento: 12.5
    },
    productos: {
      masVendidos: [
        { nombre: 'Huevos Orgánicos Grade A', ventas: 245, ingresos: 2200.55 },
        { nombre: 'Huevos Premium Omega-3', ventas: 189, ingresos: 2456.11 },
        { nombre: 'Huevos de Codorniz', ventas: 156, ingresos: 1089.84 }
      ]
    },
    tendencias: {
      mensual: [
        { mes: 'Ene', ventas: 9800 },
        { mes: 'Feb', ventas: 10200 },
        { mes: 'Mar', ventas: 11000 },
        { mes: 'Abr', ventas: 12450 },
        { mes: 'May', ventas: 11800 },
        { mes: 'Jun', ventas: 13200 }
      ]
    }
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Estadísticas</h1>
          <p className="text-muted">Métricas y análisis de rendimiento</p>
        </Col>
      </Row>

      {/* Tarjetas de métricas principales */}
      <Row className="mb-5">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-primary fs-2">💰</div>
              <h3 className="text-primary">${estadisticas.ventas.mensual.toLocaleString()}</h3>
              <Card.Text className="text-muted">Ventas del Mes</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-success fs-2">📦</div>
              <h3 className="text-success">{estadisticas.ventas.total}</h3>
              <Card.Text className="text-muted">Total Ventas</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-warning fs-2">📈</div>
              <h3 className="text-warning">{estadisticas.ventas.crecimiento}%</h3>
              <Card.Text className="text-muted">Crecimiento</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-info fs-2">👥</div>
              <h3 className="text-info">48</h3>
              <Card.Text className="text-muted">Clientes Nuevos</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Productos Más Vendidos */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">🏆 Productos Más Vendidos</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Ventas</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticas.productos.masVendidos.map((producto, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{producto.nombre}</strong>
                      </td>
                      <td>{producto.ventas}</td>
                      <td>${producto.ingresos.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Tendencias de Ventas */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">📈 Tendencias de Ventas</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-4">
                {/* Simulación de gráfico */}
                <div className="bg-light rounded p-4">
                  <p className="text-muted mb-3">Gráfico de Ventas Mensuales</p>
                  <div className="d-flex align-items-end justify-content-around" style={{ height: '150px' }}>
                    {estadisticas.tendencias.mensual.map((item, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="bg-success rounded mx-auto"
                          style={{ 
                            width: '20px', 
                            height: `${(item.ventas / 15000) * 100}px`,
                            minHeight: '10px'
                          }}
                        ></div>
                        <small className="text-muted">{item.mes}</small>
                        <br/>
                        <small>${(item.ventas / 1000).toFixed(0)}k</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Métricas Adicionales */}
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="fw-bold">📊 Rendimiento por Categoría</h6>
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Standard</span>
                  <span className="fw-bold">45%</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div className="progress-bar bg-success" style={{ width: '45%' }}></div>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Premium</span>
                  <span className="fw-bold">30%</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '30%' }}></div>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Especial</span>
                  <span className="fw-bold">15%</span>
                </div>
                <div className="progress mb-3" style={{ height: '8px' }}>
                  <div className="progress-bar bg-warning" style={{ width: '15%' }}></div>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Gourmet</span>
                  <span className="fw-bold">10%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar bg-info" style={{ width: '10%' }}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="fw-bold">🎯 Objetivos del Mes</h6>
              <div className="mt-3">
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Ventas</small>
                    <small>75%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Nuevos Clientes</small>
                    <small>60%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Productos Vendidos</small>
                    <small>85%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-warning" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Satisfacción</small>
                    <small>92%</small>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-info" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="fw-bold">📋 Resumen de Actividad</h6>
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                  <div>
                    <small className="fw-bold">Pedidos Hoy</small>
                    <br/>
                    <span className="text-success">12</span>
                  </div>
                  <div className="text-success">📦</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                  <div>
                    <small className="fw-bold">Productos Bajos</small>
                    <br/>
                    <span className="text-warning">3</span>
                  </div>
                  <div className="text-warning">⚠️</div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded">
                  <div>
                    <small className="fw-bold">Clientes Activos</small>
                    <br/>
                    <span className="text-primary">156</span>
                  </div>
                  <div className="text-primary">👥</div>
                </div>

                <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                  <div>
                    <small className="fw-bold">Calificación</small>
                    <br/>
                    <span className="text-info">4.8/5</span>
                  </div>
                  <div className="text-info">⭐</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Estadisticas