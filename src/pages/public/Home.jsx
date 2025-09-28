import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-success text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Huevos 100% Orgánicos 🥚
              </h1>
              <p className="lead mb-4">
                Descubre la diferencia de nuestros huevos de gallinas criadas 
                libremente con alimentación orgánica y cuidado responsable.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} to="/productos" variant="light" size="lg">
                  Ver Productos
                </Button>
                <Button as={Link} to="/nosotros" variant="outline-light" size="lg">
                  Conócenos
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src="/images/hero-huevos.jpg" 
                alt="Huevos orgánicos"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">¿Por qué elegirnos?</h2>
              <p className="text-muted">Calidad y compromiso en cada huevo</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="text-center mb-4">
              <div className="feature-icon bg-success bg-opacity-10 rounded-circle p-4 mb-3 d-inline-block">
                🌱
              </div>
              <h4>100% Orgánico</h4>
              <p className="text-muted">Alimentación natural sin pesticidas ni químicos</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="feature-icon bg-success bg-opacity-10 rounded-circle p-4 mb-3 d-inline-block">
                🐔
              </div>
              <h4>Gallinas Libres</h4>
              <p className="text-muted">Criadas en libertad con espacio para pastorear</p>
            </Col>
            <Col md={4} className="text-center mb-4">
              <div className="feature-icon bg-success bg-opacity-10 rounded-circle p-4 mb-3 d-inline-block">
                🚚
              </div>
              <h4>Entrega Fresca</h4>
              <p className="text-muted">Recibe tus huevos frescos directamente</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Productos Destacados */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col>
              <h2 className="fw-bold text-center">Productos Destacados</h2>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src="/images/huevo-organico.jpg"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Huevos Orgánicos Grade A</Card.Title>
                  <Card.Text className="flex-grow-1">
                    Huevos frescos de gallinas criadas libremente en pastoreo.
                  </Card.Text>
                  <div className="mt-auto">
                    <h5 className="text-success">$8.99</h5>
                    <Button as={Link} to="/productos" variant="success">
                      Ver Más
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src="/images/huevo-omega3.jpg"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Huevos Premium Omega-3</Card.Title>
                  <Card.Text className="flex-grow-1">
                    Enriquecidos naturalmente con ácidos grasos Omega-3.
                  </Card.Text>
                  <div className="mt-auto">
                    <h5 className="text-success">$12.99</h5>
                    <Button as={Link} to="/productos" variant="success">
                      Ver Más
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src="/images/huevo-codorniz.jpg"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Huevos de Codorniz</Card.Title>
                  <Card.Text className="flex-grow-1">
                    Huevos pequeños llenos de sabor y nutrientes concentrados.
                  </Card.Text>
                  <div className="mt-auto">
                    <h5 className="text-success">$6.99</h5>
                    <Button as={Link} to="/productos" variant="success">
                      Ver Más
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  )
}

export default Home