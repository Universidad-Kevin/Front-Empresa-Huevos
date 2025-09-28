import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap'

function NavigationBar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <Navbar bg="success" variant="dark" expand="lg" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          🥚 Huevos Orgánicos
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

          <Nav>
            {user ? (
              <Dropdown>
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                  👋 {user.nombre}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/admin">
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/productos">
                    Productos
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/admin/estadisticas">
                    Estadísticas
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="btn btn-outline-light">
                Ingresar
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavigationBar