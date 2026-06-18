import { useState } from 'react'
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap'
import api from '../services/api'

const FORM_INICIAL = {
  nombre: '',
  dni: '',
  email: '',
  telefono: '',
  direccion: '',
  tipo: 'reclamo',
  bien_servicio: '',
  detalle: '',
}

const TIPOS = [
  {
    value: 'reclamo',
    label: 'Reclamo',
    descripcion: 'Disconformidad relacionada con los productos o servicios prestados.',
  },
  {
    value: 'queja',
    label: 'Queja',
    descripcion: 'Malestar o descontento respecto a la atención al cliente.',
  },
]

function ReclamacionModal({ show, onHide }) {
  const [form, setForm] = useState(FORM_INICIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setForm(FORM_INICIAL)
    setError('')
    setEnviado(false)
    onHide()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/reclamos', form)
      setEnviado(true)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo enviar el reclamo. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton style={{ backgroundColor: '#2D5A27' }}>
        <Modal.Title className="text-white fw-bold d-flex align-items-center gap-2">
          <img src="/images/image-6.webp" alt="" style={{ width: 32, height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          Libro de Reclamaciones
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {enviado ? (
          <div className="text-center py-4">
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h5 className="fw-bold mt-3" style={{ color: '#2D5A27' }}>Reclamo registrado</h5>
            <p className="text-muted">
              Tu reclamo fue enviado correctamente. Recibirás una respuesta en un plazo máximo de <strong>15 días hábiles</strong>.
            </p>
            <Button variant="success" onClick={handleClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <p className="text-muted small mb-4">
              Conforme al D.S. N° 011-2011-PCM, contamos con un Libro de Reclamaciones. Puedes registrar tu queja o reclamo completando el siguiente formulario.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Datos del consumidor */}
              <h6 className="fw-bold mb-3" style={{ color: '#23501E' }}>Datos del consumidor</h6>
              <Row className="g-3 mb-4">
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">Nombre completo *</Form.Label>
                  <Form.Control
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombres y apellidos"
                    required
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">DNI *</Form.Label>
                  <Form.Control
                    name="dni"
                    value={form.dni}
                    onChange={handleChange}
                    placeholder="12345678"
                    maxLength={8}
                    required
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">Correo electrónico *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Form.Label className="small fw-bold">Teléfono</Form.Label>
                  <Form.Control
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="+51 999 999 999"
                  />
                </Col>
                <Col xs={12}>
                  <Form.Label className="small fw-bold">Dirección</Form.Label>
                  <Form.Control
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    placeholder="Av. Principal 123, Lima"
                  />
                </Col>
              </Row>

              {/* Tipo de reclamo */}
              <h6 className="fw-bold mb-3" style={{ color: '#23501E' }}>Tipo de registro</h6>
              <Row className="g-3 mb-4">
                {TIPOS.map(tipo => (
                  <Col xs={12} sm={6} key={tipo.value}>
                    <div
                      onClick={() => setForm(prev => ({ ...prev, tipo: tipo.value }))}
                      className="p-3 rounded border h-100"
                      style={{
                        cursor: 'pointer',
                        borderColor: form.tipo === tipo.value ? '#2D5A27' : '#dee2e6',
                        borderWidth: form.tipo === tipo.value ? '2px' : '1px',
                        backgroundColor: form.tipo === tipo.value ? '#f0f9f0' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Form.Check
                        type="radio"
                        name="tipo"
                        value={tipo.value}
                        checked={form.tipo === tipo.value}
                        onChange={handleChange}
                        label={<span className="fw-bold">{tipo.label}</span>}
                      />
                      <small className="text-muted ms-4">{tipo.descripcion}</small>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Identificación y detalle */}
              <h6 className="fw-bold mb-3" style={{ color: '#23501E' }}>Detalle del {form.tipo}</h6>
              <Row className="g-3">
                <Col xs={12}>
                  <Form.Label className="small fw-bold">Producto o servicio involucrado *</Form.Label>
                  <Form.Control
                    name="bien_servicio"
                    value={form.bien_servicio}
                    onChange={handleChange}
                    placeholder="Ej: Huevos orgánicos de codorniz, pedido #123..."
                    required
                  />
                </Col>
                <Col xs={12}>
                  <Form.Label className="small fw-bold">
                    Descripción del {form.tipo} *
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="detalle"
                    value={form.detalle}
                    onChange={handleChange}
                    placeholder="Describe con detalle lo ocurrido..."
                    required
                  />
                  <Form.Text className="text-muted">Mínimo 20 caracteres.</Form.Text>
                </Col>
              </Row>

              <div className="d-flex gap-2 mt-4">
                <Button variant="success" type="submit" className="flex-grow-1" disabled={loading || form.detalle.length < 20}>
                  {loading ? <><Spinner size="sm" className="me-2" />Enviando...</> : 'Enviar reclamo'}
                </Button>
                <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
                  Cancelar
                </Button>
              </div>

              <p className="text-muted text-center mt-3 small">
                Al enviar confirmas que la información es veraz. Responderemos en un plazo de <strong>15 días hábiles</strong>.
              </p>
            </Form>
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default ReclamacionModal
