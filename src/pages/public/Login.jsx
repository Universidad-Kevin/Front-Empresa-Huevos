import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // key para forzar remount del form (evita autofill)
  const [formKey, setFormKey] = useState(Date.now());

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const t1 = setTimeout(() => setFormKey(Date.now()), 20);
    const t2 = setTimeout(() => {
      setFormData({ email: "", password: "" });
    }, 100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error || "Credenciales inválidas");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-success">Ingresar</h2>
                <p className="text-muted">Acceso para administradores</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              {/* Inputs ocultos anti-autofill */}
              <input
                type="text"
                name="fakeusernameremembered"
                style={{ display: "none" }}
                autoComplete="username"
              />
              <input
                type="password"
                name="fakepasswordremembered"
                style={{ display: "none" }}
                autoComplete="new-password"
              />

              <Form key={formKey} onSubmit={handleSubmit} autoComplete="off">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    autoComplete="off"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********"
                    required
                    autoComplete="new-password"
                  />
                </Form.Group>

                <Button
                  variant="success"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>

                <Button
                  variant="outline-success"
                  className="w-100 mt-2"
                  onClick={() => navigate("/register")}
                >
                  Registrar nuevo cliente
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
