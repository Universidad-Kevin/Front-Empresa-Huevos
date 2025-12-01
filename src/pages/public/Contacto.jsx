import { useState } from "react";
import { Accordion } from "react-bootstrap";
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

function AgregarInteresado() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "",
    mensaje: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const interesadoData = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        asunto: formData.asunto,
        mensaje: formData.mensaje,
      };
      console.log("Enviando datos del interesado:", interesadoData);

      const response = await api.post("/interesados", interesadoData);

      if (response.data.success) {
        setEnviado(true);
        setTimeout(() => {
          navigate("/contacto");
        }, 2000);
      }
    } catch (err) {
      console.error("Error al enviar el formulario:", err);
      setError(
        "Ocurrió un error al enviar el formulario. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const informacionContacto = [
    {
      icon: "📧",
      titulo: "Email",
      contenido: "info@huevosorganicos.com",
      descripcion: "Envíanos un correo",
    },
    {
      icon: "📞",
      titulo: "Teléfono",
      contenido: "+51 912 959 929",
      descripcion: "Lunes a Viernes 8:00-18:00",
    },
    {
      icon: "🏢",
      titulo: "Oficina Principal",
      contenido: "Av. Principal 123, Lima",
      descripcion: "Visítanos",
    },
    {
      icon: "🚚",
      titulo: "Distribución",
      contenido: "distribucion@huevosorganicos.com",
      descripcion: "Para pedidos mayoristas",
    },
  ];

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="fw-bold">Contáctanos</h1>
          <p className="lead text-muted">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </Col>
      </Row>

      <Row>
        {/* Información de Contacto */}
        <Col lg={4} className="mb-4">
          <h3 className="fw-bold mb-4">Información de Contacto</h3>
          {informacionContacto.map((info, index) => (
            <Card key={index} className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-start">
                  <span className="fs-3 me-3">{info.icon}</span>
                  <div>
                    <h6 className="fw-bold mb-1">{info.titulo}</h6>
                    <p className="mb-1">{info.contenido}</p>
                    <small className="text-muted">{info.descripcion}</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Mapa */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="fw-bold mb-3">📍 Nuestra Ubicación</h6>
              <div className="bg-light rounded p-4 text-center">
                <p className="text-muted mb-2">Mapa interactivo</p>
                <small className="text-muted">
                  Av. Principal 123, Ciudad
                  <br />
                  Zona Industrial
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Formulario de Contacto */}
        <Col lg={8}>
          <Card className="border-0 shadow">
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-4">Envíanos un Mensaje</h3>

              {enviado && (
                <Alert variant="success" className="mb-4">
                  ✅ ¡Mensaje enviado correctamente! Te contactaremos pronto.
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-4">
                  ⚠️ {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre completo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Tu nombre completo"
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
                        required
                        placeholder="tu@email.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+1 234 567 890"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Asunto *</Form.Label>
                      <Form.Select
                        name="asunto"
                        value={formData.asunto}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="Información de productos">Información de productos</option>
                        <option value="Distribución mayorista">
                          Distribución mayorista
                        </option>
                        <option value="Soporte al cliente">Soporte al cliente</option>
                        <option value="Otros">Otros</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Mensaje *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </Form.Group>

                <Button
                  variant="success"
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? "Enviando..." : "📨 Enviar Mensaje"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Preguntas Frecuentes */}
          {/* Preguntas Frecuentes */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">❓ Preguntas Frecuentes</h5>

              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    ¿Hacen entregas a domicilio?
                  </Accordion.Header>
                  <Accordion.Body>
                    Sí, realizamos entregas a domicilio en toda el área
                    metropolitana. Consulta nuestra zona de cobertura.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>¿Son realmente orgánicos?</Accordion.Header>
                  <Accordion.Body>
                    Absolutamente. Contamos con certificación orgánica y
                    nuestras gallinas son criadas libremente con alimentación
                    100% orgánica.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AgregarInteresado;
