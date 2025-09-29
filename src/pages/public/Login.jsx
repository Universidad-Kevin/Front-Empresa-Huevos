import { useState } from "react";
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
import api from '../../services/api';

function Login() {
  const [formData, setFormData] = useState({
    email: "admin@huevos.com",
    password: "admin123",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // En tu Login.jsx - Agrega más logging
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("1. 📤 Enviando credenciales...");

      // Test directo para ver la respuesta
      const testResponse = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      console.log("2. 📨 Respuesta REAL del servidor:", testResponse);
      console.log("3. 📊 response.data:", testResponse.data);

      // Ahora usar el AuthContext
      console.log("4. 🔄 Llamando a login del AuthContext...");
      const result = await login(formData.email, formData.password);

      console.log("5. ✅ Resultado del AuthContext:", result);
      console.log(
        "6. 💾 Token guardado:",
        localStorage.getItem("huevos_token")
      );
      console.log("7. 👤 User guardado:", localStorage.getItem("huevos_user"));

      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("❌ Error completo en handleSubmit:", err);
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

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@huevos.com"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="admin123"
                    required
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
              </Form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Credenciales: admin@huevos.com / admin123
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
