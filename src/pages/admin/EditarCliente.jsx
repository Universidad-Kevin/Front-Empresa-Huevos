import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { SkeletonForm } from "../../components/SkeletonLoader";
import Seo from "../../components/Seo";

function EditarCliente() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nombre_empresa: "",
    tipo_negocio: "Restaurante",
    contacto_nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ruc: "",
    tipo_cliente: "Mayorista",
    limite_credito: "",
    estado: "activo",
  });
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordAcceso, setPasswordAcceso] = useState("");
  const [loadingCred, setLoadingCred] = useState(false);
  const [successCred, setSuccessCred] = useState("");
  const [tieneAcceso, setTieneAcceso] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const successFromPedido = location.state?.successMsg || "";

  const fetchCliente = async () => {
    try {
      setCargando(true);
      const response = await api.get(`/clientes/${id}`);
      const cliente = response.data.data;

      setFormData({
        nombre_empresa: cliente.nombre_empresa || "",
        tipo_negocio: cliente.tipo_negocio || "Restaurante",
        contacto_nombre: cliente.contacto_nombre || "",
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        direccion: cliente.direccion || "",
        ruc: cliente.ruc || "",
        tipo_cliente: cliente.tipo_cliente || "Mayorista",
        limite_credito: cliente.limite_credito || "",
        estado: cliente.estado || "activo",
      });
      setTieneAcceso(!!cliente.password);
    } catch (error) {
      console.error("Error cargando cliente:", error);
      setError("Error al cargar los datos del cliente");
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const clienteData = {
        ...formData,
        limite_credito: parseFloat(formData.limite_credito) || 0,
      };

      const response = await api.put(`/clientes/${id}`, clienteData);

      if (response.data.success) {
        setSuccess("Cliente actualizado exitosamente");
        setTimeout(() => {
          navigate("/admin/clientes");
        }, 1500);
      }
    } catch (error) {
      console.error("Error actualizando cliente:", error);
      setError(error.response?.data?.error || "Error al actualizar el cliente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCliente();
    }
  }, [id]);

  const handleAsignarCredenciales = async () => {
    if (!passwordAcceso || passwordAcceso.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoadingCred(true);
    try {
      await api.post(`/clientes/${id}/credenciales`, { password: passwordAcceso, enviarEmail: true });
      setSuccessCred("Credenciales asignadas y email enviado al cliente.");
      setTieneAcceso(true);
      setPasswordAcceso("");
    } catch (err) {
      alert(err.response?.data?.error || "Error al asignar credenciales");
    } finally {
      setLoadingCred(false);
    }
  };

  const tiposNegocio = [
    "Restaurante",
    "Supermercado",
    "Hotel",
    "Cafetería",
    "Distribuidor",
    "Panadería",
    "Otro",
  ];

  const tiposCliente = ["Mayorista", "Minorista", "Corporativo"];

  const estados = ["activo", "inactivo", "pendiente"];

  if (cargando) return <SkeletonForm rows={7} />;

  return (
    <Container className="py-4">
      <Seo path="/admin/editar-cliente" title="Editar Cliente" noindex />
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Editar Cliente</h1>
              <p className="text-muted">Modificar información del cliente</p>
            </div>
            <div className="d-flex gap-2">
              <Link
                to={`/admin/clientes/${id}/nuevo-pedido`}
                className="btn btn-success"
              >
                + Crear Pedido
              </Link>
              <Link to="/admin/clientes" className="btn btn-outline-secondary">
                ← Volver a Clientes
              </Link>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body>
              {successFromPedido && <Alert variant="success">{successFromPedido}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cli-nombre-empresa">
                      <Form.Label>Nombre de la Empresa *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre_empresa"
                        value={formData.nombre_empresa}
                        onChange={handleChange}
                        placeholder="Ej: Restaurante La Cabaña"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cli-tipo-negocio">
                      <Form.Label>Tipo de Negocio *</Form.Label>
                      <Form.Select
                        name="tipo_negocio"
                        value={formData.tipo_negocio}
                        onChange={handleChange}
                        required
                      >
                        {tiposNegocio.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cli-contacto-nombre">
                      <Form.Label>Nombre del Contacto *</Form.Label>
                      <Form.Control
                        type="text"
                        name="contacto_nombre"
                        value={formData.contacto_nombre}
                        onChange={handleChange}
                        placeholder="Ej: Juan Pérez"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cli-email">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ejemplo@empresa.com"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cli-telefono">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+1234567890"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="cli-ruc">
                      <Form.Label>RUC</Form.Label>
                      <Form.Control
                        type="text"
                        name="ruc"
                        value={formData.ruc}
                        onChange={handleChange}
                        placeholder="12345678901"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="cli-direccion">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Dirección completa de la empresa..."
                  />
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="cli-tipo-cliente">
                      <Form.Label>Tipo de Cliente</Form.Label>
                      <Form.Select
                        name="tipo_cliente"
                        value={formData.tipo_cliente}
                        onChange={handleChange}
                      >
                        {tiposCliente.map((tipo) => (
                          <option key={tipo} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="cli-limite-credito">
                      <Form.Label>Límite de Crédito (S/.)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="limite_credito"
                        value={formData.limite_credito}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="cli-estado">
                      <Form.Label>Estado</Form.Label>
                      <Form.Select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                      >
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 justify-content-end">
                  <Link to="/admin/clientes" className="btn btn-outline-secondary">Cancelar</Link>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Actualizar Cliente"}
                  </Button>
                </div>
              </Form>

              {/* Sección acceso al portal mayorista */}
              <hr className="my-4" />
              <h2 className="h6 fw-bold mb-3">
                🔐 Acceso al Portal Mayorista
                {tieneAcceso && <span className="badge bg-success ms-2">Activo</span>}
              </h2>
              {successCred && <Alert variant="success" className="py-2">{successCred}</Alert>}
              <p className="text-muted small mb-3">
                {tieneAcceso
                  ? "Este cliente ya tiene acceso al portal. Puedes cambiar su contraseña asignando una nueva."
                  : "Asigna una contraseña para que este cliente pueda acceder al portal mayorista."}
              </p>
              <Row className="align-items-end g-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small">{tieneAcceso ? "Nueva contraseña" : "Contraseña de acceso"}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={passwordAcceso}
                      onChange={e => setPasswordAcceso(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Button
                    variant={tieneAcceso ? "outline-warning" : "success"}
                    onClick={handleAsignarCredenciales}
                    disabled={loadingCred || !passwordAcceso}
                  >
                    {loadingCred
                      ? <Spinner animation="border" size="sm" />
                      : tieneAcceso ? "🔄 Cambiar contraseña" : "✅ Dar acceso y enviar email"}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EditarCliente;
