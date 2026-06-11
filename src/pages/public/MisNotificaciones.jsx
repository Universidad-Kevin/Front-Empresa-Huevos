import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const TIPO_ICONO = {
  pedido_nuevo:      '📦',
  pedido_confirmado: '✅',
  pedido_preparando: '📋',
  pedido_enviado:    '🚚',
  pedido_entregado:  '🎉',
  pedido_cancelado:  '❌',
  pedido_devuelto:   '↩️',
  pago_verificado:   '💳',
  pago_rechazado:    '⚠️',
};

function MisNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const LIMITE = 20;

  const cargar = async (off = 0) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/notificaciones?limite=${LIMITE}&offset=${off}`);
      setNotificaciones(prev => off === 0 ? data.data : [...prev, ...data.data]);
      setNoLeidas(data.no_leidas);
      setTotal(data.total);
      setOffset(off + data.data.length);
    } catch {
      setError('Error al cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(0); }, []);

  const marcarLeida = async (id) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch { /* silencioso */ }
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.patch('/notificaciones/leer-todas');
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {
      setError('Error al marcar como leídas.');
    }
  };

  const limpiarLeidas = async () => {
    if (!confirm('¿Eliminar todas las notificaciones ya leídas?')) return;
    try {
      await api.delete('/notificaciones/limpiar');
      await cargar(0);
    } catch {
      setError('Error al limpiar notificaciones.');
    }
  };

  const formatFecha = (ts) => {
    const d = new Date(ts);
    const ahora = new Date();
    const difMs = ahora - d;
    const difMin = Math.floor(difMs / 60000);
    if (difMin < 1) return 'Hace un momento';
    if (difMin < 60) return `Hace ${difMin} min`;
    const difH = Math.floor(difMin / 60);
    if (difH < 24) return `Hace ${difH}h`;
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <Container className="py-5" style={{ maxWidth: 720 }}>
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">
            Notificaciones
            {noLeidas > 0 && <Badge bg="danger" className="ms-2">{noLeidas}</Badge>}
          </h2>
          <p className="text-muted">{total} notificaciones en total</p>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          {noLeidas > 0 && (
            <Button size="sm" variant="outline-primary" onClick={marcarTodasLeidas}>
              Marcar todas como leídas
            </Button>
          )}
          <Button size="sm" variant="outline-secondary" onClick={limpiarLeidas}>
            Limpiar leídas
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {loading && notificaciones.length === 0 ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : notificaciones.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5 text-muted">
            <div style={{ fontSize: '3rem' }}>🔔</div>
            <p className="mt-2">No tienes notificaciones aún.</p>
            <Button as={Link} to="/productos" variant="success" size="sm">Ver productos</Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          {notificaciones.map((n, i) => (
            <div
              key={n.id}
              className={`p-3 d-flex gap-3 align-items-start${i < notificaciones.length - 1 ? ' border-bottom' : ''}${!n.leida ? ' bg-light' : ''}`}
              style={{ cursor: !n.leida ? 'pointer' : 'default' }}
              onClick={() => !n.leida && marcarLeida(n.id)}
            >
              <div style={{ fontSize: '1.5rem', minWidth: 36, textAlign: 'center' }}>
                {TIPO_ICONO[n.tipo] || '🔔'}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <strong className={n.leida ? 'text-muted' : ''}>{n.titulo}</strong>
                  <span className="text-muted small ms-2 text-nowrap">{formatFecha(n.creado_en)}</span>
                </div>
                {n.mensaje && <p className="mb-0 small text-secondary mt-1">{n.mensaje}</p>}
              </div>
              {!n.leida && (
                <div
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0d6efd', marginTop: 6, flexShrink: 0 }}
                />
              )}
            </div>
          ))}

          {offset < total && (
            <div className="p-3 text-center border-top">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => cargar(offset)}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : 'Cargar más'}
              </Button>
            </div>
          )}
        </Card>
      )}
    </Container>
  );
}

export default MisNotificaciones;
