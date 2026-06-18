import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import api from '../../services/api'
import { useCart } from '../../context/CartContext'

function SkeletonCard() {
  return (
    <Card className="h-100 shadow-sm">
      <div className="placeholder-glow">
        <div className="placeholder w-100" style={{ height: '200px' }} />
      </div>
      <Card.Body className="d-flex flex-column placeholder-glow">
        <div className="placeholder col-8 mb-2 rounded" style={{ height: '1.2rem' }} />
        <div className="placeholder col-12 mb-1 rounded" style={{ height: '0.8rem' }} />
        <div className="placeholder col-10 mb-3 rounded" style={{ height: '0.8rem' }} />
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <div className="placeholder col-4 rounded" style={{ height: '1.5rem' }} />
          <div className="placeholder col-4 rounded" style={{ height: '2rem' }} />
        </div>
      </Card.Body>
    </Card>
  )
}

function Home() {
  const [destacados, setDestacados] = useState([])
  const [loadingDestacados, setLoadingDestacados] = useState(true)
  const { addToCart, isStaff } = useCart()

  useEffect(() => {
    api.get('/productos/activos')
      .then(({ data }) => {
        const lista = data?.data ?? data ?? []
        // Tomar los 3 primeros con stock disponible; si no hay suficientes, completar con los demás
        const conStock = lista.filter(p => p.stock > 0)
        const sinStock = lista.filter(p => p.stock === 0)
        setDestacados([...conStock, ...sinStock].slice(0, 3))
      })
      .catch(() => setDestacados([]))
      .finally(() => setLoadingDestacados(false))
  }, [])

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
              <div className="d-flex gap-3">
                <Button as={Link} to="/productos" variant="success">
                  Ver Productos →
                </Button>
                <Button as={Link} to="/nosotros" className="btn-accent">
                  Conócenos
                </Button>
              </div>
            </Col>
            <Col lg={6} className="mt-4 mt-lg-0">
              <img
                src="/images/image-1-home.webp"
                alt="Huevos orgánicos"
                className="img-fluid rounded w-100"
                style={{ maxHeight: '370px', objectFit: 'cover' }}
              />
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5" style={{ backgroundColor: '#F0F0F0' }}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-2">
              <img src="/images/pngwing.camion-1.webp"
                style={{ width: '194px', height: '93px', objectFit: 'contain' }}
                alt="camion" className="me-3" />
              <div className="text-start">
                <h6 style={{ color: '#23501E', fontWeight: 'bold', marginBottom: '12px' }}>{'>'} 24 horas</h6>
                <p style={{ color: '#23501E', margin: 4, lineHeight: '1.2' }}>a tu hogar <br /> o local</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-4">
              <img src="/images/pngwing.organico-1.webp"
                style={{ width: '214px', height: '167px', objectFit: 'contain' }}
                alt="organico" className="me-3" />
              <div className="text-start">
                <h6 style={{ color: '#23501E', fontWeight: 'bold', marginBottom: '4px' }}>+ 70</h6>
                <p style={{ color: '#23501E', margin: 0, lineHeight: '1.2' }}>productos orgánicos</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-4">
              <img src="/images/icono-conservante-simbolo-libre-quimicos-toxicos-producto-limpio-ilustracion-vectorial-eps-10-stock_.webp"
                style={{ width: '140px', height: '140px', objectFit: 'contain' }}
                alt="sin quimicos" className="me-3" />
              <div className="text-start">
                <h6 style={{ color: '#23501E', fontWeight: 'bold', marginBottom: '4px' }}>0%</h6>
                <p style={{ color: '#23501E', margin: 0, lineHeight: '1.2' }}>químicos</p>
              </div>
            </Col>
            <Col xs={12} sm={6} md={3} className="d-flex align-items-center justify-content-center mb-4">
              <img src="/images/imagen-vectorial-icono-terapia-puede-usarse-tdah_120816-359788-removebg-preview-1.webp"
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
                <img src="/images/image-9.webp"
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
                <img src="/images/image-_19_-1.webp"
                  style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                  alt="organico" className="flex-shrink-0" />
              </div>
              <div className="d-flex gap-3 flex-column flex-sm-row h-100">
                <div style={{ backgroundColor: '#2D5A27', borderRadius: '40px' }} className="p-4 w-100 d-flex align-items-center justify-content-between">
                  <div className="pe-2">
                    <h5 style={{ color: '#ffffff', margin: 0 }}>Apoyo al consumo local y responsable</h5>
                  </div>
                  <img src="/images/pngegg-consumo-1.webp"
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                    alt="organico" className="flex-shrink-0" />
                </div>
                <div style={{ backgroundColor: '#2D5A27', borderRadius: '40px' }} className="p-4 w-100 d-flex align-items-center justify-content-between">
                  <div className="pe-2">
                    <h5 style={{ color: '#ffffff', margin: 0 }}>Atención personalizada</h5>
                  </div>
                  <img src="/images/pngwing.atencion-1.webp"
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
          <Row className="align-items-center mb-4">
            <Col>
              <h2 style={{ color: '#23501E' }} className="fw-bold mb-0">Lo Mejor De CampOrganic</h2>
            </Col>
            <Col xs="auto">
              <Button as={Link} to="/productos" variant="outline-success" size="sm">
                Ver todos →
              </Button>
            </Col>
          </Row>
          <Row>
            {loadingDestacados
              ? [0, 1, 2].map(i => (
                  <Col key={i} xs={12} sm={6} md={4} className="mb-4">
                    <SkeletonCard />
                  </Col>
                ))
              : destacados.length === 0
                ? (
                  <Col className="text-center py-5">
                    <p className="text-muted">No hay productos disponibles en este momento.</p>
                    <Button as={Link} to="/productos" variant="success">Ver Productos</Button>
                  </Col>
                )
                : destacados.map(producto => (
                  <Col key={producto.id} xs={12} sm={6} md={4} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <div style={{ position: 'relative' }}>
                        <Card.Img
                          variant="top"
                          src={producto.imagen || '/images/placeholder.jpg'}
                          style={{ height: '200px', objectFit: 'cover' }}
                          onError={e => { e.target.src = '/images/placeholder.jpg' }}
                        />
                        {producto.stock === 0 && (
                          <Badge bg="danger" style={{ position: 'absolute', top: 8, right: 8 }}>
                            Sin stock
                          </Badge>
                        )}
                        {producto.stock > 0 && producto.stock <= 5 && (
                          <Badge bg="warning" text="dark" style={{ position: 'absolute', top: 8, right: 8 }}>
                            Últimas {producto.stock}
                          </Badge>
                        )}
                      </div>
                      <Card.Body className="d-flex flex-column">
                        <div className="mb-1">
                          <Badge bg="secondary" className="text-capitalize">{producto.categoria}</Badge>
                        </div>
                        <Card.Title className="mt-2">{producto.nombre}</Card.Title>
                        <Card.Text className="flex-grow-1 text-muted small">
                          {producto.descripcion}
                        </Card.Text>
                        <div className="mt-auto">
                          <h5 className="text-success">S/.{parseFloat(producto.precio).toFixed(2)}</h5>
                          <div className="d-flex gap-2">
                            <Button
                              as={Link}
                              to={`/producto/${producto.id}`}
                              variant="outline-success"
                              size="sm"
                              className="flex-grow-1"
                            >
                              Ver detalles
                            </Button>
                            {!isStaff && (
                              <Button
                                variant="success"
                                size="sm"
                                disabled={producto.stock === 0}
                                onClick={() => addToCart(producto)}
                              >
                                🛒
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
            }
          </Row>
        </Container>
      </section>
    </main>
  )
}

export default Home