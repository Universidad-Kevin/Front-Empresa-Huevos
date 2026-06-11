import { useState, useEffect, useRef } from "react";
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
import { SkeletonForm } from "../../components/SkeletonLoader";

function EditarProducto() {
  const { id } = useParams();
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
    estado: "",
    caracteristicas: [""],
  });
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const autoMatchedRef = useRef(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imgError, setImgError] = useState("");

  useEffect(() => {
    if (id) {
      fetchProducto();
    } else {
      setError("No se proporcionó ID del producto");
      setCargando(false);
    }
    api.get("/categorias").then(({ data }) => setCategorias(data.data || [])).catch(() => {});
    api.get("/marcas").then(({ data }) => setMarcas(data.data || [])).catch(() => {});
  }, [id]);

  // Auto-match categoria text → categoria_id para productos pre-migración
  useEffect(() => {
    if (autoMatchedRef.current || categorias.length === 0) return;
    if (!formData.categoria_id && formData.categoria) {
      const match = categorias.find(c => c.nombre.toLowerCase() === formData.categoria.toLowerCase());
      if (match) {
        setFormData(prev => ({ ...prev, categoria_id: match.id }));
        autoMatchedRef.current = true;
      }
    }
  }, [categorias]);

  const fetchProducto = async () => {
    try {
      setCargando(true);

      // Usar la instancia `api` (ya maneja baseURL y Authorization via interceptor)
      const response = await api.get(`/productos/${id}`);

      if (response.data.success && response.data.data) {
        const producto = response.data.data;

        // Convertir características a array de strings (puede venir como string JSON, array o objeto)
        let caracteristicas = [""];
        if (producto.caracteristicas) {
          let parsed = producto.caracteristicas;
          if (typeof parsed === "string") {
            try { parsed = JSON.parse(parsed); } catch { parsed = [parsed]; }
          }
          if (Array.isArray(parsed)) {
            caracteristicas = parsed.length > 0 ? parsed : [""];
          } else if (parsed && typeof parsed === "object") {
            // Objeto tipo {certificado: true, ...} → convertir a "clave: valor"
            caracteristicas = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`);
            if (caracteristicas.length === 0) caracteristicas = [""];
          }
        }

        setFormData({
          codigo: producto.codigo || "",
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          precio: producto.precio || "",
          categoria: producto.categoria || "",
          categoria_id: producto.categoria_id || "",
          marca_id: producto.marca_id || "",
          stock: producto.stock || "",
          unidad: producto.unidad || "unidad",
          imagen: producto.imagen || "",
          estado: producto.estado || "",
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError("");
    setUploadingImg(true);
    const form = new FormData();
    form.append("imagen", file);
    try {
      const { data } = await api.post(`/productos/${id}/imagen`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, imagen: data.imagen }));
    } catch (err) {
      setImgError(err.response?.data?.error || "Error al subir imagen");
    } finally {
      setUploadingImg(false);
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

  if (cargando) return <SkeletonForm rows={6} />;

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
                  <Form.Label>Imagen del producto</Form.Label>
                  <Form.Control
                    type="url"
                    name="imagen"
                    value={formData.imagen?.startsWith("data:") ? "" : (formData.imagen || "")}
                    onChange={handleChange}
                    placeholder="URL de imagen (o sube un archivo abajo)"
                    className="mb-2"
                  />
                  <Form.Control
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    disabled={uploadingImg}
                  />
                  {uploadingImg && <Form.Text className="text-muted">Subiendo imagen...</Form.Text>}
                  {imgError && <Form.Text className="text-danger">{imgError}</Form.Text>}
                  {!imgError && !uploadingImg && formData.imagen?.startsWith("data:") && (
                    <Form.Text className="text-success">Imagen subida correctamente</Form.Text>
                  )}
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
                    S/.{parseFloat(formData.precio).toFixed(2)}
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
