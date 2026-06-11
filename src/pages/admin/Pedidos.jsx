import { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert, Modal, InputGroup, Spinner } from 'react-bootstrap'
import api from '../../services/api'
import { SkeletonTable } from '../../components/SkeletonLoader'

const estadoVariant = {
  pendiente: 'warning', confirmado: 'info', preparando: 'secondary',
  enviado: 'primary', entregado: 'success', cancelado: 'danger', devuelto: 'dark',
  procesando: 'info', completado: 'success', // backward compat
}
const estadoLabel = {
  pendiente: 'Pendiente', confirmado: 'Confirmado', preparando: 'En Preparación',
  enviado: 'En Camino', entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto',
  procesando: 'En Preparación', completado: 'Entregado', // backward compat
}
const metodoPagoLabel = { efectivo: '💵 Efectivo', transferencia: '🏦 Transferencia', tarjeta: '💳 Tarjeta' }

const PASOS_FLUJO = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado']

function StepperPedido({ estado }) {
  const normalizado = estado === 'procesando' ? 'preparando' : estado === 'completado' ? 'entregado' : estado
  const idx = PASOS_FLUJO.indexOf(normalizado)
  if (idx === -1) return null
  return (
    <div className="d-flex align-items-center mt-1">
      {PASOS_FLUJO.map((p, i) => (
        <span key={p} className="d-flex align-items-center" title={estadoLabel[p]}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
            backgroundColor: i <= idx ? '#0d6efd' : '#dee2e6',
          }} />
          {i < PASOS_FLUJO.length - 1 && (
            <span style={{ width: 8, height: 2, display: 'inline-block', backgroundColor: i < idx ? '#0d6efd' : '#dee2e6' }} />
          )}
        </span>
      ))}
    </div>
  )
}

function ModalVerificacion({ show, onHide, onActualizar, onCancelar }) {
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

            {!['entregado', 'cancelado', 'devuelto'].includes(pedido.estado) && (
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="success"
                  onClick={() => confirmarAccion('entregado')}
                  disabled={!!accion}
                >
                  {accion === 'entregado' ? <Spinner size="sm" className="me-2" /> : null}
                  Validar entrega
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => { onCancelar(pedido); }}
                  disabled={!!accion}
                >
                  Cancelar pedido
                </Button>
              </div>
            )}

            {pedido.estado === 'entregado' && (
              <Alert variant="success" className="mb-0">Pedido entregado y completado correctamente.</Alert>
            )}
            {pedido.estado === 'cancelado' && (
              <Alert variant="danger" className="mb-0">Este pedido fue cancelado.</Alert>
            )}
            {pedido.estado === 'devuelto' && (
              <Alert variant="secondary" className="mb-0">Devolución registrada.</Alert>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

const MOTIVOS_CANCELACION = [
  'Producto sin stock disponible',
  'El cliente solicitó la cancelación',
  'Datos de entrega incorrectos',
  'Pago no recibido o rechazado',
  'Pedido duplicado',
  'Problema con el proveedor',
  'Otro motivo',
]

const MOTIVOS_DEVOLUCION = [
  'Producto en mal estado',
  'Producto incorrecto enviado',
  'El cliente rechazó la entrega',
  'Dirección incorrecta',
  'Otro motivo',
]

function ModalMotivoAdmin({ show, pedido, titulo, variante, motivos, labelBoton, onConfirmar, onCerrar }) {
  const [motivo, setMotivo] = useState('')
  const [nota, setNota]     = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => { if (show) { setMotivo(''); setNota(''); setError('') } }, [show])

  const handleConfirmar = async () => {
    if (!motivo) { setError('Selecciona un motivo'); return }
    setEnviando(true); setError('')
    try {
      const motivoCompleto = nota.trim() ? `${motivo}: ${nota.trim()}` : motivo
      await onConfirmar(motivoCompleto)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar la acción')
      setEnviando(false)
    }
  }

  if (!pedido) return null
  return (
    <Modal show={show} onHide={onCerrar} centered>
      <Modal.Header closeButton className={`bg-${variante} text-white`}>
        <Modal.Title>{titulo} #{pedido.id}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 p-3 bg-light rounded">
          <div className="fw-bold">{pedido.cliente_nombre}</div>
          <div className="text-muted small">{pedido.cliente_email}</div>
          <div className="mt-1 fw-bold text-success">S/.{parseFloat(pedido.total).toFixed(2)}</div>
        </div>
        <Alert variant="warning" className="small py-2">
          El stock de todos los productos del pedido será restaurado automáticamente.
        </Alert>
        {error && <Alert variant="danger" className="small py-2">{error}</Alert>}
        <Form.Group className="mb-2">
          <Form.Label className="small fw-bold">Motivo *</Form.Label>
          <Form.Select value={motivo} onChange={e => setMotivo(e.target.value)}>
            <option value="">— Selecciona un motivo —</option>
            {motivos.map(m => <option key={m} value={m}>{m}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label className="small fw-bold">Nota adicional (opcional)</Form.Label>
          <Form.Control
            as="textarea" rows={2} size="sm"
            placeholder="Detalles adicionales..."
            value={nota}
            onChange={e => setNota(e.target.value)}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCerrar} disabled={enviando}>Volver</Button>
        <Button variant={variante} onClick={handleConfirmar} disabled={enviando || !motivo}>
          {enviando ? <><Spinner animation="border" size="sm" className="me-2" />{labelBoton}...</> : labelBoton}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const ModalCancelarAdmin = ({ show, pedido, onConfirmar, onCerrar }) => (
  <ModalMotivoAdmin
    show={show} pedido={pedido} onConfirmar={onConfirmar} onCerrar={onCerrar}
    titulo="Cancelar pedido" variante="danger" labelBoton="Confirmar cancelación"
    motivos={MOTIVOS_CANCELACION}
  />
)

const ModalDevolverAdmin = ({ show, pedido, onConfirmar, onCerrar }) => (
  <ModalMotivoAdmin
    show={show} pedido={pedido} onConfirmar={onConfirmar} onCerrar={onCerrar}
    titulo="Registrar devolución" variante="dark" labelBoton="Registrar devolución"
    motivos={MOTIVOS_DEVOLUCION}
  />
)

function Pedidos() {
  const [pedidos, setPedidos]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [showVerificar, setShowVerificar] = useState(false)
  const [pedidoACancelar, setPedidoACancelar] = useState(null)
  const [pedidoADevolver, setPedidoADevolver] = useState(null)

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
    await api.put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado })
    setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
  }

  const confirmarCancelacion = async (motivo) => {
    await api.put(`/pedidos/${pedidoACancelar.id}/estado`, { estado: 'cancelado', motivo })
    setPedidos(prev => prev.map(p => p.id === pedidoACancelar.id ? { ...p, estado: 'cancelado' } : p))
    setPedidoACancelar(null)
  }

  const confirmarDevolucion = async (motivo) => {
    await api.put(`/pedidos/${pedidoADevolver.id}/estado`, { estado: 'devuelto', motivo })
    setPedidos(prev => prev.map(p => p.id === pedidoADevolver.id ? { ...p, estado: 'devuelto' } : p))
    setPedidoADevolver(null)
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
                <option value="confirmado">Confirmados</option>
                <option value="preparando">En Preparación</option>
                <option value="enviado">En Camino</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
                <option value="devuelto">Devueltos</option>
              </Form.Select>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Row className="mb-4">
        {['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado', 'devuelto'].map(estado => (
          <Col key={estado} lg={true} md={4} xs={6} className="mb-3">
            <Card
              className={`border-0 bg-${estadoVariant[estado]} bg-opacity-10 text-center`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFiltroEstado(filtroEstado === estado ? '' : estado)}
            >
              <Card.Body className="py-2 px-1">
                <h5 className={`text-${estadoVariant[estado]} mb-0`}>
                  {pedidos.filter(p => {
                    const norm = p.estado === 'procesando' ? 'preparando' : p.estado === 'completado' ? 'entregado' : p.estado
                    return norm === estado
                  }).length}
                </h5>
                <small className="text-muted" style={{ fontSize: 10 }}>{estadoLabel[estado]}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabla — desktop/tablet */}
      <Card className="shadow-sm d-none d-md-block">
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
                    <StepperPedido estado={pedido.estado} />
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {pedido.estado === 'pendiente'  && <Button size="sm" variant="outline-info"    onClick={() => cambiarEstado(pedido.id, 'confirmado')}>Confirmar</Button>}
                      {pedido.estado === 'confirmado' && <Button size="sm" variant="outline-secondary" onClick={() => cambiarEstado(pedido.id, 'preparando')}>Preparar</Button>}
                      {pedido.estado === 'preparando' && <Button size="sm" variant="outline-primary"  onClick={() => cambiarEstado(pedido.id, 'enviado')}>Enviar</Button>}
                      {pedido.estado === 'enviado'    && <Button size="sm" variant="outline-success"  onClick={() => cambiarEstado(pedido.id, 'entregado')}>Entregado</Button>}
                      {['enviado','entregado'].includes(pedido.estado) && (
                        <Button size="sm" variant="outline-dark" onClick={() => setPedidoADevolver(pedido)}>Devolver</Button>
                      )}
                      {!['enviado','entregado','cancelado','devuelto'].includes(pedido.estado) && (
                        <Button size="sm" variant="outline-danger" onClick={() => setPedidoACancelar(pedido)}>Cancelar</Button>
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

      {/* Tarjetas — mobile */}
      <div className="d-md-none">
        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No hay pedidos{filtroEstado ? ` con estado "${filtroEstado}"` : ''}.</p>
          </div>
        )}
        {pedidosFiltrados.map(pedido => (
          <Card key={pedido.id} className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong>#{pedido.id}</strong>
                  <span className="text-muted small ms-2">{new Date(pedido.creado_en).toLocaleDateString('es-ES')}</span>
                </div>
                <Badge bg={estadoVariant[pedido.estado]}>{estadoLabel[pedido.estado]}</Badge>
              </div>
              <div className="mb-1"><strong>{pedido.cliente_nombre}</strong></div>
              <div className="text-muted small mb-2">{pedido.cliente_email}</div>
              <div className="small mb-2">
                {pedido.items?.map((item, i) => (
                  <div key={i}>{item.cantidad}× {item.nombre_producto}</div>
                ))}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <strong className="text-success">S/.{parseFloat(pedido.total).toFixed(2)}</strong>
                {pedido.codigo_verificacion && (
                  <code className="text-dark bg-light px-2 py-1 rounded small">{pedido.codigo_verificacion}</code>
                )}
              </div>
              {!['cancelado','devuelto'].includes(pedido.estado) && (
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {pedido.estado === 'pendiente'  && <Button size="sm" variant="outline-info"     onClick={() => cambiarEstado(pedido.id, 'confirmado')}>Confirmar</Button>}
                  {pedido.estado === 'confirmado' && <Button size="sm" variant="outline-secondary" onClick={() => cambiarEstado(pedido.id, 'preparando')}>Preparar</Button>}
                  {pedido.estado === 'preparando' && <Button size="sm" variant="outline-primary"   onClick={() => cambiarEstado(pedido.id, 'enviado')}>Enviar</Button>}
                  {pedido.estado === 'enviado'    && <Button size="sm" variant="outline-success"   onClick={() => cambiarEstado(pedido.id, 'entregado')}>Entregado</Button>}
                  {['enviado','entregado'].includes(pedido.estado) && (
                    <Button size="sm" variant="outline-dark" onClick={() => setPedidoADevolver(pedido)}>Devolver</Button>
                  )}
                  {!['enviado','entregado'].includes(pedido.estado) && (
                    <Button size="sm" variant="outline-danger" onClick={() => setPedidoACancelar(pedido)}>Cancelar</Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>

      <ModalVerificacion
        show={showVerificar}
        onHide={() => setShowVerificar(false)}
        onActualizar={cambiarEstado}
        onCancelar={(pedido) => { setShowVerificar(false); setPedidoACancelar(pedido) }}
      />

      <ModalCancelarAdmin
        show={!!pedidoACancelar}
        pedido={pedidoACancelar}
        onConfirmar={confirmarCancelacion}
        onCerrar={() => setPedidoACancelar(null)}
      />

      <ModalDevolverAdmin
        show={!!pedidoADevolver}
        pedido={pedidoADevolver}
        onConfirmar={confirmarDevolucion}
        onCerrar={() => setPedidoADevolver(null)}
      />
    </Container>
  )
}

export default Pedidos
