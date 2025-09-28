import { Container, Row, Col, Card } from 'react-bootstrap'

function Nosotros() {
  const valores = [
    {
      icon: '🌱',
      titulo: 'Sostenibilidad',
      descripcion: 'Practicamos agricultura regenerativa y cuidado del medio ambiente en todas nuestras operaciones.'
    },
    {
      icon: '🐔',
      titulo: 'Bienestar Animal',
      descripcion: 'Nuestras gallinas viven en libertad con espacio para expresar su comportamiento natural.'
    },
    {
      icon: '🏆',
      titulo: 'Calidad',
      descripcion: 'Garantizamos la más alta calidad en cada huevo mediante rigurosos controles de calidad.'
    },
    {
      icon: '🤝',
      titulo: 'Comunidad',
      descripcion: 'Trabajamos con productores locales y apoyamos el desarrollo de nuestra comunidad.'
    }
  ]

  const equipo = [
    {
      nombre: 'María González',
      puesto: 'Fundadora & CEO',
      descripcion: 'Más de 15 años de experiencia en agricultura orgánica.',
      imagen: '/images/team1.jpg'
    },
    {
      nombre: 'Carlos Rodríguez',
      puesto: 'Director de Producción',
      descripcion: 'Especialista en bienestar animal y producción sostenible.',
      imagen: '/images/team2.jpg'
    },
    {
      nombre: 'Ana Martínez',
      puesto: 'Directora de Calidad',
      descripcion: 'Encargada de garantizar los más altos estándares de calidad.',
      imagen: '/images/team3.jpg'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-success text-white py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h1 className="display-4 fw-bold mb-4">Sobre Nosotros</h1>
              <p className="lead">
                Desde 2010, nos dedicamos a producir huevos orgánicos de la más alta calidad, 
                respetando el medio ambiente y el bienestar animal.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Nuestra Historia */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="fw-bold mb-4">Nuestra Historia</h2>
              <p className="text-muted mb-4">
                Todo comenzó en una pequeña granja familiar donde creíamos que era posible 
                producir alimentos de calidad mientras cuidábamos del planeta. Lo que empezó 
                como un proyecto pequeño hoy es una empresa comprometida con la alimentación 
                saludable y sostenible.
              </p>
              <p className="text-muted mb-4">
                Hoy, trabajamos con más de 50 productores locales y distribuimos nuestros 
                huevos orgánicos en toda la región, manteniendo siempre nuestros valores 
                fundamentales de calidad, sostenibilidad y bienestar animal.
              </p>
              <div className="d-flex gap-3">
                <div className="text-center">
                  <h3 className="text-success fw-bold">5,000+</h3>
                  <p className="text-muted">Gallinas felices</p>
                </div>
                <div className="text-center">
                  <h3 className="text-success fw-bold">14 años</h3>
                  <p className="text-muted">De experiencia</p>
                </div>
                <div className="text-center">
                  <h3 className="text-success fw-bold">100%</h3>
                  <p className="text-muted">Orgánico certificado</p>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <img 
                src="/images/granja-nosotros.jpg" 
                alt="Nuestra granja"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Nuestros Valores */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="fw-bold">Nuestros Valores</h2>
              <p className="text-muted">Los principios que guían nuestro trabajo</p>
            </Col>
          </Row>
          <Row>
            {valores.map((valor, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Body className="p-4">
                    <div className="display-4 mb-3">{valor.icon}</div>
                    <Card.Title>{valor.titulo}</Card.Title>
                    <Card.Text className="text-muted">
                      {valor.descripcion}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Nuestro Equipo */}
      <section className="py-5">
        <Container>
          <Row className="mb-5">
            <Col className="text-center">
              <h2 className="fw-bold">Nuestro Equipo</h2>
              <p className="text-muted">Las personas detrás de Huevos Orgánicos</p>
            </Col>
          </Row>
          <Row>
            {equipo.map((miembro, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="h-100 text-center border-0 shadow-sm">
                  <Card.Img 
                    variant="top" 
                    src={miembro.imagen}
                    style={{ height: '250px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Title>{miembro.nombre}</Card.Title>
                    <Card.Subtitle className="text-success mb-2">
                      {miembro.puesto}
                    </Card.Subtitle>
                    <Card.Text className="text-muted">
                      {miembro.descripcion}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  )
}

export default Nosotros