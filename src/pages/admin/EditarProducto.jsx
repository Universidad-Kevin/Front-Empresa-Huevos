import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import api from '/src/services/api';
import axios from "axios";

function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: "",
    imagen: "",
    estado: "activo",
    caracteristicas: [""],
  });
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProducto();
    } else {
      setError("No se proporcionó ID del producto");
      setCargando(false);
    }
  }, [id]);

  const fetchProducto = async () => {
    try {
      setCargando(true);

      // Obtener el token del localStorage
      const token = localStorage.getItem("token");

      const response = await axios.get(`/api/productos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.data) {
        const producto = response.data.data;

        // Convertir características de JSON a array si es necesario
        let caracteristicas = [""];
        if (producto.caracteristicas) {
          if (typeof producto.caracteristicas === "string") {
            caracteristicas = JSON.parse(producto.caracteristicas);
          } else {
            caracteristicas = producto.caracteristicas;
          }
          // Asegurarse de que haya al menos un campo vacío
          if (caracteristicas.length === 0) {
            caracteristicas = [""];
          }
        }

        setFormData({
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          precio: producto.precio || "",
          categoria: producto.categoria || "",
          stock: producto.stock || "",
          imagen: producto.imagen || "",
          estado: producto.estado || "activo",
          caracteristicas: caracteristicas,
        });
      } else {
        setError("Producto no encontrado");
      }
    } catch (error) {
      console.error("Error cargando producto:", error);
      setError(
        "Error al cargar el producto: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCaracteristicaChange = (index, value) => {
    const nuevasCaract = [...formData.caracteristicas];
    nuevasCaract[index] = value;
    setFormData((prev) => ({
      ...prev,
      caracteristicas: nuevasCaract,
    }));
  };

  const agregarCaracteristica = () => {
    setFormData((prev) => ({
      ...prev,
      caracteristicas: [...prev.caracteristicas, ""],
    }));
  };

  const removerCaracteristica = (index) => {
    const nuevasCaract = formData.caracteristicas.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      caracteristicas: nuevasCaract,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Filtrar características vacías
      const caracteristicasFiltradas = formData.caracteristicas.filter(
        (c) => c.trim() !== ""
      );

      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        stock: parseInt(formData.stock),
        imagen: formData.imagen || null,
        estado: formData.estado,
        caracteristicas: caracteristicasFiltradas,
      };

      console.log("Actualizando producto:", productoData);

      const response = await api.put(`/productos/${id}`, productoData);
      if (!response.data.success) {
        setError(response.data.error || "Error al actualizar el producto");
      } else {
        setEnviado(true);
        setTimeout(() => {
          navigate("/admin/productos");
        }, 1500);
      }
    } catch (error) {
      console.error("Error actualizando producto:", error);
      setError(
        error.response?.data?.error || "Error al actualizar el producto"
      );
    } finally {
      setLoading(false);
    }
  };

  if (cargando) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando producto...</p>
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
              <h1 className="fw-bold">Editar Producto #{id}</h1>
              <p className="text-muted">Modifica la información del producto</p>
            </div>
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/admin/productos")}
            >
              ← Volver
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              {enviado && (
                <Alert variant="success" className="mb-4">
                  ✅ Producto actualizado correctamente. Redirigiendo...
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  <h5>Error</h5>
                  <p>{error}</p>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={fetchProducto}
                  >
                    Reintentar
                  </Button>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre del Producto *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Categoría *</Form.Label>
                      <Form.Select
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                        <option value="especial">Especial</option>
                        <option value="gourmet">Gourmet</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Precio ($) *</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock *</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>URL de Imagen</Form.Label>
                  <Form.Control
                    type="url"
                    name="imagen"
                    value={formData.imagen}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </Form.Group>

                {/* Características */}
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Label className="mb-0">Características</Form.Label>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={agregarCaracteristica}
                      type="button"
                    >
                      + Agregar
                    </Button>
                  </div>

                  {formData.caracteristicas.map((caract, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <Form.Control
                        type="text"
                        value={caract}
                        onChange={(e) =>
                          handleCaracteristicaChange(index, e.target.value)
                        }
                        placeholder={`Característica ${index + 1}`}
                      />
                      {formData.caracteristicas.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removerCaracteristica(index)}
                          type="button"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex gap-3">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Guardando...
                      </>
                    ) : (
                      "💾 Actualizar Producto"
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => navigate("/admin/productos")}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Vista Previa */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">👁️ Vista Previa</h5>
            </Card.Header>
            <Card.Body>
              <div>
                <div className="text-center mb-3">
                  <div
                    className="bg-light rounded d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: "200px", height: "150px" }}
                  >
                    {formData.imagen ? (
                      <img
                        src={formData.imagen}
                        alt="Vista previa"
                        className="img-fluid rounded"
                        style={{ maxHeight: "150px", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                    ) : (
                      <span className="text-muted">Imagen no disponible</span>
                    )}
                  </div>
                </div>

                <h6>{formData.nombre || "Sin nombre"}</h6>
                <p className="text-muted small">
                  {formData.descripcion || "Sin descripción"}
                </p>

                {formData.precio && (
                  <p className="fw-bold text-success">
                    ${parseFloat(formData.precio).toFixed(2)}
                  </p>
                )}

                {formData.categoria && (
                  <Badge bg="secondary" className="mb-2">
                    {formData.categoria}
                  </Badge>
                )}

                {formData.stock && (
                  <p className="small text-muted">
                    Stock: {formData.stock} unidades
                  </p>
                )}

                {formData.caracteristicas.some((c) => c.trim() !== "") && (
                  <div className="mt-3">
                    <small className="fw-bold d-block mb-1">
                      Características:
                    </small>
                    <ul className="small text-muted mb-0 ps-3">
                      {formData.caracteristicas.map(
                        (caract, index) =>
                          caract.trim() && <li key={index}>{caract}</li>
                      )}
                    </ul>
                  </div>
                )}

                <p className="small mt-2">
                  Estado:{" "}
                  <Badge
                    bg={formData.estado === "activo" ? "success" : "secondary"}
                  >
                    {formData.estado === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EditarProducto;
