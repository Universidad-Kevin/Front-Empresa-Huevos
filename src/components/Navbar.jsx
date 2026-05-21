import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap'
import AuthModal from './AuthModal'
import CartOffcanvas from './CartOffcanvas'
import { useCart } from '../context/CartContext'

function NavigationBar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { itemCount, toggleCart } = useCart()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Navbar style={{ backgroundColor: '#F0F0F0' }} variant="light" expand="lg" className="shadow custom-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <img
            src="/images/LogoCampOrgan-1.webp"
            alt="LogoCampOrgan"
            className="img-fluid rounded shadow"
            style={{ width: '30px', height: '30px' }}
          />
          <span style={{ color: '#785740' }} variant='light'> Camp</span>Organic
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              active={location.pathname === '/'}
            >
              Inicio
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/productos"
              active={location.pathname === '/productos'}
            >
              Productos
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/nosotros"
              active={location.pathname === '/nosotros'}
            >
              Nosotros
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/contacto"
              active={location.pathname === '/contacto'}
            >
              Contacto
            </Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            <Nav.Link as="button" onClick={toggleCart} className="position-relative me-3 border-0 bg-transparent">
              <span className="fs-5">🛒</span>
              {itemCount > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.65em' }}
                >
                  {itemCount}
                </Badge>
              )}
            </Nav.Link>

            {user ? (
              <Dropdown>
                <Dropdown.Toggle variant="outline-dark" id="dropdown-basic">
                  👋 {user.nombre}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {user.rol === 'admin' ? (
                    <>
                      <Dropdown.Item as={Link} to="/admin">Dashboard</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/productos">Productos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/pedidos">Pedidos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/clientes">Clientes</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/estadisticas">Estadísticas</Dropdown.Item>
                    </>
                  ) : (
                    <>
                      <Dropdown.Item as={Link} to="/mi-perfil">Mi Perfil</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mis-pedidos">Mis Pedidos</Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as="button" onClick={() => setShowAuthModal(true)} className="btn btn-outline-2D5A27">
                Ingresar
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
      <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
      <CartOffcanvas onShowLogin={() => setShowAuthModal(true)} />
    </Navbar>
  )
}

export default NavigationBar