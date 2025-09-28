import { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simular envío
    setTimeout(() => {
      setEnviado(true)
      setLoading(false)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      })
    }, 2000)
  }

  const informacionContacto = [
    {
      icon: '📧',
      titulo: 'Email',
      contenido: 'info@huevosorganicos.com',
      descripcion: 'Envíanos un correo'
    },
    {
      icon: '📞',
      titulo: 'Teléfono',
      contenido: '+1 234 567 890',
      descripcion: 'Lunes a Viernes 8:00-18:00'
    },
    {
      icon: '🏢',
      titulo: 'Oficina Principal',
      contenido: 'Av. Principal 123, Ciudad',
      descripcion: 'Visítanos'
    },
    {
      icon: '🚚',
      titulo: 'Distribución',
      contenido: 'distribucion@huevosorganicos.com',
      descripcion: 'Para pedidos mayoristas'
    }
  ]

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
                  Av. Principal 123, Ciudad<br/>
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
                        <option value="ventas">Información de productos</option>
                        <option value="distribucion">Distribución mayorista</option>
                        <option value="soporte">Soporte al cliente</option>
                        <option value="otros">Otros</option>
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
                  {loading ? 'Enviando...' : '📨 Enviar Mensaje'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Preguntas Frecuentes */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">❓ Preguntas Frecuentes</h5>
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h6 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      ¿Hacen entregas a domicilio?
                    </button>
                  </h6>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Sí, realizamos entregas a domicilio en toda el área metropolitana. 
                      Consulta nuestra zona de cobertura.
                    </div>
                  </div>
                </div>
                <div className="accordion-item">
                  <h6 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      ¿Son realmente orgánicos?
                    </button>
                  </h6>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Absolutamente. Contamos con certificación orgánica y nuestras gallinas 
                      son criadas libremente con alimentación 100% orgánica.
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Contacto