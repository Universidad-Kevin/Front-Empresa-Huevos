import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert } from 'react-bootstrap'
import api from '../../services/api'
import { SkeletonTable } from '../../components/SkeletonLoader'

const estadoVariant = { pendiente: 'warning', procesando: 'info', enviado: 'primary', completado: 'success', cancelado: 'danger' }

function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    cargarPedidos()
  }, [])

  const cargarPedidos = async () => {
    try {
      const { data } = await api.get('/pedidos')
      setPedidos(data.data)
    } catch {
      setError('No se pudieron cargar los pedidos.')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado })
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
    } catch {
      setError('No se pudo actualizar el estado del pedido.')
    }
  }

  const pedidosFiltrados = filtroEstado ? pedidos.filter(p => p.estado === filtroEstado) : pedidos

  if (loading) return <SkeletonTable rows={5} cols={7} />

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Gestión de Pedidos</h1>
              <p className="text-muted">Administra y sigue los pedidos de clientes</p>
            </div>
            <Form.Select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="procesando">En Proceso</option>
              <option value="enviado">Enviados</option>
              <option value="completado">Completados</option>
              <option value="cancelado">Cancelados</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-4">
        {['pendiente', 'procesando', 'enviado', 'completado', 'cancelado'].map(estado => (
          <Col key={estado} lg={2} md={4} xs={6} className="mb-3">
            <Card className={`border-0 bg-${estadoVariant[estado]} bg-opacity-10 text-center`}>
              <Card.Body className="py-3">
                <h5 className={`text-${estadoVariant[estado]}`}>{pedidos.filter(p => p.estado === estado).length}</h5>
                <small className="text-muted text-capitalize">{estado}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>#</th>
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
                  <td><strong>{pedido.id}</strong></td>
                  <td>
                    <strong>{pedido.cliente_nombre}</strong>
                    <br />
                    <small className="text-muted">{pedido.cliente_email}</small>
                  </td>
                  <td>{new Date(pedido.creado_en).toLocaleDateString('es-ES')}</td>
                  <td>
                    <small>
                      {pedido.items?.map((item, i) => (
                        <div key={i}>{item.cantidad}x {item.nombre_producto}</div>
                      ))}
                    </small>
                  </td>
                  <td className="fw-bold">${parseFloat(pedido.total).toFixed(2)}</td>
                  <td>
                    <Badge bg={estadoVariant[pedido.estado]} className="text-capitalize">
                      {pedido.estado}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {pedido.estado === 'pendiente' && (
                        <Button size="sm" variant="outline-info" onClick={() => cambiarEstado(pedido.id, 'procesando')}>
                          Procesar
                        </Button>
                      )}
                      {pedido.estado === 'procesando' && (
                        <Button size="sm" variant="outline-primary" onClick={() => cambiarEstado(pedido.id, 'enviado')}>
                          Enviar
                        </Button>
                      )}
                      {pedido.estado === 'enviado' && (
                        <Button size="sm" variant="outline-success" onClick={() => cambiarEstado(pedido.id, 'completado')}>
                          Completar
                        </Button>
                      )}
                      {!['completado', 'cancelado'].includes(pedido.estado) && (
                        <Button size="sm" variant="outline-danger" onClick={() => cambiarEstado(pedido.id, 'cancelado')}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {pedidosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No hay pedidos{filtroEstado ? ` con estado "${filtroEstado}"` : ''}.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default Pedidos
