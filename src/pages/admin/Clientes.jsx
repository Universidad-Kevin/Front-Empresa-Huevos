import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clientes");
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

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando clientes...</p>
        </div>
      </Container>
    );
  }

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
            <Table responsive hover>
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
                      <div>
                        <strong>{cliente.nombre_empresa}</strong>
                        <br />
                        <small className="text-muted">{cliente.email}</small>
                      </div>
                    </td>
                    <td>
                      <Badge bg={getTipoNegocioBadge(cliente.tipo_negocio)}>
                        {cliente.tipo_negocio}
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <strong>{cliente.contacto_nombre}</strong>
                        <br />
                        <small className="text-muted">{cliente.telefono}</small>
                      </div>
                    </td>
                    <td>
                      <strong>
                        ${cliente.limite_credito?.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <Badge
                        bg={
                          cliente.estado === "activo" ? "success" : "secondary"
                        }
                      >
                        {cliente.estado}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/admin/editar-cliente/${cliente.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          Editar
                        </Link>
                        {cliente.estado === "activo" && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDesactivarCliente(cliente.id)}
                          >
                            Desactivar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Clientes;
