import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert, Modal, InputGroup, Spinner } from 'react-bootstrap'
import api from '../../services/api'
import { SkeletonTable } from '../../components/SkeletonLoader'

const estadoVariant = { pendiente: 'warning', procesando: 'info', enviado: 'primary', completado: 'success', cancelado: 'danger' }
const estadoLabel  = { pendiente: 'Pendiente', procesando: 'En proceso', enviado: 'Enviado', completado: 'Completado', cancelado: 'Cancelado' }
const metodoPagoLabel = { efectivo: '💵 Efectivo', transferencia: '🏦 Transferencia', tarjeta: '💳 Tarjeta' }

function ModalVerificacion({ show, onHide, onActualizar }) {
  const [codigo, setCodigo]     = useState('')
  const [pedido, setPedido]     = useState(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError]       = useState('')
  const [accion, setAccion]     = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (show) { setCodigo(''); setPedido(null); setError(''); setAccion('') }
    if (show && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100)
  }, [show])

  const buscar = async (e) => {
    e?.preventDefault()
    if (!codigo.trim()) return
    setBuscando(true); setError(''); setPedido(null)
    try {
      const { data } = await api.get(`/pedidos/verificar/${codigo.trim().toUpperCase()}`)
      setPedido(data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Código no encontrado.')
    } finally {
      setBuscando(false)
    }
  }

  const confirmarAccion = async (nuevoEstado) => {
    setAccion(nuevoEstado)
    try {
      await api.put(`/pedidos/${pedido.id}/estado`, { estado: nuevoEstado })
      setPedido(prev => ({ ...prev, estado: nuevoEstado }))
      onActualizar(pedido.id, nuevoEstado)
    } catch {
      setError('No se pudo actualizar el estado.')
    } finally {
      setAccion('')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Verificar pedido por código</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={buscar}>
          <InputGroup className="mb-3">
            <Form.Control
              ref={inputRef}
              placeholder="Ej: ABCD-1234"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.15rem' }}
            />
            <Button type="submit" variant="dark" disabled={buscando || !codigo.trim()}>
              {buscando ? <Spinner size="sm" /> : 'Buscar'}
            </Button>
          </InputGroup>
        </Form>

        {error && <Alert variant="danger">{error}</Alert>}

        {pedido && (
          <>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="fw-bold mb-1">Pedido #{pedido.id}</h5>
                <p className="text-muted mb-0 small">
                  {new Date(pedido.creado_en).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                </p>
              </div>
              <Badge bg={estadoVariant[pedido.estado]} className="fs-6 px-3 py-2">
                {estadoLabel[pedido.estado]}
              </Badge>
            </div>

            <Card className="mb-3 border-0 bg-light">
              <Card.Body className="py-2">
                <Row>
                  <Col sm={6}>
                    <small className="text-muted d-block">Cliente</small>
                    <strong>{pedido.cliente_nombre}</strong>
                    <div className="text-muted small">{pedido.cliente_email}</div>
                  </Col>
                  <Col sm={6}>
                    <small className="text-muted d-block">Método de pago</small>
                    <strong>{metodoPagoLabel[pedido.metodo_pago] || pedido.metodo_pago}</strong>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Table size="sm" className="mb-3">
              <thead className="table-light">
                <tr>
                  <th>Producto</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.items?.map(item => (
                  <tr key={item.id}>
                    <td>{item.nombre_producto}</td>
                    <td className="text-center">{item.cantidad}</td>
                    <td className="text-end">S/.{(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="text-end fw-bold">Total:</td>
                  <td className="text-end fw-bold text-success">S/.{parseFloat(pedido.total).toFixed(2)}</td>
                </tr>
              </tfoot>
            </Table>

            {!['completado', 'cancelado'].includes(pedido.estado) && (
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="success"
                  onClick={() => confirmarAccion('completado')}
                  disabled={!!accion}
                >
                  {accion === 'completado' ? <Spinner size="sm" className="me-2" /> : null}
                  Validar entrega
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => confirmarAccion('cancelado')}
                  disabled={!!accion}
                >
                  {accion === 'cancelado' ? <Spinner size="sm" className="me-2" /> : null}
                  Cancelar pedido
                </Button>
              </div>
            )}

            {pedido.estado === 'completado' && (
              <Alert variant="success" className="mb-0">Pedido entregado y completado correctamente.</Alert>
            )}
            {pedido.estado === 'cancelado' && (
              <Alert variant="danger" className="mb-0">Este pedido fue cancelado.</Alert>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

function Pedidos() {
  const [pedidos, setPedidos]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showVerificar, setShowVerificar] = useState(false)

  useEffect(() => { cargarPedidos() }, [])

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
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h1 className="fw-bold">Gestión de Pedidos</h1>
              <p className="text-muted mb-0">Administra y sigue los pedidos de clientes</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Button variant="dark" onClick={() => setShowVerificar(true)}>
                Verificar por código
              </Button>
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
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-4">
        {['pendiente', 'procesando', 'enviado', 'completado', 'cancelado'].map(estado => (
          <Col key={estado} lg={2} md={4} xs={6} className="mb-3">
            <Card
              className={`border-0 bg-${estadoVariant[estado]} bg-opacity-10 text-center`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFiltroEstado(filtroEstado === estado ? '' : estado)}
            >
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
                <th>Código</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => (
                <tr key={pedido.id}>
                  <td><strong>#{pedido.id}</strong></td>
                  <td>
                    <strong>{pedido.cliente_nombre}</strong>
                    <br />
                    <small className="text-muted">{pedido.cliente_email}</small>
                  </td>
                  <td>{new Date(pedido.creado_en).toLocaleDateString('es-ES')}</td>
                  <td>
                    <small>
                      {pedido.items?.map((item, i) => (
                        <div key={i}>{item.cantidad}× {item.nombre_producto}</div>
                      ))}
                    </small>
                  </td>
                  <td className="fw-bold">S/.{parseFloat(pedido.total).toFixed(2)}</td>
                  <td>
                    <code className="text-dark bg-light px-2 py-1 rounded small">
                      {pedido.codigo_verificacion || '—'}
                    </code>
                  </td>
                  <td>
                    <Badge bg={estadoVariant[pedido.estado]} className="text-capitalize">
                      {estadoLabel[pedido.estado]}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {pedido.estado === 'pendiente' && (
                        <Button size="sm" variant="outline-info" onClick={() => cambiarEstado(pedido.id, 'procesando')}>Procesar</Button>
                      )}
                      {pedido.estado === 'procesando' && (
                        <Button size="sm" variant="outline-primary" onClick={() => cambiarEstado(pedido.id, 'enviado')}>Enviar</Button>
                      )}
                      {pedido.estado === 'enviado' && (
                        <Button size="sm" variant="outline-success" onClick={() => cambiarEstado(pedido.id, 'completado')}>Completar</Button>
                      )}
                      {!['completado', 'cancelado'].includes(pedido.estado) && (
                        <Button size="sm" variant="outline-danger" onClick={() => cambiarEstado(pedido.id, 'cancelado')}>Cancelar</Button>
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

      <ModalVerificacion
        show={showVerificar}
        onHide={() => setShowVerificar(false)}
        onActualizar={cambiarEstado}
      />
    </Container>
  )
}

export default Pedidos
