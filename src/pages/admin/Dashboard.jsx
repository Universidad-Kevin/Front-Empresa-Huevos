import { Container, Row, Col, Card, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import api from "../../services/api";
import { SkeletonDashboard } from "../../components/SkeletonLoader";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [clientesRecientes, setClientesRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [estadRes, usuariosRes, productosRes] = await Promise.all([
          api.get("/admin/estadisticas"),
          api.get("/usuarios/all"),
          api.get("/productos/all"),
        ]);

        const productos = productosRes.data.data;
        const usuarios = usuariosRes.data.data;
        const est = estadRes.data.data;

        setStats({
          totalProductos: productos.length,
          productosActivos: productos.filter(p => p.estado === "activo").length,
          stockTotal: productos.reduce((s, p) => s + (p.stock || 0), 0),
          totalClientes: usuarios.length,
          ventasMes: est.ventas_mes,
          pedidosMes: est.pedidos_mes,
          clientesNuevos: est.clientes_nuevos,
          tendencias: est.tendencias || [],
          pedidosPendientes: (est.pedidos_por_estado || []).find(e => e.estado === 'pendiente')?.total || 0,
        });
        setClientesRecientes(usuarios.slice(0, 4));
      } catch {
        setError("Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <SkeletonDashboard />;

  const tendenciasData = (stats?.tendencias || []).map(t => ({
    mes: t.mes_corto,
    total: parseFloat(t.total),
  }));

  const fmtSol = (v) =>
    `S/.${parseFloat(v || 0).toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const statsCards = [
    { title: "Total Productos", value: stats.totalProductos, icon: "📦", color: "primary", link: "/admin/productos" },
    { title: "Ventas del Mes", value: fmtSol(stats.ventasMes), icon: "💰", color: "success", link: "/admin/estadisticas" },
    { title: "Clientes Registrados", value: stats.totalClientes, icon: "👥", color: "info", link: "/admin/usuarios" },
    { title: "Stock Total", value: `${stats.stockTotal} uds`, icon: "📊", color: "warning", link: "/admin/inventario" },
  ];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Dashboard</h1>
          <p className="text-muted">Resumen general del sistema — CampOrganic</p>
        </Col>
      </Row>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {/* KPIs */}
      <Row className="g-3 mb-4">
        {statsCards.map((s, i) => (
          <Col key={i} xl={3} md={6}>
            <Card as={Link} to={s.link} className="text-decoration-none border-0 shadow-sm h-100 hover-card">
              <Card.Body className="text-center py-4">
                <div className={`fs-1 mb-2 text-${s.color}`}>{s.icon}</div>
                <h3 className={`fw-bold text-${s.color} mb-0`}>{s.value}</h3>
                <p className="text-muted small mb-0 mt-1">{s.title}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3 mb-4">
        {/* Mini gráfico de tendencias */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-transparent border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0">📈 Tendencia de ventas (6 meses)</h6>
            </Card.Header>
            <Card.Body>
              {tendenciasData.length === 0 ? (
                <p className="text-muted text-center py-3">Sin datos aún</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={tendenciasData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={v => `S/.${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 11 }}
                      width={50}
                    />
                    <Tooltip
                      formatter={v => [`S/.${parseFloat(v).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`, "Ventas"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#198754"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#198754" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 d-flex justify-content-between text-muted small">
                <span>{stats.pedidosMes} pedidos este mes</span>
                <Link to="/admin/estadisticas" className="text-decoration-none text-success">Ver estadísticas →</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Acciones rápidas */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Acciones Rápidas</h6>
                <Badge bg="primary">Admin</Badge>
              </div>
              <Row className="g-2">
                {[
                  { to: "/admin/agregar-producto", label: "➕ Agregar Producto", v: "success" },
                  { to: "/admin/productos", label: "📦 Gestionar Productos", v: "outline-success" },
                  { to: "/admin/pedidos", label: `🛒 Ver Pedidos${stats.pedidosPendientes > 0 ? ` (${stats.pedidosPendientes})` : ''}`, v: "warning" },
                  { to: "/admin/pagos", label: "💳 Pagos pendientes", v: "outline-warning" },
                  { to: "/admin/inventario", label: "📊 Inventario", v: "outline-secondary" },
                  { to: "/admin/cupones", label: "🏷️ Cupones", v: "outline-primary" },
                  { to: "/admin/valoraciones", label: "⭐ Valoraciones", v: "outline-info" },
                  { to: "/admin/auditoria", label: "🔍 Auditoría", v: "outline-dark" },
                  { to: "/admin/configuracion", label: "⚙️ Configuración", v: "outline-secondary" },
                ].map((a, i) => (
                  <Col md={6} key={i}>
                    <Link to={a.to} className={`btn btn-${a.v} btn-sm w-100`}>{a.label}</Link>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estado del sistema + Clientes recientes */}
      <Row className="g-3">
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-3">Estado del Sistema</h6>
              <Row className="text-center g-2">
                <Col xs={4}>
                  <div className={`fs-3 text-${stats.productosActivos > 0 ? 'success' : 'warning'}`}>📦</div>
                  <div className="small text-muted">Productos activos</div>
                  <div className={`fw-bold text-${stats.productosActivos > 0 ? 'success' : 'warning'}`}>
                    {stats.productosActivos} / {stats.totalProductos}
                  </div>
                </Col>
                <Col xs={4}>
                  <div className={`fs-3 text-${stats.stockTotal > 0 ? 'success' : 'danger'}`}>📊</div>
                  <div className="small text-muted">Stock total</div>
                  <div className={`fw-bold text-${stats.stockTotal > 0 ? 'success' : 'danger'}`}>
                    {stats.stockTotal} uds
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="fs-3 text-info">👥</div>
                  <div className="small text-muted">Clientes nuevos</div>
                  <div className="fw-bold text-info">{stats.clientesNuevos}</div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Usuarios Recientes</h6>
                <Link to="/admin/usuarios" className="btn btn-sm btn-outline-primary">Ver Todos</Link>
              </div>
              {clientesRecientes.length === 0 ? (
                <p className="text-muted text-center py-3">No hay usuarios registrados</p>
              ) : (
                clientesRecientes.map(u => (
                  <div key={u.id} className="d-flex align-items-center mb-2 p-2 border rounded">
                    <div className="bg-light rounded-circle p-2 me-2">
                      <span className="text-primary">👤</span>
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 small text-truncate">{u.nombre}</h6>
                        {new Date(u.creado_en) > new Date(Date.now() - 30 * 86400000) && (
                          <Badge bg="success" className="ms-1" style={{ fontSize: '0.65rem' }}>Nuevo</Badge>
                        )}
                      </div>
                      <small className="text-muted">{u.email}</small>
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
