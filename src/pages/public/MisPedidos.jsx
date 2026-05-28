import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { SkeletonOrderList, SkeletonOrderDetail } from '../../components/SkeletonLoader';

const MOTIVOS_CLIENTE = [
  'Cambié de opinión',
  'Realicé el pedido por error',
  'El tiempo de entrega es muy largo',
  'Encontré mejor precio en otro lugar',
  'El precio no es el esperado',
  'Otro motivo',
];

function FormularioCancelacion({ pedidoId, onCancelado, onCerrar }) {
  const [motivo, setMotivo] = useState('');
  const [nota, setNota] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo) { setError('Selecciona un motivo'); return; }
    setEnviando(true);
    setError('');
    try {
      const motivoCompleto = nota.trim() ? `${motivo}: ${nota.trim()}` : motivo;
      await api.post(`/pedidos/${pedidoId}/cancelar`, { motivo: motivoCompleto });
      onCancelado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cancelar el pedido');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="border rounded p-3 mt-3 bg-light">
      <p className="fw-bold small mb-1 text-danger">Cancelar pedido</p>
      <p className="text-muted small mb-2">
        Esta acción no se puede deshacer. El stock de los productos será restaurado.
      </p>
      {error && <Alert variant="danger" className="py-1 small mb-2">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-2">
          <Form.Select size="sm" value={motivo} onChange={e => setMotivo(e.target.value)} required>
            <option value="">— Motivo de cancelación —</option>
            {MOTIVOS_CLIENTE.map(m => <option key={m} value={m}>{m}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Control
            as="textarea" rows={2} size="sm"
            placeholder="Detalle adicional (opcional)..."
            value={nota}
            onChange={e => setNota(e.target.value)}
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button type="submit" size="sm" variant="danger" disabled={enviando || !motivo}>
            {enviando ? <><Spinner animation="border" size="sm" className="me-1" />Cancelando...</> : 'Sí, cancelar pedido'}
          </Button>
          <Button size="sm" variant="outline-secondary" onClick={onCerrar} disabled={enviando}>
            Volver
          </Button>
        </div>
      </Form>
    </div>
  );
}

const estadoVariant = { pendiente: 'warning', procesando: 'info', enviado: 'primary', completado: 'success', cancelado: 'danger' };
const estadoLabel = { pendiente: 'Pendiente', procesando: 'En Preparación', enviado: 'En Camino', completado: 'Entregado', cancelado: 'Cancelado' };
const metodoPagoLabel = { efectivo: '💵 Pago contra entrega', transferencia: '🏦 Transferencia bancaria', tarjeta: '💳 Tarjeta de crédito/débito' };

function DetallePedido() {
  const { id } = useParams();
  const location = useLocation();
  const [pedido, setPedido] = useState(location.state?.pedido || null);
  const [loading, setLoading] = useState(!pedido);
  const [error, setError] = useState('');
  const [mostrarCancelacion, setMostrarCancelacion] = useState(false);
  const nuevo = location.state?.nuevo;

  useEffect(() => {
    if (!pedido) {
      api.get(`/pedidos/${id}`)
        .then(({ data }) => setPedido(data.data))
        .catch(() => setError('No se pudo cargar el pedido.'))
        .finally(() => setLoading(false));
    }
  }, [id, pedido]);

  if (loading) return <SkeletonOrderDetail />;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!pedido) return null;

  const fecha = new Date(pedido.creado_en).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  const subtotal = pedido.items?.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0) ?? 0;

  return (
    <Container className="py-5">
      {/* Estilos de impresión */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .recibo-card { box-shadow: none !important; border: 1px solid #ccc !important; }
          body { background: white !important; }
        }
      `}</style>

      {nuevo && (
        <Alert variant="success" className="mb-4 no-print">
          ¡Tu pedido fue confirmado exitosamente! Revisa tu email para el recibo.
        </Alert>
      )}

      {/* Barra de acciones */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <Button as={Link} to="/mis-pedidos" variant="outline-secondary" size="sm">
          ← Mis pedidos
        </Button>
        <div className="d-flex gap-2">
          {['pendiente', 'procesando'].includes(pedido.estado) && (
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => setMostrarCancelacion(v => !v)}
            >
              Cancelar pedido
            </Button>
          )}
          {pedido.estado === 'enviado' && (
            <small className="text-muted align-self-center">No cancelable — ya está en camino</small>
          )}
          <Button variant="outline-success" size="sm" onClick={() => window.print()}>
            🖨️ Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      {mostrarCancelacion && (
        <div className="mb-4 no-print" style={{ maxWidth: 700, margin: '0 auto' }}>
          <FormularioCancelacion
            pedidoId={pedido.id}
            onCancelado={() => {
              setPedido(prev => ({ ...prev, estado: 'cancelado' }));
              setMostrarCancelacion(false);
            }}
            onCerrar={() => setMostrarCancelacion(false)}
          />
        </div>
      )}

      {/* RECIBO */}
      <Card className="shadow-sm recibo-card" style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Encabezado */}
        <div style={{ background: '#2D5A27', padding: '20px 28px', borderRadius: '7px 7px 0 0' }}
          className="d-flex justify-content-between align-items-center">
          <div>
            <h4 style={{ color: '#fff', margin: 0 }}>🌿 CampOrganic</h4>
            <small style={{ color: '#c8e6c9' }}>camporganic@gmail.com</small>
          </div>
          <div className="text-end">
            <h5 style={{ color: '#fff', margin: 0 }}>RECIBO #{pedido.id}</h5>
            <small style={{ color: '#c8e6c9' }}>{fecha}</small>
          </div>
        </div>

        {/* Datos del cliente */}
        <div style={{ background: '#f0f7f0', padding: '14px 28px', borderBottom: '1px solid #ddd' }}>
          <Row>
            <Col>
              <small className="text-muted">CLIENTE</small>
              <p className="mb-0 fw-bold">{pedido.cliente_nombre}</p>
              <small className="text-muted">{pedido.cliente_email}</small>
            </Col>
            <Col className="text-end">
              <small className="text-muted">ESTADO</small>
              <div>
                <Badge bg={estadoVariant[pedido.estado]} className="fs-6 px-3 py-1">
                  {estadoLabel[pedido.estado]}
                </Badge>
              </div>
            </Col>
          </Row>
        </div>

        {/* Tabla de productos */}
        <Card.Body className="px-4">
          <table className="table table-sm mb-0">
            <thead style={{ background: '#2D5A27' }}>
              <tr>
                <th style={{ color: '#fff', fontWeight: 500, fontSize: 12 }}>CÓD.</th>
                <th style={{ color: '#fff', fontWeight: 500, fontSize: 12 }}>PRODUCTO</th>
                <th style={{ color: '#fff', fontWeight: 500, fontSize: 12, textAlign: 'center' }}>CANT.</th>
                <th style={{ color: '#fff', fontWeight: 500, fontSize: 12, textAlign: 'right' }}>P. UNIT.</th>
                <th style={{ color: '#fff', fontWeight: 500, fontSize: 12, textAlign: 'right' }}>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items?.map(item => (
                <tr key={item.id}>
                  <td className="font-monospace text-muted" style={{ fontSize: 12 }}>
                    {item.codigo_producto || '—'}
                  </td>
                  <td>{item.nombre_producto}</td>
                  <td className="text-center">
                    {item.cantidad} <small className="text-muted">{item.unidad || 'uds.'}</small>
                  </td>
                  <td className="text-end">S/.{parseFloat(item.precio_unitario).toFixed(2)}</td>
                  <td className="text-end fw-bold">S/.{(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-end text-muted" style={{ fontSize: 13 }}>Envío:</td>
                <td className="text-end text-success" style={{ fontSize: 13 }}>Gratis</td>
              </tr>
              <tr style={{ borderTop: '2px solid #2D5A27' }}>
                <td colSpan={4} className="text-end fw-bold fs-5">TOTAL:</td>
                <td className="text-end fw-bold fs-5 text-success">
                  S/.{parseFloat(pedido.total).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </Card.Body>

        {/* Pago y código */}
        <div style={{ padding: '0 28px 24px' }}>
          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 6, padding: 16 }}>
            <p className="mb-2">
              <strong>Método de pago:</strong>{' '}
              {metodoPagoLabel[pedido.metodo_pago] || pedido.metodo_pago}
            </p>
            {pedido.codigo_verificacion && (
              <p className="mb-0">
                <strong>Código de verificación:</strong>{' '}
                <span className="font-monospace fw-bold text-success fs-5" style={{ letterSpacing: '0.25rem' }}>
                  {pedido.codigo_verificacion}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Footer del recibo */}
        <div style={{ background: '#f0f0f0', padding: '12px 28px', borderRadius: '0 0 7px 7px', textAlign: 'center' }}>
          <small className="text-muted">
            CampOrganic · Productos orgánicos frescos · camporganic@gmail.com
          </small>
        </div>
      </Card>
    </Container>
  );
}

function ListaPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    api.get('/pedidos/mis-pedidos')
      .then(({ data }) => setPedidos(data.data))
      .catch(() => setError('No se pudieron cargar tus pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelado = (pedidoId) => {
    setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: 'cancelado' } : p));
    setCancelando(null);
    setSuccessMsg('Tu pedido fue cancelado exitosamente.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  if (loading) return <SkeletonOrderList />;

  return (
    <Container className="py-5">
      <h2 className="fw-bold mb-4">Mis Pedidos</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {pedidos.length === 0 ? (
        <Card className="shadow-sm text-center py-5">
          <Card.Body>
            <p className="text-muted mb-3">Aún no tienes pedidos.</p>
            <Button as={Link} to="/productos" variant="success">Explorar Productos</Button>
          </Card.Body>
        </Card>
      ) : (
        pedidos.map(pedido => (
          <Card key={pedido.id} className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-1">Pedido #{pedido.id}</h6>
                  <small className="text-muted">
                    {new Date(pedido.creado_en).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                    {' · '}{pedido.items?.length} producto(s)
                  </small>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-success mb-1">S/.{parseFloat(pedido.total).toFixed(2)}</div>
                  <Badge bg={estadoVariant[pedido.estado]}>{estadoLabel[pedido.estado]}</Badge>
                </div>
              </div>
              <div className="mt-2 d-flex gap-2 flex-wrap align-items-center">
                <Button as={Link} to={`/mis-pedidos/${pedido.id}`} size="sm" variant="outline-success">
                  Ver detalle
                </Button>
                {['pendiente', 'procesando'].includes(pedido.estado) && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => setCancelando(cancelando === pedido.id ? null : pedido.id)}
                  >
                    Cancelar pedido
                  </Button>
                )}
                {pedido.estado === 'enviado' && (
                  <small className="text-muted">No cancelable — ya está en camino</small>
                )}
              </div>
              {cancelando === pedido.id && (
                <FormularioCancelacion
                  pedidoId={pedido.id}
                  onCancelado={() => handleCancelado(pedido.id)}
                  onCerrar={() => setCancelando(null)}
                />
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export function MisPedidos() {
  return <ListaPedidos />;
}

export function DetallePedidoPage() {
  return <DetallePedido />;
}
