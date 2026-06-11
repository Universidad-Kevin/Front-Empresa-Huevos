import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, InputGroup, Form,
} from 'react-bootstrap';
import api from '../../services/api';
import { SkeletonTable } from '../../components/SkeletonLoader';

function Estrellas({ valor }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < valor ? '#ffc107' : '#dee2e6' }}>★</span>
      ))}
    </span>
  );
}

function Valoraciones() {
  const [valoraciones, setValoraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstrellas, setFiltroEstrellas] = useState('');
  const [eliminando, setEliminando] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/valoraciones/admin');
      setValoraciones(data.data);
    } catch {
      setError('Error al cargar las valoraciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta valoración?')) return;
    setEliminando(id);
    try {
      await api.delete(`/valoraciones/admin/${id}`);
      setValoraciones(prev => prev.filter(v => v.id !== id));
    } catch {
      setError('Error al eliminar la valoración.');
    } finally {
      setEliminando(null);
    }
  };

  const formatFecha = (ts) =>
    new Date(ts).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });

  const filtradas = valoraciones.filter(v => {
    const q = busqueda.toLowerCase();
    const coincideBusqueda = !q
      || v.usuario_nombre.toLowerCase().includes(q)
      || v.producto_nombre.toLowerCase().includes(q)
      || (v.usuario_email || '').toLowerCase().includes(q);
    const coincideEstrellas = !filtroEstrellas || v.puntuacion === Number(filtroEstrellas);
    return coincideBusqueda && coincideEstrellas;
  });

  const promedio = valoraciones.length
    ? (valoraciones.reduce((s, v) => s + v.puntuacion, 0) / valoraciones.length).toFixed(1)
    : '—';

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Valoraciones</h2>
          <p className="text-muted">Gestión de reseñas de productos</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Resumen */}
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <div className="display-6 fw-bold text-primary">{valoraciones.length}</div>
            <div className="text-muted small">Total valoraciones</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <div className="display-6 fw-bold text-warning">{promedio}</div>
            <div className="text-muted small">Promedio global</div>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm text-center py-3">
            <div className="display-6 fw-bold text-success">
              {valoraciones.filter(v => v.puntuacion >= 4).length}
            </div>
            <div className="text-muted small">Con 4-5 estrellas</div>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por usuario, producto o email..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select value={filtroEstrellas} onChange={e => setFiltroEstrellas(e.target.value)}>
                <option value="">Todas las estrellas</option>
                {[5, 4, 3, 2, 1].map(n => (
                  <option key={n} value={n}>{'★'.repeat(n)} ({n} estrella{n > 1 ? 's' : ''})</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-4"><SkeletonTable /></div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {valoraciones.length === 0 ? 'Aún no hay valoraciones.' : 'Sin resultados para los filtros aplicados.'}
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Usuario</th>
                  <th>Puntuación</th>
                  <th>Comentario</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(v => (
                  <tr key={v.id}>
                    <td className="text-muted small">{v.id}</td>
                    <td>
                      <div className="fw-bold small">{v.producto_nombre}</div>
                    </td>
                    <td>
                      <div className="small">{v.usuario_nombre}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{v.usuario_email}</div>
                    </td>
                    <td>
                      <Estrellas valor={v.puntuacion} />
                      <Badge
                        bg={v.puntuacion >= 4 ? 'success' : v.puntuacion === 3 ? 'warning' : 'danger'}
                        text={v.puntuacion === 3 ? 'dark' : undefined}
                        className="ms-1"
                      >
                        {v.puntuacion}
                      </Badge>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      {v.comentario
                        ? <span className="small text-secondary">{v.comentario.length > 100 ? v.comentario.slice(0, 100) + '…' : v.comentario}</span>
                        : <span className="text-muted small fst-italic">Sin comentario</span>
                      }
                    </td>
                    <td className="small text-muted">{formatFecha(v.creado_en)}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={eliminando === v.id}
                        onClick={() => handleEliminar(v.id)}
                      >
                        {eliminando === v.id ? '...' : 'Eliminar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {filtradas.length > 0 && (
          <Card.Footer className="text-muted small">
            Mostrando {filtradas.length} de {valoraciones.length} valoraciones
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
}

export default Valoraciones;
