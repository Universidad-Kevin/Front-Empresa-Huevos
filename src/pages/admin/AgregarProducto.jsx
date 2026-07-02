import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Card, Form, Button, Alert,
} from "react-bootstrap";
import api from "../../services/api";

function AgregarProducto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    categoria_id: "",
    marca_id: "",
    stock: "",
    unidad: "unidad",
    imagen: "",
    caracteristicas: [""],
    estado: "activo",
  });
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState("");
  const imageFileRef = useRef(null);

  useEffect(() => {
    api.get("/categorias").then(({ data }) => setCategorias(data.data || [])).catch(() => {});
    api.get("/marcas").then(({ data }) => setMarcas(data.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "categoria") {
      const cat = categorias.find(c => c.nombre === value);
      setFormData(prev => ({ ...prev, categoria: value, categoria_id: cat?.id || "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) { setImgError(""); return; }
    setImgError("");

    if (file.type !== "image/webp") {
      setImgError("Solo se aceptan imágenes en formato .webp");
      e.target.value = "";
      return;
    }
    if (file.size > 500 * 1024) {
      setImgError(`El archivo pesa ${(file.size / 1024).toFixed(0)} KB — máximo permitido: 500 KB`);
      e.target.value = "";
      return;
    }
    const dimError = await new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(
          img.naturalWidth < 800 || img.naturalHeight < 600
            ? `Dimensiones ${img.naturalWidth}×${img.naturalHeight} px — mínimo requerido: 800×600 px`
            : null
        );
      };
      img.src = url;
    });
    if (dimError) {
      setImgError(dimError);
      e.target.value = "";
    }
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
        codigo: formData.codigo || null,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        categoria_id: formData.categoria_id || null,
        marca_id: formData.marca_id || null,
        stock: parseInt(formData.stock),
        unidad: formData.unidad || 'unidad',
        imagen: null,
        estado: formData.estado || 'activo',
        caracteristicas: caracteristicasFiltradas,
      };

      console.log("Enviando producto:", productoData);

      const response = await api.post("/productos", productoData);

      if (response.data.success) {
        const nuevoId = response.data.data?.id;
        if (nuevoId && imageFileRef.current?.files?.[0] && !imgError) {
          const imgForm = new FormData();
          imgForm.append("imagen", imageFileRef.current.files[0]);
          await api.post(`/productos/${nuevoId}/imagen`, imgForm, {
            headers: { "Content-Type": "multipart/form-data" },
          }).catch(() => {});
        }
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
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código SKU</Form.Label>
                      <Form.Control
                        type="text"
                        name="codigo"
                        value={formData.codigo}
                        onChange={handleChange}
                        placeholder="Ej: HUE-001"
                        maxLength={20}
                      />
                      <Form.Text className="text-muted">Identificador único del producto</Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={5}>
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
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Unidad</Form.Label>
                      <Form.Select
                        name="unidad"
                        value={formData.unidad}
                        onChange={handleChange}
                      >
                        <option value="unidad">Unidad</option>
                        <option value="pack">Pack</option>
                        <option value="docena">Docena</option>
                        <option value="caja">Caja</option>
                        <option value="bandeja">Bandeja</option>
                        <option value="kg">Kilogramo</option>
                        <option value="bolsa">Bolsa</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
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
                        {categorias.map(c => (
                          <option key={c.id} value={c.nombre}>{c.nombre}</option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        <a href="/admin/categorias" className="text-decoration-none" target="_blank">+ Gestionar categorías</a>
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Marca</Form.Label>
                      <Form.Select
                        name="marca_id"
                        value={formData.marca_id}
                        onChange={handleChange}
                      >
                        <option value="">Sin marca</option>
                        {marcas.map(m => (
                          <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        <a href="/admin/marcas" className="text-decoration-none" target="_blank">+ Gestionar marcas</a>
                      </Form.Text>
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
                      <Form.Label>Precio (S/.) *</Form.Label>
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
                      {formData.unidad && (
                        <Form.Text className="text-muted">en {formData.unidad}s</Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Imagen del producto</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/webp"
                    ref={imageFileRef}
                    onChange={handleImageFileChange}
                  />
                  <Form.Text className="text-muted">
                    Solo .webp · máx. 500 KB · mínimo 800×600 px — se sube a Cloudinary al guardar
                  </Form.Text>
                  {imgError && <div><Form.Text className="text-danger">{imgError}</Form.Text></div>}
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

                  {formData.codigo && (
                    <p className="small text-muted mb-1">
                      <span className="badge bg-light text-dark border">SKU: {formData.codigo}</span>
                    </p>
                  )}
                  <h6>{formData.nombre}</h6>
                  <p className="text-muted small">{formData.descripcion}</p>

                  {formData.precio && (
                    <p className="fw-bold text-success">
                      S/.{parseFloat(formData.precio).toFixed(2)} / {formData.unidad}
                    </p>
                  )}

                  {formData.categoria && (
                    <span className="badge bg-secondary">
                      {formData.categoria}
                    </span>
                  )}

                  {formData.stock && (
                    <p className="small text-muted mt-2">
                      Stock: {formData.stock} {formData.unidad}s
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
