import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Tab, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function MiPerfil() {
  const { user, login } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [formDatos, setFormDatos] = useState({ nombre: '', email: '' });
  const [formPassword, setFormPassword] = useState({ password_actual: '', password_nuevo: '', confirmar: '' });

  useEffect(() => {
    api.get('/usuarios/perfil')
      .then(({ data }) => {
        setPerfil(data.data);
        setFormDatos({ nombre: data.data.nombre, email: data.data.email });
      })
      .catch(() => setMensaje({ tipo: 'danger', texto: 'No se pudo cargar el perfil.' }))
      .finally(() => setLoading(false));
  }, []);

  const handleDatos = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });
    try {
      const { data } = await api.put('/usuarios/perfil', formDatos);
      setPerfil(prev => ({ ...prev, ...data.data }));
      setMensaje({ tipo: 'success', texto: 'Datos actualizados correctamente.' });
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.response?.data?.error || 'Error al actualizar.' });
    } finally {
      setGuardando(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (formPassword.password_nuevo !== formPassword.confirmar) {
      setMensaje({ tipo: 'danger', texto: 'Las contraseñas nuevas no coinciden.' });
      return;
    }
    if (formPassword.password_nuevo.length < 6) {
      setMensaje({ tipo: 'danger', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });
    try {
      await api.put('/usuarios/perfil', {
        password_actual: formPassword.password_actual,
        password_nuevo: formPassword.password_nuevo,
      });
      setFormPassword({ password_actual: '', password_nuevo: '', confirmar: '' });
      setMensaje({ tipo: 'success', texto: 'Contraseña actualizada correctamente.' });
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.response?.data?.error || 'Error al cambiar contraseña.' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <Container className="py-5 text-center"><Spinner /></Container>;

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Mi Perfil</h2>
          <p className="text-muted">Gestiona tu información personal</p>
        </Col>
      </Row>

      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
          {mensaje.texto}
        </Alert>
      )}

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm text-center">
            <Card.Body className="py-4">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 80, height: 80, backgroundColor: '#2D5A27', fontSize: 32, color: 'white' }}
              >
                {perfil?.nombre?.charAt(0).toUpperCase()}
              </div>
              <h5 className="fw-bold mb-1">{perfil?.nombre}</h5>
              <p className="text-muted small mb-2">{perfil?.email}</p>
              <span className="badge bg-success text-capitalize">{perfil?.rol}</span>
              <hr />
              <p className="text-muted small mb-2">
                Miembro desde {perfil?.creado_en ? new Date(perfil.creado_en).toLocaleDateString('es-ES', { dateStyle: 'medium' }) : '—'}
              </p>
              <Button as={Link} to="/mis-pedidos" variant="outline-success" size="sm" className="w-100">
                Ver mis pedidos
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Tab.Container defaultActiveKey="datos">
                <Nav variant="tabs" className="mb-4">
                  <Nav.Item>
                    <Nav.Link eventKey="datos">Datos personales</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="password">Contraseña</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="datos">
                    <Form onSubmit={handleDatos}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre completo</Form.Label>
                        <Form.Control
                          value={formDatos.nombre}
                          onChange={e => setFormDatos(p => ({ ...p, nombre: e.target.value }))}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Correo electrónico</Form.Label>
                        <Form.Control
                          type="email"
                          value={formDatos.email}
                          onChange={e => setFormDatos(p => ({ ...p, email: e.target.value }))}
                          required
                        />
                      </Form.Group>
                      <Button type="submit" variant="success" disabled={guardando}>
                        {guardando ? <Spinner size="sm" className="me-2" /> : null}
                        Guardar cambios
                      </Button>
                    </Form>
                  </Tab.Pane>

                  <Tab.Pane eventKey="password">
                    <Form onSubmit={handlePassword}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contraseña actual</Form.Label>
                        <Form.Control
                          type="password"
                          value={formPassword.password_actual}
                          onChange={e => setFormPassword(p => ({ ...p, password_actual: e.target.value }))}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Nueva contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          value={formPassword.password_nuevo}
                          onChange={e => setFormPassword(p => ({ ...p, password_nuevo: e.target.value }))}
                          minLength={6}
                          required
                        />
                        <Form.Text className="text-muted">Mínimo 6 caracteres.</Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Confirmar nueva contraseña</Form.Label>
                        <Form.Control
                          type="password"
                          value={formPassword.confirmar}
                          onChange={e => setFormPassword(p => ({ ...p, confirmar: e.target.value }))}
                          required
                        />
                      </Form.Group>
                      <Button type="submit" variant="success" disabled={guardando}>
                        {guardando ? <Spinner size="sm" className="me-2" /> : null}
                        Cambiar contraseña
                      </Button>
                    </Form>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MiPerfil;
