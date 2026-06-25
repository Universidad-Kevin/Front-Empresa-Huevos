import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Modal, Form, Alert, Spinner, InputGroup,
} from 'react-bootstrap';
import api from '../../services/api';
import { SkeletonTable } from '../../components/SkeletonLoader';

const estadoVariant = {
  pendiente: 'warning',
  verificado: 'success',
  rechazado: 'danger',
  reembolsado: 'secondary',
};

const metodoPagoLabel = {
  efectivo: '💵 Efectivo',
  yape: '📱 Yape',
  plin: '💜 Plin',
  transferencia: '🏦 Transferencia',
  tarjeta: '💳 Tarjeta',
};

function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [modalVoucher, setModalVoucher] = useState(false);
  const [modalAccion, setModalAccion] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [accion, setAccion] = useState(''); // 'verificar' | 'rechazar'
  const [notas, setNotas] = useState('');
  const [voucherData, setVoucherData] = useState(null);
  const [loadingVoucher, setLoadingVoucher] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargarPagos = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/pagos');
      setPagos(data.data);
    } catch {
      setError('Error al cargar los pagos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarPagos(); }, []);

  const pagosFiltrados = pagos.filter(p => {
    const matchFiltro = filtro === 'todos' || p.estado === filtro;
    const q = busqueda.toLowerCase();
    const matchBusqueda =
      !q ||
      String(p.pedido_id).includes(q) ||
      (p.cliente_nombre || '').toLowerCase().includes(q) ||
      (p.cliente_email || '').toLowerCase().includes(q);
    return matchFiltro && matchBusqueda;
  });

  const stats = {
    pendiente: pagos.filter(p => p.estado === 'pendiente').length,
    verificado: pagos.filter(p => p.estado === 'verificado').length,
    rechazado:  pagos.filter(p => p.estado === 'rechazado').length,
  };

  const abrirVoucher = async (pago) => {
    setPagoSeleccionado(pago);
    setVoucherData(null);
    setModalVoucher(true);
    setLoadingVoucher(true);
    try {
      const { data } = await api.get(`/pagos/${pago.id}/voucher`);
      setVoucherData(data.data.voucher);
    } catch {
      setVoucherData(null);
    } finally {
      setLoadingVoucher(false);
    }
  };

  const abrirAccion = (pago, tipo) => {
    setPagoSeleccionado(pago);
    setAccion(tipo);
    setNotas('');
    setModalAccion(true);
  };

  const confirmarAccion = async () => {
    if (accion === 'rechazar' && !notas.trim()) return;
    setProcesando(true);
    try {
      await api.patch(`/pagos/${pagoSeleccionado.id}/${accion}`, { notas_admin: notas });
      setModalAccion(false);
      setMensaje(accion === 'verificar' ? '✓ Pago verificado. El pedido fue confirmado.' : '✓ Pago rechazado.');
      setTimeout(() => setMensaje(''), 4000);
      cargarPagos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold mb-0">Pagos y Comprobantes</h2>
          <p className="text-muted mb-0">Verifica y gestiona los pagos recibidos</p>
        </Col>
      </Row>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error   && <Alert variant="danger">{error}</Alert>}

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Pendientes', key: 'pendiente', color: '#ffc107', text: '#000' },
          { label: 'Verificados', key: 'verificado', color: '#198754', text: '#fff' },
          { label: 'Rechazados', key: 'rechazado',  color: '#dc3545', text: '#fff' },
        ].map(s => (
          <Col key={s.key} md={4}>
            <Card className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${s.color}` }}>
              <Card.Body className="d-flex justify-content-between align-items-center py-3">
                <div>
                  <div className="text-muted small">{s.label}</div>
                  <div className="fs-3 fw-bold">{stats[s.key]}</div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, background: s.color, color: s.text, fontSize: 20 }}
                >
                  {s.key === 'pendiente' ? '⏳' : s.key === 'verificado' ? '✓' : '✗'}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filtros */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col md={6}>
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por pedido #, cliente o email…"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select size="sm" value={filtro} onChange={e => setFiltro(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="verificado">Verificados</option>
                <option value="rechazado">Rechazados</option>
                <option value="reembolsado">Reembolsados</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <Button size="sm" variant="outline-secondary" onClick={cargarPagos}>↻ Actualizar</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-3"><SkeletonTable rows={5} cols={7} /></div>
          ) : pagosFiltrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: 40 }}>💳</div>
              <p className="mt-2">No hay pagos{filtro !== 'todos' ? ` en estado "${filtro}"` : ''}</p>
            </div>
          ) : (
            <>
              {/* Tabla — escritorio */}
              <div className="table-responsive d-none d-md-block">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Pedido #</th>
                      <th>Cliente</th>
                      <th>Método</th>
                      <th>Monto</th>
                      <th>Comprobante</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagosFiltrados.map(pago => (
                      <tr key={pago.id}>
                        <td>
                          <strong>#{pago.pedido_id}</strong>
                          {pago.codigo_verificacion && (
                            <div>
                              <small className="text-muted font-monospace">{pago.codigo_verificacion}</small>
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{pago.cliente_nombre || '—'}</div>
                          <small className="text-muted">{pago.cliente_email || ''}</small>
                        </td>
                        <td>{metodoPagoLabel[pago.metodo] || pago.metodo}</td>
                        <td className="fw-bold">S/.{parseFloat(pago.monto).toFixed(2)}</td>
                        <td>
                          {pago.tiene_voucher ? (
                            <Button size="sm" variant="outline-info" onClick={() => abrirVoucher(pago)}>
                              🖼 Ver
                            </Button>
                          ) : (
                            <span className="text-muted small">Sin comprobante</span>
                          )}
                        </td>
                        <td>
                          <Badge bg={estadoVariant[pago.estado] || 'secondary'}>
                            {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                          </Badge>
                          {pago.notas_admin && (
                            <div><small className="text-muted">{pago.notas_admin}</small></div>
                          )}
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(pago.creado_en).toLocaleDateString('es-PE', {
                              day: '2-digit', month: 'short', year: 'numeric',
                            })}
                          </small>
                        </td>
                        <td>
                          {pago.estado === 'pendiente' && (
                            <div className="d-flex gap-1">
                              <Button size="sm" variant="success" onClick={() => abrirAccion(pago, 'verificar')}>
                                ✓ Verificar
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => abrirAccion(pago, 'rechazar')}>
                                ✗
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Tarjetas — móvil */}
              <div className="d-md-none">
                {pagosFiltrados.map(pago => (
                  <div key={pago.id} className="border-bottom p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong>Pedido #{pago.pedido_id}</strong>
                      <Badge bg={estadoVariant[pago.estado] || 'secondary'} className="ms-2 flex-shrink-0">
                        {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                      </Badge>
                    </div>
                    <div className="mb-1">
                      <div className="small fw-semibold">{pago.cliente_nombre || '—'}</div>
                      <small className="text-muted">{pago.cliente_email || ''}</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">{metodoPagoLabel[pago.metodo] || pago.metodo}</small>
                      <strong className="text-success">S/.{parseFloat(pago.monto).toFixed(2)}</strong>
                    </div>
                    {pago.notas_admin && (
                      <small className="text-muted d-block mb-2">{pago.notas_admin}</small>
                    )}
                    <div className="d-flex gap-2 flex-wrap">
                      {pago.tiene_voucher && (
                        <Button size="sm" variant="outline-info" onClick={() => abrirVoucher(pago)}>
                          🖼 Comprobante
                        </Button>
                      )}
                      {pago.estado === 'pendiente' && (
                        <>
                          <Button size="sm" variant="success" onClick={() => abrirAccion(pago, 'verificar')}>
                            ✓ Verificar
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => abrirAccion(pago, 'rechazar')}>
                            ✗ Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal voucher */}
      <Modal show={modalVoucher} onHide={() => setModalVoucher(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Comprobante — Pedido #{pagoSeleccionado?.pedido_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {loadingVoucher ? (
            <Spinner animation="border" />
          ) : voucherData ? (
            <img
              src={voucherData}
              alt="Comprobante de pago"
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 8 }}
            />
          ) : (
            <p className="text-muted">Sin imagen adjunta</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {pagoSeleccionado?.estado === 'pendiente' && (
            <>
              <Button variant="success" onClick={() => { setModalVoucher(false); abrirAccion(pagoSeleccionado, 'verificar'); }}>
                ✓ Verificar pago
              </Button>
              <Button variant="outline-danger" onClick={() => { setModalVoucher(false); abrirAccion(pagoSeleccionado, 'rechazar'); }}>
                ✗ Rechazar
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setModalVoucher(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal acción verificar/rechazar */}
      <Modal show={modalAccion} onHide={() => setModalAccion(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {accion === 'verificar' ? '✓ Verificar Pago' : '✗ Rechazar Pago'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {accion === 'verificar'
              ? <>¿Confirmas que el pago del <strong>pedido #{pagoSeleccionado?.pedido_id}</strong> fue recibido? El pedido pasará automáticamente a <strong>Confirmado</strong>.</>
              : <>¿Rechazas el comprobante del <strong>pedido #{pagoSeleccionado?.pedido_id}</strong>? El cliente deberá subir uno nuevo.</>
            }
          </p>
          <Form.Group>
            <Form.Label className="small">
              {accion === 'verificar' ? 'Notas (opcional)' : 'Motivo del rechazo *'}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder={accion === 'verificar' ? 'Ej: Pago confirmado en banca…' : 'Ej: Imagen ilegible, monto incorrecto…'}
              required={accion === 'rechazar'}
            />
            {accion === 'rechazar' && !notas.trim() && (
              <Form.Text className="text-danger">El motivo es obligatorio para rechazar.</Form.Text>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalAccion(false)} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            variant={accion === 'verificar' ? 'success' : 'danger'}
            onClick={confirmarAccion}
            disabled={procesando || (accion === 'rechazar' && !notas.trim())}
          >
            {procesando
              ? <><Spinner size="sm" className="me-1" />Procesando...</>
              : accion === 'verificar' ? 'Confirmar verificación' : 'Confirmar rechazo'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Pagos;
