import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import api from "../../services/api";

function AgregarProducto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: "",
    imagen: "",
    caracteristicas: [""],
    estado: "",
  });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Preparar datos para enviar
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

      console.log("Enviando producto:", productoData);

      const response = await api.post("/productos", productoData);

      if (response.data.success) {
        setEnviado(true);
        setTimeout(() => {
          navigate("/admin/productos");
        }, 2000);
      }
    } catch (error) {
      console.error("Error creando producto:", error);
      setError(error.response?.data?.error || "Error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Agregar Producto</h1>
              <p className="text-muted">Añade un nuevo producto al catálogo</p>
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
                  ✅ Producto agregado correctamente. Redirigiendo...
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  ❌ {error}
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
                        placeholder="Ej: Huevos Orgánicos Grade A"
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
                    placeholder="Describe el producto..."
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
                        placeholder="0.00"
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
                        placeholder="0"
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
                  <Form.Text className="text-muted">
                    Puedes subir la imagen después si lo prefieres
                  </Form.Text>
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
                    variant="success"
                    type="submit"
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? "Guardando..." : "💾 Guardar Producto"}
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
              {formData.nombre ? (
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

                  <h6>{formData.nombre}</h6>
                  <p className="text-muted small">{formData.descripcion}</p>

                  {formData.precio && (
                    <p className="fw-bold text-success">
                      ${parseFloat(formData.precio).toFixed(2)}
                    </p>
                  )}

                  {formData.categoria && (
                    <span className="badge bg-secondary">
                      {formData.categoria}
                    </span>
                  )}

                  {formData.stock && (
                    <p className="small text-muted mt-2">
                      Stock: {formData.stock} unidades
                    </p>
                  )}

                  {formData.caracteristicas.some((c) => c.trim() !== "") && (
                    <div className="mt-3">
                      <small className="fw-bold">Características:</small>
                      <ul className="small text-muted mb-0">
                        {formData.caracteristicas.map(
                          (caract, index) =>
                            caract.trim() && <li key={index}>{caract}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted text-center">
                  Completa el formulario para ver la vista previa
                </p>
              )}
            </Card.Body>
          </Card>

          {/* Información útil */}
          <Card className="shadow-sm mt-4">
            <Card.Header>
              <h6 className="mb-0">💡 Consejos</h6>
            </Card.Header>
            <Card.Body>
              <ul className="small text-muted mb-0">
                <li>Usa imágenes de alta calidad</li>
                <li>Describe bien las características</li>
                <li>Revisa el precio y stock</li>
                <li>Las categorías ayudan a organizar</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AgregarProducto;
