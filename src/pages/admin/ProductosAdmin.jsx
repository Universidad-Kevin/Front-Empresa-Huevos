import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, Pagination, Form, InputGroup, Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { SkeletonTable } from "../../components/SkeletonLoader";

const POR_PAGINA = 10;

function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const navigate = useNavigate();

  const [reportes, setReportes] = useState([]);
  const [loadingReportes, setLoadingReportes] = useState(true);
  const [revisando, setRevisando] = useState(null);

  useEffect(() => {
    fetchProductos();
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      const res = await api.get("/productos/reportes-stock");
      setReportes(res.data.data);
    } catch {
      // silencioso — no bloquea la página principal
    } finally {
      setLoadingReportes(false);
    }
  };

  const handleMarcarRevisado = async (reporteId) => {
    setRevisando(reporteId);
    try {
      await api.put(`/productos/reportes-stock/${reporteId}/revisar`);
      setReportes(prev => prev.map(r => r.id === reporteId ? { ...r, estado: "revisado" } : r));
    } catch {
      alert("Error al marcar el reporte");
    } finally {
      setRevisando(null);
    }
  };

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/productos/all");
      setProductos(response.data.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${nombre}"?`)) {
      try {
        await api.delete(`/productos/${id}`);
        fetchProductos();
      } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  const getStockVariant = (stock) => {
    if (stock > 50) return "success";
    if (stock > 10) return "warning";
    return "danger";
  };

  const getEstadoBadge = (estado) => estado === "activo" ? "success" : "secondary";

  // Filtrado
  const productosFiltrados = useMemo(() => {
    let lista = [...productos];
    if (busqueda) lista = lista.filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()));
    if (filtroCategoria) lista = lista.filter(p => p.categoria === filtroCategoria);
    if (filtroEstado) lista = lista.filter(p => p.estado === filtroEstado);
    return lista;
  }, [productos, busqueda, filtroCategoria, filtroEstado]);

  // Resetear página al cambiar filtros
  useEffect(() => { setPagina(1); }, [busqueda, filtroCategoria, filtroEstado]);

  const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA);
  const paginaActual = Math.min(pagina, totalPaginas || 1);
  const productosPagina = productosFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const limpiarFiltros = () => { setBusqueda(""); setFiltroCategoria(""); setFiltroEstado(""); };
  const hayFiltros = busqueda || filtroCategoria || filtroEstado;

  if (loading) return <SkeletonTable rows={6} cols={7} />;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Gestión de Productos</h1>
              <p className="text-muted">Administra tu inventario de productos</p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Button as={Link} to="/admin/agregar-producto" variant="success">
                ➕ Agregar Producto
              </Button>
              <Button as={Link} to="/admin/productos-inactivos" variant="outline-warning">
                📋 Inactivos
              </Button>
              <a href="#reportes-stock" className="btn btn-outline-danger position-relative">
                ⚠️ Reportes
                {reportes.filter(r => r.estado === "pendiente").length > 0 && (
                  <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill">
                    {reportes.filter(r => r.estado === "pendiente").length}
                  </Badge>
                )}
              </a>
              <Button variant="outline-secondary" onClick={() => navigate("/admin")}>
                ← Volver
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={fetchProductos}>
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="shadow-sm mb-3">
        <Card.Body className="py-3">
          <Row className="g-2 align-items-center">
            <Col md={4}>
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select size="sm" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                <option value="">Todas las categorías</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="especial">Especial</option>
                <option value="gourmet">Gourmet</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select size="sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              {hayFiltros && (
                <Button size="sm" variant="outline-secondary" onClick={limpiarFiltros}>
                  Limpiar
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Info de resultados */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <small className="text-muted">
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
          {hayFiltros && <Badge bg="success" className="ms-2">Filtros activos</Badge>}
        </small>
        <small className="text-muted">
          Página {paginaActual} de {totalPaginas || 1} · {POR_PAGINA} por página
        </small>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosPagina.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    {producto.codigo
                      ? <Badge bg="light" text="dark" className="border font-monospace">{producto.codigo}</Badge>
                      : <span className="text-muted small">—</span>
                    }
                  </td>
                  <td>
                    <strong>{producto.nombre}</strong>
                    <br />
                    <small className="text-muted">
                      {producto.descripcion?.substring(0, 50)}{producto.descripcion?.length > 50 ? '…' : ''}
                    </small>
                  </td>
                  <td>
                    <Badge bg="secondary" className="text-capitalize">{producto.categoria}</Badge>
                  </td>
                  <td>S/.{parseFloat(producto.precio).toFixed(2)} <small className="text-muted">/{producto.unidad || 'uds.'}</small></td>
                  <td>
                    <Badge bg={getStockVariant(producto.stock)}>
                      {producto.stock} {producto.unidad || 'uds.'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getEstadoBadge(producto.estado)} className="text-capitalize">
                      {producto.estado}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" as={Link} to={`/admin/editar-producto/${producto.id}`}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleEliminar(producto.id, producto.nombre)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">
                {hayFiltros ? 'No hay productos con esos filtros.' : 'No hay productos registrados.'}
              </p>
              {hayFiltros
                ? <Button variant="outline-secondary" size="sm" onClick={limpiarFiltros}>Limpiar filtros</Button>
                : <Button as={Link} to="/admin/agregar-producto" variant="success">Agregar Primer Producto</Button>
              }
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination size="sm">
            <Pagination.First onClick={() => setPagina(1)} disabled={paginaActual === 1} />
            <Pagination.Prev onClick={() => setPagina(p => p - 1)} disabled={paginaActual === 1} />
            {[...Array(totalPaginas)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={paginaActual === i + 1}
                onClick={() => setPagina(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => setPagina(p => p + 1)} disabled={paginaActual === totalPaginas} />
            <Pagination.Last onClick={() => setPagina(totalPaginas)} disabled={paginaActual === totalPaginas} />
          </Pagination>
        </div>
      )}

      {/* Reportes de stock */}
      <div id="reportes-stock" className="mt-5">
        <div className="d-flex align-items-center gap-2 mb-3">
          <h5 className="fw-bold mb-0">⚠️ Reportes de stock de clientes</h5>
          {reportes.filter(r => r.estado === "pendiente").length > 0 && (
            <Badge bg="danger">{reportes.filter(r => r.estado === "pendiente").length} pendientes</Badge>
          )}
        </div>
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            {loadingReportes ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" variant="secondary" />
              </div>
            ) : reportes.length === 0 ? (
              <p className="text-muted text-center py-4 mb-0 small">
                No hay reportes de stock de los clientes.
              </p>
            ) : (
              <Table responsive hover size="sm" className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Stock actual</th>
                    <th>Tipo</th>
                    <th>Mensaje</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {reportes.map(r => (
                    <tr key={r.id} className={r.estado === "revisado" ? "table-secondary opacity-75" : ""}>
                      <td>
                        <div className="fw-bold small">{r.producto_nombre}</div>
                        {r.producto_codigo && (
                          <code className="text-muted" style={{ fontSize: 11 }}>{r.producto_codigo}</code>
                        )}
                        <Link to={`/admin/editar-producto/${r.producto_id}`} className="d-block" style={{ fontSize: 11 }}>
                          Ver producto
                        </Link>
                      </td>
                      <td>
                        <Badge bg={r.producto_stock > 10 ? "success" : r.producto_stock > 0 ? "warning" : "danger"}>
                          {r.producto_stock} uds.
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={r.tipo === "sin_stock" ? "danger" : "warning"} text={r.tipo === "sin_stock" ? undefined : "dark"}>
                          {r.tipo === "sin_stock" ? "Sin stock" : "Poco stock"}
                        </Badge>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: 180 }}>
                        {r.mensaje || <span className="fst-italic">—</span>}
                      </td>
                      <td className="small">
                        <div>{r.usuario_nombre}</div>
                        <div className="text-muted">{r.usuario_email}</div>
                      </td>
                      <td className="small text-muted text-nowrap">
                        {new Date(r.creado_en).toLocaleDateString("es-PE", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <Badge bg={r.estado === "revisado" ? "secondary" : "warning"} text={r.estado === "revisado" ? undefined : "dark"}>
                          {r.estado === "revisado" ? "Revisado" : "Pendiente"}
                        </Badge>
                      </td>
                      <td>
                        {r.estado === "pendiente" && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            disabled={revisando === r.id}
                            onClick={() => handleMarcarRevisado(r.id)}
                          >
                            {revisando === r.id ? <Spinner animation="border" size="sm" /> : "✓ Revisado"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Estadísticas rápidas */}
      {productos.length > 0 && (
        <Row className="mt-4">
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-primary">{productos.length}</h4>
                <Card.Text className="text-muted">Total Productos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-success">{productos.filter(p => p.estado === "activo").length}</h4>
                <Card.Text className="text-muted">Activos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-warning">{productos.filter(p => p.stock <= 10).length}</h4>
                <Card.Text className="text-muted">Stock Bajo</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-info">
                  S/.{productos.reduce((sum, p) => sum + p.precio * p.stock, 0).toFixed(2)}
                </h4>
                <Card.Text className="text-muted">Valor Inventario</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default ProductosAdmin;
