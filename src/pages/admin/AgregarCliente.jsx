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
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";

function AgregarCliente() {
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

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

      const response = await api.post("/clientes", clienteData);

      if (response.data.success) {
        setSuccess("Cliente agregado exitosamente");
        setTimeout(() => {
          navigate("/admin/clientes");
        }, 1500);
      }
    } catch (error) {
      console.error("Error agregando cliente:", error);
      setError(error.response?.data?.error || "Error al agregar el cliente");
    } finally {
      setLoading(false);
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

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Agregar Cliente</h1>
              <p className="text-muted">Registrar nuevo cliente mayorista</p>
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
                  <Col md={6}>
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
                  <Col md={6}>
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
                      "Agregar Cliente"
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

export default AgregarCliente;
