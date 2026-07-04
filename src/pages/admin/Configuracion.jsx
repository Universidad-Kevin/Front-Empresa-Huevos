import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs, Spinner } from 'react-bootstrap'
import api from '../../services/api'

function Configuracion() {
  const [configuracion, setConfiguracion] = useState({
    general: {
      nombreEmpresa: '',
      email: '',
      telefono: '',
      direccion: '',
      descripcion: ''
    },
    notificaciones: {
      emailPedidos: true,
      emailStock: true,
      emailClientes: false,
      notificacionesApp: true
    },
    seguridad: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiration: 90
    }
  })

  const [guardado, setGuardado] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/configuracion')
      .then(({ data }) => {
        const c = data.data
        setConfiguracion(prev => ({
          ...prev,
          general: {
            nombreEmpresa: c.nombre_empresa || '',
            email: c.email_contacto || '',
            telefono: c.telefono || '',
            direccion: c.direccion || '',
            descripcion: c.descripcion || ''
          }
        }))
      })
      .catch(() => setError('No se pudo cargar la configuración de la empresa'))
      .finally(() => setCargandoInicial(false))
  }, [])

  const handleChange = (seccion, campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

    try {
      await api.put('/configuracion', {
        nombre_empresa: configuracion.general.nombreEmpresa,
        email_contacto: configuracion.general.email,
        telefono: configuracion.general.telefono,
        direccion: configuracion.general.direccion,
        descripcion: configuracion.general.descripcion,
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar la configuración')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Configuración</h1>
          <p className="text-muted">Configura los parámetros del sistema</p>
        </Col>
      </Row>

      {guardado && (
        <Alert variant="success" className="mb-4">
          ✅ Configuración guardada correctamente
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {cargandoInicial ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
      <Form onSubmit={handleSubmit}>
        <Tabs defaultActiveKey="general" className="mb-4">
          {/* Pestaña General */}
          <Tab eventKey="general" title="⚙️ General">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-4">Información General</h5>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre de la Empresa *</Form.Label>
                      <Form.Control
                        type="text"
                        value={configuracion.general.nombreEmpresa}
                        onChange={(e) => handleChange('general', 'nombreEmpresa', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email de Contacto *</Form.Label>
                      <Form.Control
                        type="email"
                        value={configuracion.general.email}
                        onChange={(e) => handleChange('general', 'email', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono *</Form.Label>
                      <Form.Control
                        type="tel"
                        value={configuracion.general.telefono}
                        onChange={(e) => handleChange('general', 'telefono', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Dirección *</Form.Label>
                      <Form.Control
                        type="text"
                        value={configuracion.general.direccion}
                        onChange={(e) => handleChange('general', 'direccion', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Descripción de la Empresa</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Describe tu empresa..."
                    value={configuracion.general.descripcion}
                    onChange={(e) => handleChange('general', 'descripcion', e.target.value)}
                    maxLength={2000}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Tab>

          {/* Pestaña Notificaciones */}
          <Tab eventKey="notificaciones" title="🔔 Notificaciones">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-4">Configuración de Notificaciones</h5>
                
                <div className="mb-4">
                  <h6 className="fw-bold mb-3">Notificaciones por Email</h6>
                  
                  <Form.Check
                    type="switch"
                    id="email-pedidos"
                    label="Nuevos pedidos"
                    checked={configuracion.notificaciones.emailPedidos}
                    onChange={(e) => handleChange('notificaciones', 'emailPedidos', e.target.checked)}
                    className="mb-3"
                  />
                  
                  <Form.Check
                    type="switch"
                    id="email-stock"
                    label="Stock bajo"
                    checked={configuracion.notificaciones.emailStock}
                    onChange={(e) => handleChange('notificaciones', 'emailStock', e.target.checked)}
                    className="mb-3"
                  />
                  
                  <Form.Check
                    type="switch"
                    id="email-clientes"
                    label="Nuevos clientes"
                    checked={configuracion.notificaciones.emailClientes}
                    onChange={(e) => handleChange('notificaciones', 'emailClientes', e.target.checked)}
                    className="mb-3"
                  />
                </div>

                <div>
                  <h6 className="fw-bold mb-3">Notificaciones del Sistema</h6>
                  
                  <Form.Check
                    type="switch"
                    id="notif-app"
                    label="Notificaciones en la aplicación"
                    checked={configuracion.notificaciones.notificacionesApp}
                    onChange={(e) => handleChange('notificaciones', 'notificacionesApp', e.target.checked)}
                  />
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* Pestaña Seguridad */}
          <Tab eventKey="seguridad" title="🔒 Seguridad">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-4">Configuración de Seguridad</h5>
                
                <Form.Check
                  type="switch"
                  id="two-factor"
                  label="Autenticación de dos factores (2FA)"
                  checked={configuracion.seguridad.twoFactor}
                  onChange={(e) => handleChange('seguridad', 'twoFactor', e.target.checked)}
                  className="mb-4"
                />

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tiempo de espera de sesión (minutos)</Form.Label>
                      <Form.Select
                        value={configuracion.seguridad.sessionTimeout}
                        onChange={(e) => handleChange('seguridad', 'sessionTimeout', parseInt(e.target.value))}
                      >
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={120}>2 horas</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Expiración de contraseña (días)</Form.Label>
                      <Form.Select
                        value={configuracion.seguridad.passwordExpiration}
                        onChange={(e) => handleChange('seguridad', 'passwordExpiration', parseInt(e.target.value))}
                      >
                        <option value={30}>30 días</option>
                        <option value={60}>60 días</option>
                        <option value={90}>90 días</option>
                        <option value={180}>180 días</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="bg-light rounded p-3">
                  <h6 className="fw-bold">Recomendaciones de Seguridad</h6>
                  <ul className="small text-muted mb-0">
                    <li>Usa contraseñas fuertes y cámbialas regularmente</li>
                    <li>Habilita la autenticación de dos factores</li>
                    <li>Mantén el software actualizado</li>
                    <li>Realiza backups regularmente</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* Pestaña Avanzado */}
          <Tab eventKey="avanzado" title="⚡ Avanzado">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold mb-4">Configuración Avanzada</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label>API Key</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu API key"
                    className="mb-2"
                  />
                  <Form.Text className="text-muted">
                    Usa esta clave para integrar con otros sistemas
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>URL de Webhook</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://ejemplo.com/webhook"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Log Level</Form.Label>
                  <Form.Select>
                    <option value="error">Solo Errores</option>
                    <option value="warn">Advertencias</option>
                    <option value="info">Información</option>
                    <option value="debug">Debug</option>
                  </Form.Select>
                </Form.Group>

                <Alert variant="warning">
                  <strong>⚠️ Precaución</strong><br/>
                  Los cambios en esta sección pueden afectar el funcionamiento del sistema.
                </Alert>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Botones de acción */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <Button
                variant="success"
                type="submit"
                disabled={cargando}
                className="px-4"
              >
                {cargando ? 'Guardando...' : '💾 Guardar Configuración'}
              </Button>
              
              <div className="d-flex gap-2">
                <Button variant="outline-secondary">
                  🔄 Restablecer
                </Button>
                <Button variant="outline-danger">
                  🗑️ Eliminar Datos
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Form>
      )}
    </Container>
  )
}

export default Configuracion