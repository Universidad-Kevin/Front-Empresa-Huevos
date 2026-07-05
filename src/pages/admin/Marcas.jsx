import { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, Form, Modal, Spinner, InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Seo from "../../components/Seo";

function Marcas() {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "" });
  const [formError, setFormError] = useState("");

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => { fetchMarcas(); }, []);

  const fetchMarcas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/marcas");
      setMarcas(data.data || []);
    } catch {
      setError("Error al cargar las marcas");
    } finally {
      setLoading(false);
    }
  };

  const abrirAgregar = () => {
    setEditando(null);
    setForm({ nombre: "", descripcion: "" });
    setFormError("");
    setShowModal(true);
  };

  const abrirEditar = (marca) => {
    setEditando(marca);
    setForm({ nombre: marca.nombre, descripcion: marca.descripcion || "" });
    setFormError("");
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { setFormError("El nombre es requerido"); return; }
    setGuardando(true);
    setFormError("");
    try {
      if (editando) {
        await api.put(`/marcas/${editando.id}`, form);
      } else {
        await api.post("/marcas", form);
      }
      setShowModal(false);
      fetchMarcas();
    } catch (err) {
      setFormError(err.response?.data?.error || "Error al guardar");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (marca) => {
    if (!window.confirm(`¿Eliminar la marca "${marca.nombre}"? Solo es posible si no tiene productos asociados.`)) return;
    try {
      await api.delete(`/marcas/${marca.id}`);
      fetchMarcas();
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar");
    }
  };

  const marcasFiltradas = marcas.filter(m =>
    !busqueda || m.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Container className="py-4">
      <Seo path="/admin/marcas" title="Marcas" noindex />
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Marcas</h1>
              <p className="text-muted">Gestiona las marcas de productos</p>
            </div>
            <div className="d-flex gap-2">
              <Button variant="success" onClick={abrirAgregar}>
                ➕ Nueva Marca
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
        <Col sm={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h3 fw-bold text-primary">{marcas.length}</h2>
              <small className="text-muted">Total marcas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h3 fw-bold text-success">
                {marcas.reduce((sum, m) => sum + (m.total_productos || 0), 0)}
              </h2>
              <small className="text-muted">Productos con marca</small>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="h3 fw-bold text-warning">
                {marcas.filter(m => m.total_productos === 0).length}
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
              placeholder="Buscar marca..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
          ) : marcasFiltradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {busqueda ? "No se encontraron marcas" : "No hay marcas. ¡Crea la primera!"}
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th className="text-center">Productos</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {marcasFiltradas.map(marca => (
                  <tr key={marca.id}>
                    <td>
                      <span className="fw-semibold">{marca.nombre}</span>
                      <small className="text-muted ms-2">#{marca.id}</small>
                    </td>
                    <td className="text-muted small">{marca.descripcion || "—"}</td>
                    <td className="text-center">
                      <Badge bg={marca.total_productos > 0 ? "success" : "secondary"}>
                        {marca.total_productos}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => abrirEditar(marca)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminar(marca)}
                        disabled={marca.total_productos > 0}
                        title={marca.total_productos > 0 ? "Tiene productos asociados" : "Eliminar"}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal agregar/editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar Marca" : "Nueva Marca"}</Modal.Title>
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
                placeholder="Ej: CampOrganic"
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="success" onClick={handleGuardar} disabled={guardando}>
            {guardando ? <Spinner animation="border" size="sm" /> : (editando ? "Guardar cambios" : "Crear marca")}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Marcas;
