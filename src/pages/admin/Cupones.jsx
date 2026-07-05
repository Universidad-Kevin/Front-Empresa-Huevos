import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Modal, Form, Alert, InputGroup,
} from 'react-bootstrap';
import api from '../../services/api';
import { SkeletonTable } from '../../components/SkeletonLoader';
import Seo from '../../components/Seo';

const TIPO_LABELS = { porcentaje: '% Porcentaje', monto_fijo: 'S/. Monto fijo' };

const estadoBadge = (c) => {
  if (!c.activo) return <Badge bg="secondary">Inactivo</Badge>;
  const hoy = new Date().toISOString().slice(0, 10);
  if (c.fecha_fin && hoy > c.fecha_fin) return <Badge bg="danger">Expirado</Badge>;
  if (c.usos_disponibles !== null && c.usos_disponibles <= 0) return <Badge bg="warning" text="dark">Sin usos</Badge>;
  return <Badge bg="success">Activo</Badge>;
};

const valorDescuento = (c) =>
  c.tipo === 'porcentaje' ? `${parseFloat(c.valor).toFixed(0)}%` : `S/.${parseFloat(c.valor).toFixed(2)}`;

const VACIO = {
  codigo: '', descripcion: '', tipo: 'porcentaje', valor: '', minimo_compra: '',
  maximo_descuento: '', usos_disponibles: '', fecha_inicio: '', fecha_fin: '', activo: 1,
};

function Cupones() {
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null); // null = nuevo
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  const [modalEliminar, setModalEliminar] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/cupones');
      setCupones(data.data);
    } catch {
      setError('Error al cargar los cupones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = cupones.filter(c => {
    const q = busqueda.toLowerCase();
    return !q || c.codigo.toLowerCase().includes(q) || (c.descripcion || '').toLowerCase().includes(q);
  });

  const stats = {
    activos: cupones.filter(c => c.activo).length,
    inactivos: cupones.filter(c => !c.activo).length,
    totalUsos: cupones.reduce((s, c) => s + (c.usos_totales || 0), 0),
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(VACIO);
    setFormError('');
    setModal(true);
  };

  const abrirEditar = (c) => {
    setEditando(c);
    setForm({
      codigo: c.codigo,
      descripcion: c.descripcion || '',
      tipo: c.tipo,
      valor: c.valor,
      minimo_compra: c.minimo_compra || '',
      maximo_descuento: c.maximo_descuento || '',
      usos_disponibles: c.usos_disponibles !== null ? c.usos_disponibles : '',
      fecha_inicio: c.fecha_inicio ? c.fecha_inicio.slice(0, 10) : '',
      fecha_fin: c.fecha_fin ? c.fecha_fin.slice(0, 10) : '',
      activo: c.activo,
    });
    setFormError('');
    setModal(true);
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const guardar = async () => {
    if (!form.codigo.trim()) return setFormError('El código es requerido');
    if (!form.valor) return setFormError('El valor del descuento es requerido');
    if (form.tipo === 'porcentaje' && (parseFloat(form.valor) < 0 || parseFloat(form.valor) > 100))
      return setFormError('El porcentaje debe ser entre 0 y 100');

    setGuardando(true);
    setFormError('');
    try {
      const payload = {
        codigo: form.codigo.toUpperCase().trim(),
        descripcion: form.descripcion || undefined,
        tipo: form.tipo,
        valor: parseFloat(form.valor),
        minimo_compra: form.minimo_compra ? parseFloat(form.minimo_compra) : 0,
        maximo_descuento: form.maximo_descuento ? parseFloat(form.maximo_descuento) : undefined,
        usos_disponibles: form.usos_disponibles !== '' ? parseInt(form.usos_disponibles) : undefined,
        fecha_inicio: form.fecha_inicio || undefined,
        fecha_fin: form.fecha_fin || undefined,
        activo: form.activo,
      };
      if (editando) {
        await api.put(`/cupones/${editando.id}`, payload);
      } else {
        await api.post('/cupones', payload);
      }
      setModal(false);
      cargar();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async () => {
    try {
      await api.delete(`/cupones/${modalEliminar.id}`);
      setModalEliminar(null);
      cargar();
    } catch {
      setModalEliminar(null);
    }
  };

  return (
    <Container className="py-4">
      <Seo path="/admin/cupones" title="Cupones" noindex />
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="h2 fw-bold mb-0">Cupones y Promociones</h1>
          <p className="text-muted mb-0">Gestiona los códigos de descuento</p>
        </Col>
        <Col xs="auto">
          <Button style={{ background: '#2D5A27', border: 'none' }} onClick={abrirNuevo}>
            + Nuevo Cupón
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Activos', value: stats.activos, color: '#198754', icon: '✅' },
          { label: 'Inactivos', value: stats.inactivos, color: '#6c757d', icon: '⛔' },
          { label: 'Usos totales', value: stats.totalUsos, color: '#0d6efd', icon: '🏷️' },
        ].map(s => (
          <Col key={s.label} xs={4}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="d-flex justify-content-between align-items-center py-3">
                <div>
                  <div className="text-muted small">{s.label}</div>
                  <div className="fs-3 fw-bold">{s.value}</div>
                </div>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filtro */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col md={6}>
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por código o descripción…"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col className="text-end">
              <Button size="sm" variant="outline-secondary" onClick={cargar}>↻ Actualizar</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-3"><SkeletonTable rows={4} cols={7} /></div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: 40 }}>🏷️</div>
              <p className="mt-2">No hay cupones creados aún</p>
              <Button variant="success" onClick={abrirNuevo}>Crear primer cupón</Button>
            </div>
          ) : (
            <>
              {/* Tabla — escritorio */}
              <div className="table-responsive d-none d-md-block">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Descuento</th>
                      <th>Mín. compra</th>
                      <th>Usos</th>
                      <th>Vigencia</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(c => (
                      <tr key={c.id}>
                        <td><span className="font-monospace fw-bold">{c.codigo}</span></td>
                        <td><small className="text-muted">{c.descripcion || '—'}</small></td>
                        <td>
                          <Badge bg={c.tipo === 'porcentaje' ? 'primary' : 'warning'} text={c.tipo === 'monto_fijo' ? 'dark' : undefined}>
                            {valorDescuento(c)}
                          </Badge>
                          {c.maximo_descuento && (
                            <small className="text-muted d-block">tope S/.{parseFloat(c.maximo_descuento).toFixed(2)}</small>
                          )}
                        </td>
                        <td>
                          {parseFloat(c.minimo_compra) > 0
                            ? <small>S/.{parseFloat(c.minimo_compra).toFixed(2)}</small>
                            : <small className="text-muted">Sin mínimo</small>}
                        </td>
                        <td>
                          <small>{c.usos_totales} usados</small>
                          {c.usos_disponibles !== null && (
                            <small className="text-muted d-block">{c.usos_disponibles} restantes</small>
                          )}
                          {c.usos_disponibles === null && (
                            <small className="text-muted d-block">∞ ilimitados</small>
                          )}
                        </td>
                        <td>
                          <small>
                            {c.fecha_inicio ? c.fecha_inicio.slice(0, 10) : '—'}
                            {' → '}
                            {c.fecha_fin ? c.fecha_fin.slice(0, 10) : '∞'}
                          </small>
                        </td>
                        <td>{estadoBadge(c)}</td>
                        <td>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => abrirEditar(c)}>
                            Editar
                          </Button>
                          {c.activo ? (
                            <Button size="sm" variant="outline-danger" onClick={() => setModalEliminar(c)}>
                              Desactivar
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline-success" onClick={async () => {
                              await api.put(`/cupones/${c.id}`, { ...c, activo: 1 });
                              cargar();
                            }}>
                              Activar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Tarjetas — móvil */}
              <div className="d-md-none">
                {filtrados.map(c => (
                  <div key={c.id} className="border-bottom p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="font-monospace fw-bold">{c.codigo}</span>
                      {estadoBadge(c)}
                    </div>
                    {c.descripcion && <div className="small text-muted mb-2">{c.descripcion}</div>}
                    <div className="d-flex flex-wrap gap-2 mb-1">
                      <Badge bg={c.tipo === 'porcentaje' ? 'primary' : 'warning'} text={c.tipo === 'monto_fijo' ? 'dark' : undefined}>
                        {valorDescuento(c)}
                      </Badge>
                      <small className="text-muted">
                        {parseFloat(c.minimo_compra) > 0 ? `Mín. S/.${parseFloat(c.minimo_compra).toFixed(2)}` : 'Sin mínimo'}
                      </small>
                    </div>
                    <div className="small text-muted mb-2">
                      {c.usos_totales} usados ·{' '}
                      {c.usos_disponibles !== null ? `${c.usos_disponibles} restantes` : '∞ ilimitados'}
                    </div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(c)}>
                        Editar
                      </Button>
                      {c.activo ? (
                        <Button size="sm" variant="outline-danger" onClick={() => setModalEliminar(c)}>
                          Desactivar
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline-success" onClick={async () => {
                          await api.put(`/cupones/${c.id}`, { ...c, activo: 1 });
                          cargar();
                        }}>
                          Activar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal show={modal} onHide={() => setModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? 'Editar Cupón' : 'Nuevo Cupón'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}
          <Row className="g-3">
            <Col md={5}>
              <Form.Label className="small fw-bold mb-1">Código *</Form.Label>
              <Form.Control
                value={form.codigo}
                onChange={e => set('codigo', e.target.value.toUpperCase())}
                placeholder="DESCUENTO20"
                disabled={!!editando}
              />
              <Form.Text className="text-muted">En mayúsculas, sin espacios</Form.Text>
            </Col>
            <Col md={7}>
              <Form.Label className="small fw-bold mb-1">Descripción</Form.Label>
              <Form.Control
                value={form.descripcion}
                onChange={e => set('descripcion', e.target.value)}
                placeholder="20% de descuento en tu primera compra"
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold mb-1">Tipo de descuento *</Form.Label>
              <Form.Select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option value="porcentaje">% Porcentaje</option>
                <option value="monto_fijo">S/. Monto fijo</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold mb-1">
                {form.tipo === 'porcentaje' ? 'Porcentaje (%)' : 'Monto (S/.)'} *
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                max={form.tipo === 'porcentaje' ? 100 : undefined}
                step="0.01"
                value={form.valor}
                onChange={e => set('valor', e.target.value)}
                placeholder={form.tipo === 'porcentaje' ? '20' : '10.00'}
              />
            </Col>
            {form.tipo === 'porcentaje' && (
              <Col md={4}>
                <Form.Label className="small fw-bold mb-1">Tope máximo (S/.) <span className="text-muted fw-normal">opcional</span></Form.Label>
                <Form.Control
                  type="number" min="0" step="0.01"
                  value={form.maximo_descuento}
                  onChange={e => set('maximo_descuento', e.target.value)}
                  placeholder="50.00"
                />
              </Col>
            )}
            <Col md={4}>
              <Form.Label className="small fw-bold mb-1">Compra mínima (S/.)</Form.Label>
              <Form.Control
                type="number" min="0" step="0.01"
                value={form.minimo_compra}
                onChange={e => set('minimo_compra', e.target.value)}
                placeholder="0.00"
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold mb-1">Usos disponibles <span className="text-muted fw-normal">(vacío = ilimitado)</span></Form.Label>
              <Form.Control
                type="number" min="0"
                value={form.usos_disponibles}
                onChange={e => set('usos_disponibles', e.target.value)}
                placeholder="∞"
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold mb-1">Fecha inicio <span className="text-muted fw-normal">opcional</span></Form.Label>
              <Form.Control
                type="date"
                value={form.fecha_inicio}
                onChange={e => set('fecha_inicio', e.target.value)}
              />
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-bold mb-1">Fecha fin <span className="text-muted fw-normal">opcional</span></Form.Label>
              <Form.Control
                type="date"
                value={form.fecha_fin}
                onChange={e => set('fecha_fin', e.target.value)}
              />
            </Col>
            {editando && (
              <Col md={4}>
                <Form.Label className="small fw-bold mb-1">Estado</Form.Label>
                <Form.Select value={form.activo} onChange={e => set('activo', parseInt(e.target.value))}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </Form.Select>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear cupón'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal confirmar desactivar */}
      <Modal show={!!modalEliminar} onHide={() => setModalEliminar(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Desactivar cupón</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Desactivar el cupón <strong className="font-monospace">{modalEliminar?.codigo}</strong>? Los usos existentes no se verán afectados.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalEliminar(null)}>Cancelar</Button>
          <Button variant="danger" onClick={desactivar}>Desactivar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Cupones;
