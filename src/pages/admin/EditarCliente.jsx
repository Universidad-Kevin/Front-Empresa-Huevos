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
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

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

  const navigate = useNavigate();

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

  if (cargando) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando datos del cliente...</p>
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
              <h1 className="fw-bold">Editar Cliente</h1>
              <p className="text-muted">Modificar información del cliente</p>
            </div>
            <Link to="/admin/clientes" className="btn btn-outline-secondary">
              ← Volver a Clientes
            </Link>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
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
                    <Form.Group className="mb-3">
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
                    <Form.Group className="mb-3">
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
                    <Form.Group className="mb-3">
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
                    <Form.Group className="mb-3">
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
                    <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
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
                    <Form.Group className="mb-3">
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
                    <Form.Group className="mb-3">
                      <Form.Label>Límite de Crédito ($)</Form.Label>
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
                    <Form.Group className="mb-3">
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
                  <Link
                    to="/admin/clientes"
                    className="btn btn-outline-secondary"
                  >
                    Cancelar
                  </Link>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Actualizar Cliente"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EditarCliente;
