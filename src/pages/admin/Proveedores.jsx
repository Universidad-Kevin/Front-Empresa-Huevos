import { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, Form, Modal, Spinner, InputGroup, Tabs, Tab,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const FORM_VACIO = { nombre: "", contacto_nombre: "", email: "", telefono: "", direccion: "", ruc: "", notas: "" };

function Proveedores() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [formError, setFormError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [showDetalle, setShowDetalle] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activo");
  const [cambiando, setCambiando] = useState(null);

  useEffect(() => { fetchProveedores(); }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/proveedores");
      setProveedores(data.data || []);
    } catch {
      setError("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  const abrirAgregar = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setFormError("");
    setShowModal(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setForm({
      nombre: p.nombre || "", contacto_nombre: p.contacto_nombre || "",
      email: p.email || "", telefono: p.telefono || "",
      direccion: p.direccion || "", ruc: p.ruc || "", notas: p.notas || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const abrirDetalle = async (p) => {
    setDetalle(null);
    setShowDetalle(true);
    setLoadingDetalle(true);
    try {
      const { data } = await api.get(`/proveedores/${p.id}`);
      setDetalle(data.data);
    } catch {
      setDetalle({ ...p, entradas: [] });
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setFormError("El nombre del proveedor es requerido"); return; }
    setGuardando(true);
    setFormError("");
    try {
      if (editando) {
        await api.put(`/proveedores/${editando.id}`, form);
      } else {
        await api.post("/proveedores", form);
      }
      setShowModal(false);
      fetchProveedores();
    } catch (err) {
      setFormError(err.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (p) => {
    const nuevoEstado = p.estado === "activo" ? "inactivo" : "activo";
    setCambiando(p.id);
    try {
      await api.patch(`/proveedores/${p.id}/estado`, { estado: nuevoEstado });
      fetchProveedores();
    } catch (err) {
      alert(err.response?.data?.error || "Error al cambiar estado");
    } finally {
      setCambiando(null);
    }
  };

  const handleEliminar = async (p) => {
    if (!window.confirm(`¿Eliminar el proveedor "${p.nombre}"?`)) return;
    try {
      await api.delete(`/proveedores/${p.id}`);
      fetchProveedores();
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar");
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => {
    const matchEstado = !filtroEstado || p.estado === filtroEstado;
    const matchBusqueda = !busqueda ||
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.contacto_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.ruc?.includes(busqueda);
    return matchEstado && matchBusqueda;
  });

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Proveedores</h1>
              <p className="text-muted">Gestiona los proveedores de productos</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="success" onClick={abrirAgregar}>➕ Nuevo Proveedor</Button>
              <Button variant="outline-secondary" onClick={() => navigate("/admin/inventario")}>← Inventario</Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      {/* Stat cards */}
      <Row className="mb-4 g-3">
        {[
          { label: "Total", valor: proveedores.length, color: "primary" },
          { label: "Activos", valor: proveedores.filter(p => p.estado === "activo").length, color: "success" },
          { label: "Inactivos", valor: proveedores.filter(p => p.estado === "inactivo").length, color: "secondary" },
          { label: "Con entradas", valor: proveedores.filter(p => p.total_entradas > 0).length, color: "info" },
        ].map(s => (
          <Col xs={6} sm={3} key={s.label}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <h3 className={`fw-bold text-${s.color}`}>{s.valor}</h3>
                <small className="text-muted">{s.label}</small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filtros */}
      <Card className="shadow-sm mb-3">
        <Card.Body className="py-2">
          <Row className="g-2 align-items-center">
            <Col md={5}>
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre, contacto o RUC..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select size="sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
          ) : proveedoresFiltrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {busqueda || filtroEstado ? "Sin resultados para los filtros aplicados" : "No hay proveedores registrados"}
            </div>
          ) : (
            <>
              {/* Tabla — escritorio */}
              <Table hover responsive className="mb-0 d-none d-md-table">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>RUC</th>
                    <th className="text-center">Entradas</th>
                    <th className="text-center">Última entrada</th>
                    <th className="text-center">Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedoresFiltrados.map(p => (
                    <tr key={p.id}>
                      <td>
                        <Button variant="link" className="p-0 text-start fw-semibold" onClick={() => abrirDetalle(p)}>
                          {p.nombre}
                        </Button>
                        {p.email && <div className="text-muted small">{p.email}</div>}
                      </td>
                      <td className="text-muted small">{p.contacto_nombre || "—"}</td>
                      <td className="text-muted small">{p.telefono || "—"}</td>
                      <td className="text-muted small">{p.ruc || "—"}</td>
                      <td className="text-center">
                        <Badge bg={p.total_entradas > 0 ? "success" : "secondary"}>{p.total_entradas}</Badge>
                      </td>
                      <td className="text-center text-muted small">
                        {p.ultima_entrada ? new Date(p.ultima_entrada).toLocaleDateString("es-PE") : "—"}
                      </td>
                      <td className="text-center">
                        <Badge bg={p.estado === "activo" ? "success" : "secondary"}>
                          {p.estado === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => abrirEditar(p)}>Editar</Button>
                        <Button
                          variant={p.estado === "activo" ? "outline-warning" : "outline-success"}
                          size="sm"
                          className="me-1"
                          onClick={() => handleToggleEstado(p)}
                          disabled={cambiando === p.id}
                        >
                          {cambiando === p.id ? <Spinner animation="border" size="sm" /> : p.estado === "activo" ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminar(p)}
                          disabled={p.total_entradas > 0}
                          title={p.total_entradas > 0 ? "Tiene entradas asociadas" : "Eliminar"}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Tarjetas — móvil */}
              <div className="d-md-none">
                {proveedoresFiltrados.map(p => (
                  <div key={p.id} className="border-bottom p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <Button variant="link" className="p-0 text-start fw-semibold" onClick={() => abrirDetalle(p)}>
                          {p.nombre}
                        </Button>
                        {p.email && <div className="text-muted small">{p.email}</div>}
                      </div>
                      <Badge bg={p.estado === "activo" ? "success" : "secondary"} className="ms-2 flex-shrink-0">
                        {p.estado === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                      {p.contacto_nombre && <span>👤 {p.contacto_nombre}</span>}
                      {p.telefono && <span>📞 {p.telefono}</span>}
                      {p.ruc && <span>RUC: {p.ruc}</span>}
                    </div>
                    <div className="small text-muted mb-2">
                      <Badge bg={p.total_entradas > 0 ? "success" : "secondary"}>{p.total_entradas} entradas</Badge>
                      {p.ultima_entrada && (
                        <span className="ms-2">· Última: {new Date(p.ultima_entrada).toLocaleDateString("es-PE")}</span>
                      )}
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(p)}>Editar</Button>
                      <Button
                        size="sm"
                        variant={p.estado === "activo" ? "outline-warning" : "outline-success"}
                        onClick={() => handleToggleEstado(p)}
                        disabled={cambiando === p.id}
                      >
                        {cambiando === p.id ? <Spinner animation="border" size="sm" /> : p.estado === "activo" ? "Desactivar" : "Activar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleEliminar(p)}
                        disabled={p.total_entradas > 0}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal agregar/editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? `Editar: ${editando.nombre}` : "Nuevo Proveedor"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}
          <Form>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Nombre de la empresa *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.nombre}
                    onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: Granja San Marcos S.A.C."
                    autoFocus
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>RUC</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.ruc}
                    onChange={e => setForm(p => ({ ...p, ruc: e.target.value }))}
                    placeholder="20XXXXXXXXX"
                    maxLength={11}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nombre del contacto</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.contacto_nombre}
                    onChange={e => setForm(p => ({ ...p, contacto_nombre: e.target.value }))}
                    placeholder="Ej: Carlos Ramírez"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.telefono}
                    onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                    placeholder="+51 999 888 777"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="proveedor@empresa.com"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.direccion}
                    onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                    placeholder="Av. Principal 123, Lima"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Notas internas</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.notas}
                    onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                    placeholder="Condiciones de pago, días de entrega, etc."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardar} disabled={guardando}>
            {guardando ? <Spinner animation="border" size="sm" /> : (editando ? "Guardar cambios" : "Crear proveedor")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal detalle / historial */}
      <Modal show={showDetalle} onHide={() => setShowDetalle(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{detalle?.nombre || "Detalle de proveedor"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetalle ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : detalle ? (
            <Tabs defaultActiveKey="info">
              <Tab eventKey="info" title="Información">
                <div className="pt-3">
                  <Row className="g-2">
                    {[
                      { label: "RUC", val: detalle.ruc },
                      { label: "Contacto", val: detalle.contacto_nombre },
                      { label: "Email", val: detalle.email },
                      { label: "Teléfono", val: detalle.telefono },
                      { label: "Dirección", val: detalle.direccion },
                    ].map(f => f.val ? (
                      <Col md={6} key={f.label}>
                        <small className="text-muted">{f.label}</small>
                        <div>{f.val}</div>
                      </Col>
                    ) : null)}
                    {detalle.notas && (
                      <Col md={12}>
                        <small className="text-muted">Notas</small>
                        <div className="text-muted small">{detalle.notas}</div>
                      </Col>
                    )}
                  </Row>
                </div>
              </Tab>
              <Tab eventKey="entradas" title={`Entradas (${detalle.entradas?.length || 0})`}>
                <div className="pt-3">
                  {detalle.entradas?.length === 0 ? (
                    <p className="text-muted">Este proveedor no tiene entradas de inventario registradas.</p>
                  ) : (
                    <Table hover responsive className="small mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Producto</th>
                          <th className="text-center">Cantidad</th>
                          <th>Motivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalle.entradas?.map(e => (
                          <tr key={e.id}>
                            <td className="text-muted">{new Date(e.creado_en).toLocaleDateString("es-PE")}</td>
                            <td>{e.producto_nombre}</td>
                            <td className="text-center text-success fw-bold">+{e.cantidad} {e.unidad}</td>
                            <td className="text-muted">{e.motivo || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab>
            </Tabs>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-primary" onClick={() => { setShowDetalle(false); abrirEditar(detalle); }}>Editar</Button>
          <Button variant="secondary" onClick={() => setShowDetalle(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Proveedores;
