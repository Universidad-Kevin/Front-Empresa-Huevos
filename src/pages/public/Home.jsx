import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'

function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="text-white py-5">
        <Container >
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 style={{ color: '#2D5A27' }} className="display-4 fw-bold mb-4">
                Disfruta del sabor auténtico
                del
                <span className='font-italic'> campo</span>,
                directo a tu mesa.
              </h1>
              <p style={{ color: '#000000' }} className="lead mb-4">
                Explora una selección diversa de productos frescos y sostenibles,
                cultivados sin químicos y con el cuidado que solo los procesos
                artesanales pueden ofrecer.
              </p>
              <div className="d-flex gap-3" style={{ color: '#ffffff', variant: 'success', size: 'lg' }}>
                <Button as={Link} to="/productos" style={{ backgroundColor: '#2D5A27' }}>
                  Ver Productos {'->'}
                </Button>
                <Button as={Link} to="/nosotros" style={{ backgroundColor: '#CCEACF', color: '#2D5A27' }}>
                  Conócenos
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <img
                src="src/public/images/image-1-home.webp"
                alt="Huevos orgánicos"
                className="img-fluid rounded"
                style={{ width: '697px', height: '371px' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5" style={{ backgroundColor: '#F0F0F0' }}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-2">
              <img src="src/public/images/pngwing.camion-1.webp"
                style={{ width: '194px', height: '93px', objectFit: 'contain' }}
                alt="camion" className="me-3" />
              <div className="text-start">
                <h6 style={{ color: '#23501E', fontWeight: 'bold', marginBottom: '12px' }}>{'>'} 24 horas</h6>
                <p style={{ color: '#23501E', margin: 4, lineHeight: '1.2' }}>a tu hogar <br /> o local</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-4">
              <img src="src/public/images/pngwing.organico-1.webp"
                style={{ width: '214px', height: '167px', objectFit: 'contain' }}
                alt="organico" className="me-3" />
              <div className="text-start">
                <h6 style={{ color: '#23501E', fontWeight: 'bold', marginBottom: '4px' }}>+ 70</h6>
                <p style={{ color: '#23501E', margin: 0, lineHeight: '1.2' }}>productos orgánicos</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-4">
              <img src="src/public/images/icono-conservante-simbolo-libre-quimicos-toxicos-producto-limpio-ilustracion-vectorial-eps-10-stock_.webp"
                style={{ width: '140px', height: '140px', objectFit: 'contain' }}
                alt="sin quimicos" className="me-3" />
              <div className="text-start">
                <h6 style={{ color: '#23501E', fontWeight: 'bold', marginBottom: '4px' }}>0%</h6>
                <p style={{ color: '#23501E', margin: 0, lineHeight: '1.2' }}>químicos</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-4">
              <img src="src/public/images/imagen-vectorial-icono-terapia-puede-usarse-tdah_120816-359788-removebg-preview-1.webp"
                style={{ width: '149px', height: '149px', objectFit: 'contain' }}
                alt="saludables" className="me-3" />
              <div className="text-start">
                <h6 style={{ color: '#23501E', fontWeight: 'bold', marginBottom: '4px' }}>100%</h6>
                <p style={{ color: '#23501E', margin: 0, lineHeight: '1.2' }}>saludables</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 style={{ color: '#2D5A27' }} className="fw-bold">¿Por qué elegir CampOrganic?</h2>
            </Col>
          </Row>
          <Row className="p-lg-4">

            <Col lg={5} className="mb-4 d-flex">
              <div style={{ backgroundColor: '#2D5A27', borderRadius: '40px' }} className="p-4 w-100 h-100 d-flex align-items-center justify-content-between">
                <div className="pe-3">
                  <h4 style={{ color: '#ffffff' }}>Compromiso <br />100% orgánico</h4>
                  <p className="text-white mb-0">Todos nuestros productos crecen sin pesticidas ni fertilizantes químicos, protegiendo tanto tu salud como el equilibrio del ecosistema.</p>
                </div>
                <img src="src/public/images/image-9.webp"
                  style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                  alt="organico" className="flex-shrink-0" />
              </div>
            </Col>

            <Col lg={7} className="mb-4 d-flex flex-column gap-3">
              <div style={{ backgroundColor: '#CCEACF', borderRadius: '40px' }} className="p-4 w-100 d-flex align-items-center justify-content-between">
                <div className="pe-3">
                  <h4 style={{ color: '#000000' }}>Trazabilidad de confianza</h4>
                  <p className="text-black mb-0">Al ser productores directos, cada producto que llega a tu mesa ha sido supervisado por nosotros desde su origen, asegurando una frescura que no encontrarás en ningún supermercado.</p>
                </div>
                <img src="src/public/images/image-9.webp"
                  style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                  alt="organico" className="flex-shrink-0" />
              </div>
              <div className="d-flex gap-3 flex-column flex-sm-row h-100">
                <div style={{ backgroundColor: '#2D5A27', borderRadius: '40px' }} className="p-4 w-100 d-flex align-items-center justify-content-between">
                  <div className="pe-2">
                    <h5 style={{ color: '#ffffff', margin: 0 }}>Apoyo al consumo local y responsable</h5>
                  </div>
                  <img src="src/public/images/image-9.webp"
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    alt="organico" className="flex-shrink-0" />
                </div>
                <div style={{ backgroundColor: '#2D5A27', borderRadius: '40px' }} className="p-4 w-100 d-flex align-items-center justify-content-between">
                  <div className="pe-2">
                    <h5 style={{ color: '#ffffff', margin: 0 }}>Atención personalizada</h5>
                  </div>
                  <img src="src/public/images/image-9.webp"
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    alt="organico" className="flex-shrink-0" />
                </div>
              </div>
            </Col>

          </Row>
        </Container>
      </section>

      {/* Productos Destacados */}
      <section className="py-5" style={{ backgroundColor: '#DAF9DD' }}>
        <Container>
          <Row className="mb-5">
            <Col>
              <h2 style={{ color: '#23501E' }} className="fw-bold">Lo Mejor De CampOrganic</h2>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border" style={{ borderColor: '#2D5A27', borderWidth: '10px' }}>
                <Card.Img
                  variant="top"
                  src={"/Front-Empresa-Huevos/src/public/images/huevo-organico.jpg"}
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
    </main>
  )
}

export default Home