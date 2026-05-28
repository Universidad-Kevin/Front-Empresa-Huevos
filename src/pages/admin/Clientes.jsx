import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { SkeletonTable } from "../../components/SkeletonLoader";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clientes/all");
      setClientes(response.data.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setError("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleDesactivarCliente = async (id) => {
    if (
      window.confirm("¿Estás seguro de que quieres desactivar este cliente?")
    ) {
      try {
        await api.delete(`/clientes/${id}`);
        fetchClientes(); // Recargar la lista
      } catch (error) {
        console.error("Error desactivando cliente:", error);
        setError("Error al desactivar el cliente");
      }
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const getTipoNegocioBadge = (tipo) => {
    const colors = {
      Restaurante: "primary",
      Supermercado: "success",
      Hotel: "warning",
      Cafetería: "info",
      Distribuidor: "secondary",
      Panadería: "dark",
      Otro: "light",
    };
    return colors[tipo] || "secondary";
  };

  if (loading) return <SkeletonTable rows={5} cols={6} />;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Clientes Mayoristas</h1>
              <p className="text-muted">Gestión de clientes corporativos</p>
            </div>
            <Link to="/admin/agregar-cliente" className="btn btn-primary">
              👥 Agregar Cliente
            </Link>
          </div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/admin")}
          >
            ← Volver
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {clientes.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="text-muted">No hay clientes registrados</h5>
              <p className="text-muted mb-3">
                Comienza agregando tu primer cliente mayorista
              </p>
              <Link to="/admin/agregar-cliente" className="btn btn-primary">
                👥 Agregar Primer Cliente
              </Link>
            </div>
          ) : (
            <>
              {/* Tabla — desktop */}
              <Table responsive hover className="d-none d-md-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Tipo de Negocio</th>
                    <th>Contacto</th>
                    <th>Límite Crédito</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>
                        <strong>{cliente.nombre_empresa}</strong>
                        <br />
                        <small className="text-muted">{cliente.email}</small>
                      </td>
                      <td>
                        <Badge bg={getTipoNegocioBadge(cliente.tipo_negocio)}>
                          {cliente.tipo_negocio}
                        </Badge>
                      </td>
                      <td>
                        <strong>{cliente.contacto_nombre}</strong>
                        <br />
                        <small className="text-muted">{cliente.telefono}</small>
                      </td>
                      <td><strong>S/.{cliente.limite_credito?.toLocaleString()}</strong></td>
                      <td>
                        <Badge bg={cliente.estado === "activo" ? "success" : "secondary"}>
                          {cliente.estado}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link to={`/admin/editar-cliente/${cliente.id}`} className="btn btn-sm btn-outline-primary">
                            Editar
                          </Link>
                          {cliente.estado === "activo" && (
                            <Button variant="outline-danger" size="sm" onClick={() => handleDesactivarCliente(cliente.id)}>
                              Desactivar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Tarjetas — mobile */}
              <div className="d-md-none">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <strong>{cliente.nombre_empresa}</strong>
                        <div className="small text-muted">{cliente.email}</div>
                      </div>
                      <Badge bg={cliente.estado === "activo" ? "success" : "secondary"}>
                        {cliente.estado}
                      </Badge>
                    </div>
                    <div className="small mb-1">
                      <span className="text-muted">Contacto: </span>{cliente.contacto_nombre}
                      {cliente.telefono && <span className="text-muted ms-2">{cliente.telefono}</span>}
                    </div>
                    <div className="small mb-1">
                      <Badge bg={getTipoNegocioBadge(cliente.tipo_negocio)} className="me-2">{cliente.tipo_negocio}</Badge>
                      <span className="text-muted">Crédito: </span><strong>S/.{cliente.limite_credito?.toLocaleString()}</strong>
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <Link to={`/admin/editar-cliente/${cliente.id}`} className="btn btn-sm btn-outline-primary">
                        Editar
                      </Link>
                      {cliente.estado === "activo" && (
                        <Button variant="outline-danger" size="sm" onClick={() => handleDesactivarCliente(cliente.id)}>
                          Desactivar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Clientes;
