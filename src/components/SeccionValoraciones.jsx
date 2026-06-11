import { useState, useEffect } from 'react';
import { Alert, Button, Form, Spinner, ProgressBar } from 'react-bootstrap';
import api from '../services/api';

function Estrellas({ valor, max = 5, onClick, size = '1.2rem' }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          style={{
            color: i < valor ? '#ffc107' : '#dee2e6',
            cursor: onClick ? 'pointer' : 'default',
          }}
          onClick={() => onClick && onClick(i + 1)}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function SeccionValoraciones({ productoId, user }) {
  const [valoraciones, setValoraciones] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [miValoracion, setMiValoracion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);

  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const esCliente = user && user.rol !== 'admin' && user.rol !== 'mayorista';

  const cargar = async () => {
    try {
      const { data } = await api.get(`/valoraciones/producto/${productoId}`);
      setValoraciones(data.data);
      setResumen(data.resumen);
    } catch {
      // silencioso — si no hay valoraciones, arranca vacío
    }
    if (esCliente) {
      try {
        const { data } = await api.get(`/valoraciones/producto/${productoId}/mia`);
        setMiValoracion(data.data);
        if (data.data) {
          setPuntuacion(data.data.puntuacion);
          setComentario(data.data.comentario || '');
        }
      } catch {
        setMiValoracion(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    cargar();
  }, [productoId, user]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setExito('');
    try {
      if (miValoracion) {
        await api.put(`/valoraciones/producto/${productoId}`, { puntuacion, comentario });
        setExito('Valoración actualizada');
      } else {
        await api.post(`/valoraciones/producto/${productoId}`, { puntuacion, comentario });
        setExito('Valoración publicada. ¡Gracias!');
      }
      setEditando(false);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la valoración');
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Eliminar tu valoración?')) return;
    try {
      await api.delete(`/valoraciones/producto/${productoId}`);
      setMiValoracion(null);
      setPuntuacion(5);
      setComentario('');
      await cargar();
    } catch {
      setError('Error al eliminar la valoración');
    }
  };

  const formatFecha = (ts) =>
    new Date(ts).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className="py-3"><Spinner size="sm" /> Cargando valoraciones...</div>;

  const total = resumen?.total || 0;

  return (
    <div className="mt-5 pt-4 border-top">
      <h4 className="fw-bold mb-4">Valoraciones de clientes</h4>

      {/* Resumen */}
      {total > 0 && (
        <div className="row g-3 mb-4 align-items-center">
          <div className="col-auto text-center">
            <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{resumen.promedio}</div>
            <Estrellas valor={Math.round(resumen.promedio)} size="1.4rem" />
            <div className="text-muted small mt-1">{total} {total === 1 ? 'valoración' : 'valoraciones'}</div>
          </div>
          <div className="col">
            {[5, 4, 3, 2, 1].map((n) => {
              const cant = Number(resumen[['', 'uno', 'dos', 'tres', 'cuatro', 'cinco'][n]]) || 0;
              const pct = total > 0 ? Math.round((cant / total) * 100) : 0;
              return (
                <div key={n} className="d-flex align-items-center gap-2 mb-1">
                  <span className="small text-muted" style={{ width: 14 }}>{n}</span>
                  <span style={{ color: '#ffc107', fontSize: '0.85rem' }}>★</span>
                  <div style={{ flex: 1 }}>
                    <ProgressBar now={pct} style={{ height: 8 }} variant="warning" />
                  </div>
                  <span className="small text-muted" style={{ width: 28, textAlign: 'right' }}>{cant}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {total === 0 && !esCliente && (
        <p className="text-muted">Aún no hay valoraciones para este producto.</p>
      )}

      {/* Feedback al usuario */}
      {exito && <Alert variant="success" dismissible onClose={() => setExito('')}>{exito}</Alert>}
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      {/* Sección del cliente */}
      {esCliente && (
        <div className="mb-4">
          {miValoracion && !editando ? (
            <div className="border rounded p-3 bg-light mb-3">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <div>
                  <strong className="me-2">Tu valoración</strong>
                  <Estrellas valor={miValoracion.puntuacion} />
                </div>
                <div className="d-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={() => setEditando(true)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={handleEliminar}>
                    Eliminar
                  </Button>
                </div>
              </div>
              {miValoracion.comentario && <p className="mb-0 mt-2 small">{miValoracion.comentario}</p>}
            </div>
          ) : (miValoracion && editando) || !miValoracion ? (
            <div className="border rounded p-3 bg-light mb-3">
              <h6 className="mb-3">{miValoracion ? 'Editar tu valoración' : 'Deja tu valoración'}</h6>
              <Form onSubmit={handleEnviar}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Puntuación</Form.Label>
                  <div>
                    <Estrellas valor={puntuacion} onClick={setPuntuacion} size="2rem" />
                    <span className="ms-2 small text-muted">
                      {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][puntuacion]}
                    </span>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Comentario (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="¿Qué te pareció el producto?"
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    maxLength={500}
                  />
                  <Form.Text className="text-muted">{comentario.length}/500</Form.Text>
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="success" size="sm" disabled={enviando}>
                    {enviando ? <><Spinner size="sm" className="me-1" />Guardando...</> : (miValoracion ? 'Actualizar' : 'Publicar valoración')}
                  </Button>
                  {editando && (
                    <Button size="sm" variant="outline-secondary" onClick={() => setEditando(false)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          ) : null}
        </div>
      )}

      {/* Listado de valoraciones */}
      {valoraciones.length > 0 && (
        <div>
          {valoraciones.map(v => (
            <div key={v.id} className="border-bottom pb-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong className="me-2">{v.usuario_nombre}</strong>
                  <Estrellas valor={v.puntuacion} />
                </div>
                <span className="text-muted small">{formatFecha(v.creado_en)}</span>
              </div>
              {v.comentario && <p className="mb-0 text-secondary small">{v.comentario}</p>}
            </div>
          ))}
        </div>
      )}

      {total === 0 && esCliente && !miValoracion && (
        <p className="text-muted small">Sé el primero en valorar este producto.</p>
      )}
    </div>
  );
}

export default SeccionValoraciones;
