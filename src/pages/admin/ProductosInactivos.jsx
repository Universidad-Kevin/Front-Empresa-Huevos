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
import { SkeletonTable } from "../../components/SkeletonLoader";

function ProductosInactivos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductosInactivos();
  }, []);

  const fetchProductosInactivos = async () => {
    try {
      setLoading(true);
      console.log("Cargando productos inactivos...");

      // Usar el nuevo endpoint específico para productos inactivos
      const response = await api.get("/productos/inactivos");
      console.log("Productos inactivos cargados:", response.data.data);

      setProductos(response.data.data);
    } catch (error) {
      console.error("Error cargando productos inactivos:", error);
      setError(
        "Error al cargar los productos inactivos: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReactivar = async (id, nombre) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres reactivar el producto "${nombre}"?`
      )
    ) {
      try {
        console.log("Reactivando producto ID:", id);

        // Obtener el producto de la lista actual
        const producto = productos.find((p) => p.id === parseInt(id));

        if (!producto) {
          throw new Error("Producto no encontrado en la lista");
        }

        console.log("Producto encontrado:", producto);

        // Preparar datos para la reactivación
        const datosReactivacion = {
          nombre: producto.nombre,
          descripcion: producto.descripcion || "",
          precio: parseFloat(producto.precio),
          categoria: producto.categoria,
          stock: parseInt(producto.stock) || 0,
          imagen: producto.imagen || "",
          estado: "activo", // ← Esto es lo importante
          caracteristicas: producto.caracteristicas || [],
        };

        console.log("Enviando datos de reactivación:", datosReactivacion);

        // Usar el endpoint PUT normal
        const response = await api.put(`/productos/${id}`, datosReactivacion);

        console.log("✅ Producto reactivado correctamente:", response.data);

        alert(`✅ Producto "${nombre}" reactivado correctamente`);

        // Recargar la lista de productos inactivos
        fetchProductosInactivos();
      } catch (error) {
        console.error("❌ Error reactivando producto:", error);

        // Mostrar detalles del error
        let errorMsg = "Error al reactivar el producto";

        if (error.response) {
          // El servidor respondió con un código de error
          console.error("Respuesta del servidor:", error.response.data);
          errorMsg =
            error.response.data.error ||
            error.response.data.details ||
            errorMsg;
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error("No se recibió respuesta del servidor");
          errorMsg = "No se pudo conectar con el servidor";
        } else {
          // Algo pasó al configurar la petición
          console.error("Error configurando la petición:", error.message);
          errorMsg = error.message;
        }

        alert(`❌ ${errorMsg}`);
      }
    }
  };

  if (loading) {
    return <SkeletonTable rows={4} cols={6} />;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Productos Inactivos</h1>
              <p className="text-muted">
                Productos eliminados que pueden ser reactivados
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                as={Link}
                to="/admin/productos"
                variant="outline-secondary"
              >
                ← Volver a Productos Activos
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <h5>Error</h5>
          <p>{error}</p>
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-3"
            onClick={fetchProductosInactivos}
          >
            Reintentar
          </Button>
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Productos Inactivos ({productos.length})</h5>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={fetchProductosInactivos}
            >
              🔄 Actualizar
            </Button>
          </div>

          {productos.length > 0 ? (
            <Table responsive hover>
              <thead className="bg-light">
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Eliminado</th>
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
                          {producto.descripcion?.substring(0, 50)}
                          {producto.descripcion?.length > 50 ? "..." : ""}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Badge bg="secondary">{producto.categoria}</Badge>
                    </td>
                    <td>S/.{producto.precio}</td>
                    <td>
                      <Badge bg="warning">{producto.stock} unidades</Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(
                          producto.actualizado_en || producto.creado_en
                        ).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() =>
                          handleReactivar(producto.id, producto.nombre)
                        }
                      >
                        ✅ Reactivar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                <h4>📭 No hay productos inactivos</h4>
                <p>
                  Los productos que elimines aparecerán aquí para poder
                  reactivarlos.
                </p>
              </div>
              <Button as={Link} to="/admin/productos" variant="success">
                Ver Productos Activos
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Información adicional */}
      {productos.length > 0 && (
        <Card className="mt-4 border-warning">
          <Card.Body>
            <h6>💡 Información</h6>
            <p className="small text-muted mb-0">
              Los productos inactivos no son visibles para los clientes en la
              tienda, pero se mantienen en la base de datos para posibles
              reactivaciones.
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default ProductosInactivos;
