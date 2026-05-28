import { useState, useEffect, useMemo } from "react";
import {
  Container, Row, Col, Card, Table, Button, Badge,
  Alert, Form, InputGroup,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { SkeletonTable } from "../../components/SkeletonLoader";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
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

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar al usuario "${nombre}"? Esta acción también eliminará sus pedidos y no se puede deshacer.`)) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      alert("Error al eliminar el usuario");
    }
  };

  const usuariosFiltrados = useMemo(() => {
    if (!busqueda) return usuarios;
    const q = busqueda.toLowerCase();
    return usuarios.filter(u =>
      u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [usuarios, busqueda]);

  const hace30dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  if (loading) return <SkeletonTable rows={6} cols={4} />;

  return (
    <Container className="py-4">
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
            <Col>
              <small className="text-muted">
                {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
                {busqueda && " encontrados"}
              </small>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id}>
                  <td><strong>#{usuario.id}</strong></td>
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
                    <small className="text-muted">
                      {new Date(usuario.creado_en).toLocaleDateString("es-PE", {
                        day: "2-digit", month: "short", year: "numeric"
                      })}
                    </small>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleEliminar(usuario.id, usuario.nombre)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

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
          <Col md={4} className="mb-3">
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-primary">{usuarios.length}</h4>
                <Card.Text className="text-muted">Total Usuarios</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-success">
                  {usuarios.filter(u => new Date(u.creado_en) > hace30dias).length}
                </h4>
                <Card.Text className="text-muted">Nuevos (30 días)</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-info">
                  {new Date(Math.max(...usuarios.map(u => new Date(u.creado_en)))).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}
                </h4>
                <Card.Text className="text-muted">Último registro</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Usuarios;
