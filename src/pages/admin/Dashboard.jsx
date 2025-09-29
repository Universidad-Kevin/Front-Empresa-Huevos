import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    productosInactivos: 0,
    stockTotal: 0,
    totalClientes: 0,
    clientesNuevos: 0,
    ventasMes: 0,
  });
  const [clientesRecientes, setClientesRecientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Obtener productos
      const productosResponse = await api.get("/productos/all");
      const productos = productosResponse.data.data;

      // Obtener estadísticas de clientes
      const clientesResponse = await api.get("/clientes/stats");
      const clientesStats = clientesResponse.data.data;

      // Obtener clientes recientes
      const clientesResponseAll = await api.get("/clientes");
      const clientesRecientes = clientesResponseAll.data.data.slice(0, 3);

      // Calcular estadísticas
      const totalProductos = productos.length;
      const productosActivos = productos.filter(
        (p) => p.estado === "activo"
      ).length;
      const productosInactivos = productos.filter(
        (p) => p.estado === "inactivo"
      ).length;
      const stockTotal = productos.reduce(
        (sum, producto) => sum + (producto.stock || 0),
        0
      );

      setStats({
        totalProductos,
        productosActivos,
        productosInactivos,
        stockTotal,
        totalClientes: clientesStats.total,
        clientesNuevos: clientesStats.nuevos,
        ventasMes: 2845, // Por ahora simulado
      });

      setClientesRecientes(clientesRecientes);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  // Función simulada para clientes (luego la conectas a tu backend)
  const fetchClientes = async () => {
    // Por ahora datos de ejemplo - luego los traes de tu API
    return [
      {
        id: 1,
        nombre: "Restaurante La Cabaña",
        tipo: "Restaurante",
        fechaRegistro: "2024-01-15",
        esNuevo: false,
        estado: "activo",
      },
      {
        id: 2,
        nombre: "Supermercado Central",
        tipo: "Supermercado",
        fechaRegistro: "2024-01-10",
        esNuevo: true,
        estado: "activo",
      },
      {
        id: 3,
        nombre: "Hotel Paradise",
        tipo: "Hotel",
        fechaRegistro: "2024-01-08",
        esNuevo: true,
        estado: "activo",
      },
      {
        id: 4,
        nombre: "Cafetería Don José",
        tipo: "Cafetería",
        fechaRegistro: "2024-01-05",
        esNuevo: false,
        estado: "activo",
      },
    ];
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsCards = [
    {
      title: "Total Productos",
      value: stats.totalProductos,
      icon: "📦",
      color: "primary",
      link: "/admin/productos",
    },
    {
      title: "Ventas del Mes",
      value: `$${stats.ventasMes.toLocaleString()}`,
      icon: "💰",
      color: "success",
      link: "/admin/estadisticas",
    },
    {
      title: "Clientes Activos",
      value: stats.totalClientes,
      icon: "👥",
      color: "info",
      link: "/admin/clientes",
    },
    {
      title: "Stock Total",
      value: stats.stockTotal,
      icon: "📊",
      color: "warning",
      link: "/admin/productos",
    },
  ];

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando estadísticas...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Dashboard</h1>
          <p className="text-muted">
            Resumen general del sistema - Huevos Orgánicos
          </p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {/* Estadísticas */}
      <Row className="mb-5">
        {statsCards.map((stat, index) => (
          <Col key={index} lg={3} md={6} className="mb-3">
            <Card
              as={Link}
              to={stat.link}
              className="text-decoration-none h-100 shadow-sm hover-card"
            >
              <Card.Body className="text-center">
                <div className={`fs-1 mb-2 text-${stat.color}`}>
                  {stat.icon}
                </div>
                <h3 className={`text-${stat.color}`}>{stat.value}</h3>
                <Card.Text className="text-muted">{stat.title}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Acciones Rápidas y Clientes Recientes */}
      <Row>
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Acciones Rápidas</h5>
                <Badge bg="primary">Admin</Badge>
              </div>
              <Row className="mt-3">
                <Col md={6} className="mb-3">
                  <Link
                    to="/admin/agregar-producto"
                    className="btn btn-success w-100"
                  >
                    ➕ Agregar Producto
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link
                    to="/admin/productos"
                    className="btn btn-outline-primary w-100"
                  >
                    📦 Gestionar Productos
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link
                    to="/admin/agregar-cliente"
                    className="btn btn-info w-100"
                  >
                    👥 Agregar Cliente
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link
                    to="/admin/clientes"
                    className="btn btn-outline-info w-100"
                  >
                    📋 Gestionar Clientes
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link to="/admin/pedidos" className="btn btn-warning w-100">
                    🛒 Ver Pedidos
                  </Link>
                </Col>
                <Col md={6} className="mb-3">
                  <Link
                    to="/admin/configuracion"
                    className="btn btn-outline-secondary w-100"
                  >
                    ⚙️ Configuración
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Clientes Recientes</h5>
                <Link
                  to="/admin/clientes"
                  className="btn btn-sm btn-outline-primary"
                >
                  Ver Todos
                </Link>
              </div>

              <div className="mt-3">
                {clientesRecientes.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted">No hay clientes registrados</p>
                    <Link
                      to="/admin/agregar-cliente"
                      className="btn btn-sm btn-primary"
                    >
                      Agregar Primer Cliente
                    </Link>
                  </div>
                ) : (
                  clientesRecientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="d-flex align-items-center mb-3 p-2 border rounded"
                    >
                      <div className="bg-light rounded-circle p-2 me-3">
                        <span className="text-primary">🏢</span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{cliente.nombre_empresa}</h6>
                            <small className="text-muted">
                              {cliente.tipo_negocio}
                            </small>
                          </div>
                          {/* Puedes agregar un badge para clientes nuevos basado en fecha */}
                          {new Date(cliente.creado_en) >
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                            <Badge bg="success" className="ms-2">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">
                          Contacto: {cliente.contacto_nombre}
                          <br />
                          Registrado:{" "}
                          {new Date(cliente.creado_en).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estado del Sistema */}
      <Row className="mt-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="fw-bold">Estado del Sistema</h5>
              <Row className="mt-3">
                <Col md={4} className="text-center">
                  <div
                    className={`fs-1 mb-2 text-${
                      stats.productosActivos > 0 ? "success" : "warning"
                    }`}
                  >
                    📦
                  </div>
                  <h6>Productos Activos</h6>
                  <p
                    className={`fw-bold text-${
                      stats.productosActivos > 0 ? "success" : "warning"
                    }`}
                  >
                    {stats.productosActivos} / {stats.totalProductos}
                  </p>
                </Col>
                <Col md={4} className="text-center">
                  <div
                    className={`fs-1 mb-2 text-${
                      stats.stockTotal > 0 ? "success" : "danger"
                    }`}
                  >
                    📊
                  </div>
                  <h6>Stock Total</h6>
                  <p
                    className={`fw-bold text-${
                      stats.stockTotal > 0 ? "success" : "danger"
                    }`}
                  >
                    {stats.stockTotal} unidades
                  </p>
                </Col>
                <Col md={4} className="text-center">
                  <div className="fs-1 mb-2 text-info">👥</div>
                  <h6>Clientes Registrados</h6>
                  <p className="fw-bold text-info">
                    {stats.totalClientes} clientes
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
