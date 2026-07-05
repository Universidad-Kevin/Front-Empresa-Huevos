import { useState, useEffect, useMemo } from "react";
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, Form, InputGroup, Spinner,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { SkeletonTable } from "../../components/SkeletonLoader";
import Seo from "../../components/Seo";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activo");
  const [cambiando, setCambiando] = useState(null);
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get("/usuarios/all");
      setUsuarios(response.data.data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("Error al cargar los usuarios registrados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleToggleEstado = async (id, nombre, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    const accion = nuevoEstado === "inactivo" ? "desactivar" : "activar";
    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} al usuario "${nombre}"?`)) return;
    setCambiando(id);
    try {
      await api.patch(`/usuarios/${id}/estado`, { estado: nuevoEstado });
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, estado: nuevoEstado } : u));
    } catch (err) {
      console.error("Error cambiando estado de usuario:", err);
      alert("Error al cambiar el estado del usuario");
    } finally {
      setCambiando(null);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    let lista = [...usuarios];
    if (filtroEstado) lista = lista.filter(u => u.estado === filtroEstado);
    if (busqueda) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(u => u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    return lista;
  }, [usuarios, busqueda, filtroEstado]);

  const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  if (loading) return <SkeletonTable rows={6} cols={4} />;

  return (
    <Container className="py-4">
      <Seo path="/admin/usuarios" title="Usuarios Registrados" noindex />
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Usuarios Registrados</h1>
              <p className="text-muted">Clientes que se registraron en la tienda web</p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate("/admin")}>
              ← Volver
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <Button variant="outline-danger" size="sm" className="ms-3" onClick={fetchUsuarios}>
            Reintentar
          </Button>
        </Alert>
      )}

      <Card className="shadow-sm mb-3">
        <Card.Body className="py-3">
          <Row className="g-2 align-items-center">
            <Col md={5}>
              <InputGroup size="sm">
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre o email..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select aria-label="Filtrar por estado" size="sm" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </Form.Select>
            </Col>
            <Col>
              <small className="text-muted">
                {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {/* Tabla — escritorio */}
          <Table responsive hover className="mb-0 d-none d-md-table">
            <thead className="bg-light">
              <tr>
                <th>N°</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario, idx) => (
                <tr key={usuario.id}>
                  <td><strong>#{idx + 1}</strong></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-primary">👤</span>
                      <strong>{usuario.nombre}</strong>
                      {new Date(usuario.creado_en) > hace30dias && (
                        <Badge bg="success" pill>Nuevo</Badge>
                      )}
                    </div>
                  </td>
                  <td className="text-muted">{usuario.email}</td>
                  <td>
                    <Badge bg={
                      usuario.rol === "admin" ? "danger" :
                      usuario.rol === "empleado" ? "warning" :
                      "primary"
                    } className="text-capitalize">
                      {usuario.rol ?? "cliente"}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={usuario.estado === "activo" ? "success" : "secondary"} className="text-capitalize">
                      {usuario.estado ?? "activo"}
                    </Badge>
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(usuario.creado_en).toLocaleDateString("es-PE", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </small>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant={usuario.estado === "activo" ? "outline-danger" : "outline-success"}
                      disabled={cambiando === usuario.id}
                      onClick={() => handleToggleEstado(usuario.id, usuario.nombre, usuario.estado ?? "activo")}
                    >
                      {cambiando === usuario.id
                        ? <Spinner animation="border" size="sm" />
                        : usuario.estado === "activo" ? "Desactivar" : "Activar"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Tarjetas — móvil */}
          <div className="d-md-none">
            {usuariosFiltrados.map(usuario => (
              <div key={usuario.id} className="border-bottom p-3">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <strong>{usuario.nombre}</strong>
                    {new Date(usuario.creado_en) > hace30dias && (
                      <Badge bg="success" pill className="ms-2">Nuevo</Badge>
                    )}
                  </div>
                  <Badge bg={usuario.estado === "activo" ? "success" : "secondary"} className="text-capitalize ms-2 flex-shrink-0">
                    {usuario.estado ?? "activo"}
                  </Badge>
                </div>
                <div className="text-muted small mb-1">{usuario.email}</div>
                <div className="mb-2">
                  <Badge bg={
                    usuario.rol === "admin" ? "danger" :
                    usuario.rol === "empleado" ? "warning" :
                    "primary"
                  } className="text-capitalize">
                    {usuario.rol ?? "cliente"}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {new Date(usuario.creado_en).toLocaleDateString("es-PE", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </small>
                  <Button
                    size="sm"
                    variant={usuario.estado === "activo" ? "outline-danger" : "outline-success"}
                    disabled={cambiando === usuario.id}
                    onClick={() => handleToggleEstado(usuario.id, usuario.nombre, usuario.estado ?? "activo")}
                  >
                    {cambiando === usuario.id
                      ? <Spinner animation="border" size="sm" />
                      : usuario.estado === "activo" ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">
                {busqueda ? "No hay usuarios con ese criterio de búsqueda." : "No hay usuarios registrados."}
              </p>
              {busqueda && (
                <Button variant="outline-secondary" size="sm" onClick={() => setBusqueda("")}>
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {usuarios.length > 0 && (
        <Row className="mt-4">
          <Col xs={6} md={3} className="mb-3">
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h2 className="h4 text-primary">{usuarios.length}</h2>
                <Card.Text className="text-muted">Total Usuarios</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3} className="mb-3">
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h2 className="h4 text-success">{usuarios.filter(u => (u.estado ?? "activo") === "activo").length}</h2>
                <Card.Text className="text-muted">Activos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3} className="mb-3">
            <Card className="border-0 bg-secondary bg-opacity-10">
              <Card.Body className="text-center">
                <h2 className="h4 text-secondary">{usuarios.filter(u => u.estado === "inactivo").length}</h2>
                <Card.Text className="text-muted">Inactivos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={3} className="mb-3">
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h2 className="h4 text-info">
                  {usuarios.filter(u => new Date(u.creado_en) > hace30dias).length}
                </h2>
                <Card.Text className="text-muted">Nuevos (30 días)</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Usuarios;
