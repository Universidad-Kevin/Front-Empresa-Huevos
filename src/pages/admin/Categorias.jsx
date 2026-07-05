import { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, Form, Modal, Spinner, InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Seo from "../../components/Seo";

function Categorias() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", color: "#6c757d" });
  const [formError, setFormError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => { fetchCategorias(); }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/categorias");
      setCategorias(data.data || []);
    } catch {
      setError("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const abrirAgregar = () => {
    setEditando(null);
    setForm({ nombre: "", descripcion: "", color: "#6c757d" });
    setFormError("");
    setShowModal(true);
  };

  const abrirEditar = (cat) => {
    setEditando(cat);
    setForm({ nombre: cat.nombre, descripcion: cat.descripcion || "", color: cat.color || "#6c757d" });
    setFormError("");
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setFormError("El nombre es requerido"); return; }
    setGuardando(true);
    setFormError("");
    try {
      if (editando) {
        await api.put(`/categorias/${editando.id}`, form);
      } else {
        await api.post("/categorias", form);
      }
      setShowModal(false);
      fetchCategorias();
    } catch (err) {
      setFormError(err.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"? Solo es posible si no tiene productos asociados.`)) return;
    try {
      await api.delete(`/categorias/${cat.id}`);
      fetchCategorias();
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar");
    }
  };

  const categoriasFiltradas = categorias.filter(c =>
    !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container className="py-4">
      <Seo path="/admin/categorias" title="Categorías" noindex />
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Categorías</h1>
              <p className="text-muted">Organiza los productos por categoría</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="success" onClick={abrirAgregar}>
                ➕ Nueva Categoría
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate("/admin/productos")}>
                ← Productos
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Stats cards */}
      <Row className="mb-4 g-3">
        <Col xs={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h3 fw-bold text-primary">{categorias.length}</h2>
              <small className="text-muted">Total categorías</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h3 fw-bold text-success">
                {categorias.reduce((sum, c) => sum + (c.total_productos || 0), 0)}
              </h2>
              <small className="text-muted">Productos categorizados</small>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h3 fw-bold text-warning">
                {categorias.filter(c => c.total_productos === 0).length}
              </h2>
              <small className="text-muted">Sin productos</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header>
          <InputGroup size="sm" style={{ maxWidth: 280 }}>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Buscar categoría..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
          ) : categoriasFiltradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {busqueda ? "No se encontraron categorías" : "No hay categorías. ¡Crea la primera!"}
            </div>
          ) : (
            <>
              {/* Tabla — escritorio */}
              <Table hover responsive className="mb-0 d-none d-md-table">
                <thead className="table-light">
                  <tr>
                    <th>Color</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th className="text-center">Productos</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasFiltradas.map(cat => (
                    <tr key={cat.id}>
                      <td>
                        <span
                          className="d-inline-block rounded"
                          style={{ width: 24, height: 24, backgroundColor: cat.color || "#6c757d", border: "1px solid #dee2e6" }}
                          title={cat.color}
                        />
                      </td>
                      <td>
                        <span className="fw-semibold">{cat.nombre}</span>
                        <small className="text-muted ms-2">#{cat.id}</small>
                      </td>
                      <td className="text-muted small">{cat.descripcion || "—"}</td>
                      <td className="text-center">
                        <Badge bg={cat.total_productos > 0 ? "success" : "secondary"}>
                          {cat.total_productos}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => abrirEditar(cat)}>
                          Editar
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminar(cat)}
                          disabled={cat.total_productos > 0}
                          title={cat.total_productos > 0 ? "Tiene productos asociados" : "Eliminar"}
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
                {categoriasFiltradas.map(cat => (
                  <div key={cat.id} className="border-bottom p-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className="d-inline-block rounded flex-shrink-0"
                        style={{ width: 20, height: 20, backgroundColor: cat.color || "#6c757d", border: "1px solid #dee2e6" }}
                      />
                      <strong>{cat.nombre}</strong>
                      <small className="text-muted">#{cat.id}</small>
                      <Badge bg={cat.total_productos > 0 ? "success" : "secondary"} className="ms-auto">
                        {cat.total_productos} productos
                      </Badge>
                    </div>
                    {cat.descripcion && <p className="small text-muted mb-2">{cat.descripcion}</p>}
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEditar(cat)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleEliminar(cat)}
                        disabled={cat.total_productos > 0}
                        title={cat.total_productos > 0 ? "Tiene productos asociados" : "Eliminar"}
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar Categoría" : "Nueva Categoría"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={form.nombre}
                onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Premium"
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.descripcion}
                onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción opcional..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Color de etiqueta</Form.Label>
              <div className="d-flex align-items-center gap-3">
                <Form.Control
                  type="color"
                  value={form.color}
                  onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))}
                  style={{ width: 48, height: 38, padding: 2 }}
                />
                <Badge style={{ backgroundColor: form.color, fontSize: "0.9rem" }}>
                  Vista previa
                </Badge>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardar} disabled={guardando}>
            {guardando ? <Spinner animation="border" size="sm" /> : (editando ? "Guardar cambios" : "Crear categoría")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Categorias;
