import { useState, useEffect, useMemo } from "react";
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, Form, Modal, Spinner, InputGroup, Tabs, Tab,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PaginacionVentana from "../../components/PaginacionVentana";

const TIPOS_LABEL = {
  entrada:     { label: "Entrada",     bg: "success"  },
  salida:      { label: "Salida",      bg: "warning"  },
  ajuste:      { label: "Ajuste",      bg: "info"     },
  pedido:      { label: "Venta",       bg: "primary"  },
  devolucion:  { label: "Devolución",  bg: "secondary"},
  cancelacion: { label: "Cancelación", bg: "light", text: "dark" },
};

const STOCK_POR_PAGINA = 15;
const MOV_POR_PAGINA = 15;

function Inventario() {
  const navigate = useNavigate();
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kardex
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMov, setLoadingMov] = useState(false);
  const [paginaMov, setPaginaMov] = useState(1);
  const [totalPaginasMov, setTotalPaginasMov] = useState(1);
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // Filtro y paginación tabla inventario
  const [busqueda, setBusqueda] = useState("");
  const [soloAlertas, setSoloAlertas] = useState(false);
  const [paginaStock, setPaginaStock] = useState(1);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [tipoAccion, setTipoAccion] = useState("entrada"); // entrada | salida | ajuste | stock_minimo
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [formAccion, setFormAccion] = useState({ cantidad: "", motivo: "", proveedor_id: "" });
  const [proveedores, setProveedores] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [accionError, setAccionError] = useState("");
  const [accionExito, setAccionExito] = useState("");

  useEffect(() => {
    fetchInventario();
    api.get("/proveedores").then(({ data }) => setProveedores((data.data || []).filter(p => p.estado === "activo"))).catch(() => {});
  }, []);
  useEffect(() => { fetchMovimientos(); }, [paginaMov, filtroProducto, filtroTipo]);
  useEffect(() => { setPaginaStock(1); }, [busqueda, soloAlertas]);

  const fetchInventario = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/inventario");
      setInventario(data.data || []);
    } catch {
      setError("Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovimientos = async () => {
    setLoadingMov(true);
    try {
      const params = new URLSearchParams({ page: paginaMov, limit: MOV_POR_PAGINA });
      if (filtroProducto) params.append("producto_id", filtroProducto);
      if (filtroTipo) params.append("tipo", filtroTipo);
      const { data } = await api.get(`/inventario/movimientos?${params}`);
      setMovimientos(data.data || []);
      setTotalPaginasMov(data.pagination?.total_paginas || 1);
    } catch {
      // silencioso
    } finally {
      setLoadingMov(false);
    }
  };

  const abrirAccion = (producto, tipo) => {
    setProductoSeleccionado(producto);
    setTipoAccion(tipo);
    setFormAccion({
      cantidad: tipo === "stock_minimo" ? String(producto.stock_minimo) : "",
      motivo: "",
      proveedor_id: "",
    });
    setAccionError("");
    setAccionExito("");
    setShowModal(true);
  };

  const handleEjecutar = async () => {
    setGuardando(true);
    setAccionError("");
    try {
      if (tipoAccion === "stock_minimo") {
        await api.patch(`/inventario/${productoSeleccionado.id}/stock-minimo`, {
          stock_minimo: parseInt(formAccion.cantidad),
        });
        setAccionExito("Stock mínimo actualizado");
      } else if (tipoAccion === "ajuste") {
        await api.post("/inventario/ajuste", {
          producto_id: productoSeleccionado.id,
          cantidad_nueva: parseInt(formAccion.cantidad),
          motivo: formAccion.motivo,
        });
        setAccionExito(`Stock ajustado a ${formAccion.cantidad}`);
      } else {
        await api.post(`/inventario/${tipoAccion}`, {
          producto_id: productoSeleccionado.id,
          cantidad: parseInt(formAccion.cantidad),
          motivo: formAccion.motivo,
          ...(tipoAccion === "entrada" && formAccion.proveedor_id ? { proveedor_id: formAccion.proveedor_id } : {}),
        });
        setAccionExito(`${tipoAccion === "entrada" ? "Entrada" : "Salida"} registrada`);
      }
      fetchInventario();
      fetchMovimientos();
      setTimeout(() => setShowModal(false), 900);
    } catch (err) {
      setAccionError(err.response?.data?.error || "Error al ejecutar la acción");
    } finally {
      setGuardando(false);
    }
  };

  const inventarioFiltrado = useMemo(() => {
    let lista = [...inventario];
    if (busqueda) lista = lista.filter(p =>
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busqueda.toLowerCase())
    );
    if (soloAlertas) lista = lista.filter(p => p.alerta_stock);
    return lista;
  }, [inventario, busqueda, soloAlertas]);

  const totalPaginasStock = Math.max(1, Math.ceil(inventarioFiltrado.length / STOCK_POR_PAGINA));
  const inventarioPagina = inventarioFiltrado.slice(
    (paginaStock - 1) * STOCK_POR_PAGINA,
    paginaStock * STOCK_POR_PAGINA
  );

  const alertas = inventario.filter(p => p.alerta_stock);

  const modalLabel = {
    entrada: "Registrar Entrada de Stock",
    salida: "Registrar Salida de Stock",
    ajuste: "Ajuste de Inventario",
    stock_minimo: "Configurar Stock Mínimo",
  };

  return (
    <Container fluid className="py-4 px-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Inventario</h1>
              <p className="text-muted">Control de stock, Kardex y alertas</p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate("/admin")}>
              ← Volver
            </Button>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      {/* Stat cards */}
      <Row className="mb-4 g-3">
        <Col xs={6} sm={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3 className="fw-bold text-primary">{inventario.length}</h3>
              <small className="text-muted">Productos en inventario</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={3}>
          <Card className="text-center shadow-sm border-danger">
            <Card.Body>
              <h3 className="fw-bold text-danger">{alertas.length}</h3>
              <small className="text-muted">Alertas de stock bajo</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3 className="fw-bold text-success">
                {inventario.filter(p => !p.alerta_stock && p.stock > 0).length}
              </h3>
              <small className="text-muted">Con stock suficiente</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} sm={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h3 className="fw-bold text-secondary">
                {inventario.filter(p => p.stock === 0).length}
              </h3>
              <small className="text-muted">Sin stock</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {alertas.length > 0 && (
        <Alert variant="danger" className="mb-4">
          <strong>⚠️ {alertas.length} producto{alertas.length > 1 ? "s" : ""} con stock bajo:</strong>{" "}
          {alertas.map(p => `${p.nombre} (${p.stock})`).join(", ")}
        </Alert>
      )}

      <Tabs defaultActiveKey="stock" className="mb-3">
        {/* ─── Tab Stock Actual ───────────────────────────────── */}
        <Tab eventKey="stock" title="📦 Stock Actual">
          <Card className="shadow-sm">
            <Card.Header>
              <Row className="g-2 align-items-center">
                <Col md={5}>
                  <InputGroup size="sm">
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control
                      placeholder="Buscar por nombre o código..."
                      value={busqueda}
                      onChange={e => setBusqueda(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    id="solo-alertas"
                    label={`Solo con alerta${alertas.length > 0 ? ` (${alertas.length})` : ""}`}
                    checked={soloAlertas}
                    onChange={e => setSoloAlertas(e.target.checked)}
                    className="mt-1"
                  />
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
              ) : (
                <>
                <Table hover responsive className="mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th className="text-center">Stock</th>
                      <th className="text-center">Mínimo</th>
                      <th className="text-center">Estado</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventarioPagina.map(prod => (
                      <tr key={prod.id} className={prod.alerta_stock ? "table-danger" : ""}>
                        <td>
                          <span className="fw-semibold">{prod.nombre}</span>
                          {prod.codigo && <small className="text-muted ms-1">({prod.codigo})</small>}
                        </td>
                        <td className="text-capitalize text-muted">{prod.categoria || "—"}</td>
                        <td className="text-center fw-bold">
                          {prod.stock}
                          <small className="text-muted ms-1">{prod.unidad}</small>
                        </td>
                        <td className="text-center text-muted">{prod.stock_minimo}</td>
                        <td className="text-center">
                          {prod.stock === 0 ? (
                            <Badge bg="danger">Sin stock</Badge>
                          ) : prod.alerta_stock ? (
                            <Badge bg="warning" text="dark">Stock bajo</Badge>
                          ) : (
                            <Badge bg="success">OK</Badge>
                          )}
                        </td>
                        <td className="text-end">
                          <Button variant="outline-success" size="sm" className="me-1" onClick={() => abrirAccion(prod, "entrada")} title="Entrada">+</Button>
                          <Button variant="outline-warning" size="sm" className="me-1" onClick={() => abrirAccion(prod, "salida")} title="Salida">-</Button>
                          <Button variant="outline-info" size="sm" className="me-1" onClick={() => abrirAccion(prod, "ajuste")} title="Ajuste">≡</Button>
                          <Button variant="outline-secondary" size="sm" onClick={() => abrirAccion(prod, "stock_minimo")} title="Config. mínimo">⚙</Button>
                        </td>
                      </tr>
                    ))}
                    {inventarioFiltrado.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          {busqueda || soloAlertas ? "No hay productos con esos filtros" : "No hay productos en inventario"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                <PaginacionVentana
                  paginaActual={paginaStock}
                  totalPaginas={totalPaginasStock}
                  onChange={setPaginaStock}
                  size="sm"
                  className="py-3"
                />
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* ─── Tab Kardex ─────────────────────────────────────── */}
        <Tab eventKey="kardex" title="📋 Kardex">
          <Card className="shadow-sm">
            <Card.Header>
              <Row className="g-2">
                <Col md={5}>
                  <Form.Select size="sm" value={filtroProducto} onChange={e => { setFiltroProducto(e.target.value); setPaginaMov(1); }}>
                    <option value="">Todos los productos</option>
                    {inventario.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select size="sm" value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPaginaMov(1); }}>
                    <option value="">Todos los tipos</option>
                    {Object.entries(TIPOS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              {loadingMov ? (
                <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
              ) : (
                <>
                  <Table hover responsive className="mb-0 small">
                    <thead className="table-light">
                      <tr>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th className="text-center">Tipo</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-center">Antes</th>
                        <th className="text-center">Después</th>
                        <th>Motivo / Proveedor</th>
                        <th>Usuario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map(m => {
                        const t = TIPOS_LABEL[m.tipo] || { label: m.tipo, bg: "secondary" };
                        return (
                          <tr key={m.id}>
                            <td className="text-muted">{new Date(m.creado_en).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}</td>
                            <td className="fw-semibold">{m.producto_nombre}</td>
                            <td className="text-center"><Badge bg={t.bg} text={t.text}>{t.label}</Badge></td>
                            <td className={`text-center fw-bold ${m.cantidad > 0 ? "text-success" : "text-danger"}`}>
                              {m.cantidad > 0 ? "+" : ""}{m.cantidad} {m.unidad}
                            </td>
                            <td className="text-center text-muted">{m.stock_anterior}</td>
                            <td className="text-center fw-semibold">{m.stock_nuevo}</td>
                            <td className="text-muted small">
                              {m.motivo || "—"}
                              {m.proveedor_nombre && <div className="text-primary small">🏭 {m.proveedor_nombre}</div>}
                            </td>
                            <td className="text-muted small">{m.usuario_nombre || "Sistema"}</td>
                          </tr>
                        );
                      })}
                      {movimientos.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-4">No hay movimientos registrados</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  <PaginacionVentana
                    paginaActual={paginaMov}
                    totalPaginas={totalPaginasMov}
                    onChange={setPaginaMov}
                    size="sm"
                    className="py-3"
                  />
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* ─── Modal de acciones ────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalLabel[tipoAccion]}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productoSeleccionado && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong>{productoSeleccionado.nombre}</strong>
              <div className="text-muted small">Stock actual: <strong>{productoSeleccionado.stock} {productoSeleccionado.unidad}</strong></div>
            </div>
          )}
          {accionError && <Alert variant="danger" className="py-2">{accionError}</Alert>}
          {accionExito && <Alert variant="success" className="py-2">{accionExito}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                {tipoAccion === "entrada" && "Cantidad a ingresar *"}
                {tipoAccion === "salida" && "Cantidad a retirar *"}
                {tipoAccion === "ajuste" && "Nuevo stock total *"}
                {tipoAccion === "stock_minimo" && "Nuevo stock mínimo *"}
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={formAccion.cantidad}
                onChange={e => setFormAccion(prev => ({ ...prev, cantidad: e.target.value }))}
                autoFocus
                placeholder={tipoAccion === "ajuste" ? "Cantidad exacta" : "0"}
              />
              {tipoAccion === "ajuste" && productoSeleccionado && formAccion.cantidad !== "" && (
                <Form.Text className="text-muted">
                  Diferencia: {parseInt(formAccion.cantidad || 0) - productoSeleccionado.stock > 0 ? "+" : ""}
                  {parseInt(formAccion.cantidad || 0) - productoSeleccionado.stock} unidades
                </Form.Text>
              )}
            </Form.Group>
            {tipoAccion === "entrada" && proveedores.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Proveedor</Form.Label>
                <Form.Select
                  value={formAccion.proveedor_id}
                  onChange={e => setFormAccion(prev => ({ ...prev, proveedor_id: e.target.value }))}
                >
                  <option value="">Sin proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
            {tipoAccion !== "stock_minimo" && (
              <Form.Group className="mb-3">
                <Form.Label>Motivo</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formAccion.motivo}
                  onChange={e => setFormAccion(prev => ({ ...prev, motivo: e.target.value }))}
                  placeholder="Ej: Recepción de proveedor, Merma, Conteo físico..."
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button
            variant={tipoAccion === "salida" ? "warning" : tipoAccion === "stock_minimo" ? "secondary" : "success"}
            onClick={handleEjecutar}
            disabled={guardando || !formAccion.cantidad}
          >
            {guardando ? <Spinner animation="border" size="sm" /> : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Inventario;
