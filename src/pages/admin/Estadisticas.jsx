import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Spinner, Badge } from 'react-bootstrap';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../../services/api';
import Seo from '../../components/Seo';

const COLORES_ESTADO = {
  pendiente:   '#ffc107',
  confirmado:  '#0dcaf0',
  preparando:  '#6f42c1',
  enviado:     '#0d6efd',
  entregado:   '#198754',
  cancelado:   '#dc3545',
  devuelto:    '#6c757d',
};

const ESTADO_LABEL = {
  pendiente: 'Pendiente', confirmado: 'Confirmado', preparando: 'En Preparación',
  enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto',
};

const fmtSol = (v) => `S/.${parseFloat(v).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtSolCompleto = (v) => `S/.${parseFloat(v).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;

function TooltipVentas({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded shadow-sm p-2" style={{ fontSize: '0.8rem' }}>
      <strong>{label}</strong>
      <div className="text-success">{fmtSolCompleto(payload[0]?.value || 0)}</div>
      {payload[1] && <div className="text-secondary">{payload[1].value} pedidos</div>}
    </div>
  );
}

function MetricaCard({ icono, valor, etiqueta, color, extra }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="text-center py-4">
        <div className={`fs-2 text-${color} mb-1`}>{icono}</div>
        <h2 className={`h3 fw-bold text-${color} mb-0`}>{valor}</h2>
        {extra && <div className="small mt-1">{extra}</div>}
        <p className="text-muted small mb-0 mt-1">{etiqueta}</p>
      </Card.Body>
    </Card>
  );
}

function Estadisticas() {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/estadisticas')
      .then(({ data }) => setDatos(data.data))
      .catch(() => setError('Error al cargar las estadísticas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" variant="success" />
      <p className="mt-3 text-muted">Cargando estadísticas…</p>
    </div>
  );

  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;

  const crecimientoNum = datos.crecimiento !== null ? parseFloat(datos.crecimiento) : null;

  // Preparar datos para recharts
  const tendenciasData = (datos.tendencias || []).map(t => ({
    mes: t.mes_corto,
    total: parseFloat(t.total),
    pedidos: parseInt(t.pedidos),
  }));

  const ventasDiariasData = (datos.ventas_diarias || []).map(t => ({
    dia: new Date(t.dia).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),
    total: parseFloat(t.total),
    pedidos: parseInt(t.pedidos),
  }));

  const topData = (datos.top_productos || []).map(p => ({
    nombre: p.nombre.length > 18 ? p.nombre.slice(0, 16) + '…' : p.nombre,
    unidades: parseInt(p.unidades),
    ingresos: parseFloat(p.ingresos),
  }));

  const estadoData = (datos.pedidos_por_estado || []).map(e => ({
    name: ESTADO_LABEL[e.estado] || e.estado,
    value: parseInt(e.total),
    color: COLORES_ESTADO[e.estado] || '#adb5bd',
  }));

  const ticketPromedio = datos.pedidos_mes > 0
    ? (datos.ventas_mes / datos.pedidos_mes).toFixed(2)
    : 0;

  return (
    <Container fluid className="py-4 px-4">
      <Seo path="/admin/estadisticas" title="Estadísticas" noindex />
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Estadísticas</h1>
          <p className="text-muted mb-0">Métricas y análisis de rendimiento — datos en tiempo real</p>
        </Col>
      </Row>

      {/* KPIs */}
      <Row className="g-3 mb-4">
        <Col xl={3} md={6}>
          <MetricaCard
            icono="💰"
            valor={fmtSol(datos.ventas_mes)}
            etiqueta="Ventas del Mes"
            color="success"
            extra={
              crecimientoNum !== null ? (
                <Badge bg={crecimientoNum >= 0 ? 'success' : 'danger'}>
                  {crecimientoNum >= 0 ? '▲' : '▼'} {Math.abs(crecimientoNum)}% vs mes ant.
                </Badge>
              ) : null
            }
          />
        </Col>
        <Col xl={3} md={6}>
          <MetricaCard
            icono="📦"
            valor={datos.pedidos_mes}
            etiqueta="Pedidos este Mes"
            color="primary"
            extra={<span className="text-muted">Ticket prom. {fmtSolCompleto(ticketPromedio)}</span>}
          />
        </Col>
        <Col xl={3} md={6}>
          <MetricaCard
            icono="👥"
            valor={datos.clientes_nuevos}
            etiqueta="Clientes Nuevos (30 días)"
            color="info"
          />
        </Col>
        <Col xl={3} md={6}>
          <MetricaCard
            icono="📅"
            valor={fmtSol(datos.ventas_mes_anterior)}
            etiqueta="Ventas Mes Anterior"
            color="secondary"
          />
        </Col>
      </Row>

      {/* Ventas diarias — 30 días */}
      <Row className="g-3 mb-4">
        <Col xl={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-3 pb-0">
              <h3 className="h6 fw-bold mb-0">📈 Ventas diarias — últimos 30 días</h3>
            </Card.Header>
            <Card.Body>
              {ventasDiariasData.length === 0 ? (
                <div className="text-center py-4 text-muted">Sin ventas en los últimos 30 días</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={ventasDiariasData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#198754" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#198754" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="dia"
                      tick={{ fontSize: 11 }}
                      interval={Math.floor(ventasDiariasData.length / 6)}
                    />
                    <YAxis
                      tickFormatter={v => v >= 1000 ? `S/.${(v/1000).toFixed(1)}k` : `S/.${Math.round(v)}`}
                      tick={{ fontSize: 11 }}
                      width={55}
                    />
                    <Tooltip content={<TooltipVentas />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#198754"
                      strokeWidth={2}
                      fill="url(#gradVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Pedidos por estado — PieChart */}
        <Col xl={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-3 pb-0">
              <h3 className="h6 fw-bold mb-0">🥧 Pedidos por estado</h3>
            </Card.Header>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              {estadoData.length === 0 ? (
                <p className="text-muted">Sin pedidos</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={estadoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {estadoData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                    {estadoData.map((e, i) => (
                      <div key={i} className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: e.color }} />
                        <span>{e.name} ({e.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tendencias mensuales + Top productos */}
      <Row className="g-3 mb-4">
        <Col xl={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-3 pb-0">
              <h3 className="h6 fw-bold mb-0">📊 Ventas mensuales — últimos 6 meses</h3>
            </Card.Header>
            <Card.Body>
              {tendenciasData.length === 0 ? (
                <p className="text-muted text-center py-3">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={tendenciasData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={v => v >= 1000 ? `S/.${(v/1000).toFixed(1)}k` : `S/.${Math.round(v)}`}
                      tick={{ fontSize: 11 }}
                      width={55}
                    />
                    <Tooltip content={<TooltipVentas />} />
                    <Bar dataKey="total" fill="#198754" radius={[4, 4, 0, 0]} name="Ventas" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xl={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-3 pb-0">
              <h3 className="h6 fw-bold mb-0">🏆 Top 5 productos más vendidos</h3>
            </Card.Header>
            <Card.Body>
              {topData.length === 0 ? (
                <p className="text-muted text-center py-3">Sin ventas aún</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={topData}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="nombre"
                      type="category"
                      tick={{ fontSize: 11 }}
                      width={100}
                    />
                    <Tooltip
                      formatter={(v, n) => [
                        n === 'unidades' ? `${v} uds` : fmtSolCompleto(v),
                        n === 'unidades' ? 'Unidades' : 'Ingresos',
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Bar dataKey="unidades" fill="#0d6efd" radius={[0, 3, 3, 0]} name="Unidades" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Comparativo mensual detallado */}
      <Row className="g-3">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h3 className="h6 fw-bold mb-3">📋 Comparativo mensual</h3>
              <Row className="text-center g-3">
                <Col md={3}>
                  <p className="text-muted small mb-1">Mes Anterior</p>
                  <h4 className="h5 text-secondary">{fmtSolCompleto(datos.ventas_mes_anterior)}</h4>
                </Col>
                <Col md={3}>
                  <p className="text-muted small mb-1">Mes Actual</p>
                  <h4 className="h5 text-success">{fmtSolCompleto(datos.ventas_mes)}</h4>
                </Col>
                <Col md={3}>
                  <p className="text-muted small mb-1">Crecimiento</p>
                  {crecimientoNum === null ? (
                    <h4 className="h5 text-secondary">Sin datos previos</h4>
                  ) : (
                    <h4 className={`h5 ${crecimientoNum >= 0 ? 'text-success' : 'text-danger'}`}>
                      {crecimientoNum >= 0 ? '+' : ''}{crecimientoNum}%
                    </h4>
                  )}
                </Col>
                <Col md={3}>
                  <p className="text-muted small mb-1">Ticket Promedio</p>
                  <h4 className="h5 text-primary">{fmtSolCompleto(ticketPromedio)}</h4>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Estadisticas;
