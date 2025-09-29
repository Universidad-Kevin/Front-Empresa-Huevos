import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import api from "../../services/api";

function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/productos");
      setProductos(response.data.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar el producto "${nombre}"?`
      )
    ) {
      try {
        await api.delete(`/productos/${id}`);
        // Recargar la lista
        fetchProductos();
      } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("Error al eliminar el producto");
      }
    }
  };

  const getEstadoVariant = (stock) => {
    if (stock > 50) return "success";
    if (stock > 10) return "warning";
    return "danger";
  };

  const getEstadoTexto = (estado) => {
    return estado === "activo" ? "Activo" : "Inactivo";
  };

  const getEstadoBadge = (estado) => {
    return estado === "activo" ? "success" : "secondary";
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando productos...</p>
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
              <h1 className="fw-bold">Gestión de Productos</h1>
              <p className="text-muted">
                Administra tu inventario de productos
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button as={Link} to="/admin/agregar-producto" variant="success">
                ➕ Agregar Producto
              </Button>
              <Button
                as={Link}
                to="/admin/productos-inactivos"
                variant="outline-warning"
              >
                📋 Productos Inactivos
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3"
            onClick={fetchProductos}
          >
            Reintentar
          </Button>
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <strong>#{producto.id}</strong>
                  </td>
                  <td>
                    <div>
                      <strong>{producto.nombre}</strong>
                      <br />
                      <small className="text-muted">
                        {producto.descripcion?.substring(0, 50)}...
                      </small>
                    </div>
                  </td>
                  <td>
                    <Badge bg="secondary" text="capitalize">
                      {producto.categoria}
                    </Badge>
                  </td>
                  <td>${producto.precio}</td>
                  <td>
                    <Badge bg={getEstadoVariant(producto.stock)}>
                      {producto.stock} unidades
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getEstadoBadge(producto.estado)}>
                      {getEstadoTexto(producto.estado)}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        as={Link}
                        to={`/admin/editar-producto/${producto.id}`}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() =>
                          handleEliminar(producto.id, producto.nombre)
                        }
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {productos.length === 0 && !loading && (
            <div className="text-center py-5">
              <p className="text-muted">No hay productos registrados</p>
              <Button as={Link} to="/admin/agregar-producto" variant="success">
                Agregar Primer Producto
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Estadísticas rápidas */}
      {productos.length > 0 && (
        <Row className="mt-4">
          <Col lg={3} md={6}>
            <Card className="border-0 bg-primary bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-primary">{productos.length}</h4>
                <Card.Text className="text-muted">Total Productos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0 bg-success bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-success">
                  {productos.filter((p) => p.estado === "activo").length}
                </h4>
                <Card.Text className="text-muted">Activos</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0 bg-warning bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-warning">
                  {productos.filter((p) => p.stock < 10).length}
                </h4>
                <Card.Text className="text-muted">Stock Bajo</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="border-0 bg-info bg-opacity-10">
              <Card.Body className="text-center">
                <h4 className="text-info">
                  $
                  {productos
                    .reduce((sum, p) => sum + p.precio * p.stock, 0)
                    .toFixed(2)}
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
