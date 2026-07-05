import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Modal, Form, Alert, InputGroup,
} from 'react-bootstrap';
import api from '../../services/api';
import { SkeletonTable } from '../../components/SkeletonLoader';
import Seo from '../../components/Seo';

function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [modalPdf, setModalPdf] = useState(false);
  const [pdfData, setPdfData]   = useState(null);
  const [pdfNombre, setPdfNombre] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);

  const cargar = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/facturas');
      setFacturas(data.data);
    } catch {
      setError('Error al cargar los comprobantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtradas = facturas.filter(f => {
    const matchTipo = filtroTipo === 'todos' || f.tipo === filtroTipo;
    const q = busqueda.toLowerCase();
    return matchTipo && (!q ||
      f.numero.toLowerCase().includes(q) ||
      f.nombre_razon_social.toLowerCase().includes(q) ||
      f.documento.includes(q) ||
      String(f.pedido_id).includes(q)
    );
  });

  const stats = {
    boleta:  facturas.filter(f => f.tipo === 'boleta').length,
    factura: facturas.filter(f => f.tipo === 'factura').length,
    total:   facturas.reduce((s, f) => s + parseFloat(f.total), 0),
  };

  const verPdf = async (f) => {
    setPdfData(null);
    setPdfNombre(`${f.numero}.pdf`);
    setModalPdf(true);
    setLoadingPdf(true);
    try {
      const { data } = await api.get(`/facturas/${f.id}/pdf`);
      setPdfData(data.data.pdf);
    } catch {
      setPdfData(null);
    } finally {
      setLoadingPdf(false);
    }
  };

  const descargarPdf = () => {
    if (!pdfData) return;
    const a = document.createElement('a');
    a.href = pdfData;
    a.download = pdfNombre;
    a.click();
  };

  return (
    <Container className="py-4">
      <Seo path="/admin/facturas" title="Facturas" noindex />
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="h2 fw-bold mb-0">Comprobantes de Pago</h1>
          <p className="text-muted mb-0">Boletas y facturas emitidas</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats */}
      <Row className="g-3 mb-4">
        {[
          { label: 'Boletas', value: stats.boleta, color: '#0d6efd', icon: '🧾' },
          { label: 'Facturas', value: stats.factura, color: '#6f42c1', icon: '📄' },
          { label: 'Total facturado', value: `S/.${stats.total.toFixed(2)}`, color: '#198754', icon: '💰' },
        ].map(s => (
          <Col key={s.label} md={4}>
            <Card className="border-0 shadow-sm" style={{ borderLeft: `4px solid ${s.color}` }}>
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

      {/* Filtros */}
      <Card className="shadow-sm mb-4">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col md={6}>
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por número, cliente, RUC/DNI o pedido…"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select aria-label="Filtrar por tipo de comprobante" size="sm" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                <option value="todos">Todos los tipos</option>
                <option value="boleta">Boletas</option>
                <option value="factura">Facturas</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button size="sm" variant="outline-secondary" onClick={cargar}>↻ Actualizar</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="p-3"><SkeletonTable rows={5} cols={7} /></div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div style={{ fontSize: 40 }}>🧾</div>
              <p className="mt-2">No hay comprobantes emitidos aún</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Pedido #</th>
                    <th>Cliente / Razón social</th>
                    <th>Documento</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {filtradas.map(f => (
                    <tr key={f.id}>
                      <td><span className="font-monospace fw-bold">{f.numero}</span></td>
                      <td>
                        <Badge bg={f.tipo === 'factura' ? 'purple' : 'primary'}
                          style={f.tipo === 'factura' ? { background: '#6f42c1' } : {}}>
                          {f.tipo === 'factura' ? '📄 Factura' : '🧾 Boleta'}
                        </Badge>
                      </td>
                      <td>#{f.pedido_id}</td>
                      <td>
                        <div>{f.nombre_razon_social}</div>
                        <small className="text-muted">{f.cliente_nombre || ''}</small>
                      </td>
                      <td>
                        <small className="text-muted">{f.tipo_documento.toUpperCase()}:</small>
                        <br />{f.documento}
                      </td>
                      <td className="fw-bold text-success">S/.{parseFloat(f.total).toFixed(2)}</td>
                      <td>
                        <small className="text-muted">
                          {new Date(f.creado_en).toLocaleDateString('es-PE', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </small>
                      </td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => verPdf(f)}>
                          📥 PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal PDF */}
      <Modal show={modalPdf} onHide={() => setModalPdf(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Comprobante — {pdfNombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: 500 }}>
          {loadingPdf ? (
            <div className="text-center py-5"><div className="spinner-border text-danger" /></div>
          ) : pdfData ? (
            <iframe
              src={pdfData}
              title="PDF Comprobante"
              style={{ width: '100%', height: '70vh', border: 'none' }}
            />
          ) : (
            <p className="text-center text-muted py-5">PDF no disponible</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {pdfData && (
            <Button variant="danger" onClick={descargarPdf}>⬇ Descargar PDF</Button>
          )}
          <Button variant="secondary" onClick={() => setModalPdf(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Facturas;
