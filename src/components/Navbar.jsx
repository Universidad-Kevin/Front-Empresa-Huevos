import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap'
import AuthModal from './AuthModal'
import CartOffcanvas from './CartOffcanvas'
import { useCart } from '../context/CartContext'
import { useNotificaciones } from '../hooks/useNotificaciones'
import api from '../services/api'

function NavigationBar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [navExpanded, setNavExpanded] = useState(false)
  const { itemCount, toggleCart } = useCart()
  const [pedidosPendientes, setPedidosPendientes] = useState(0)
  const intervalRef = useRef(null)
  const { noLeidas, recientes, fetchRecientes, marcarLeida, marcarTodasLeidas, esCliente } = useNotificaciones(user)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  useEffect(() => {
    if (!['admin', 'empleado'].includes(user?.rol)) {
      setPedidosPendientes(0)
      return
    }

    const fetchPendientes = async () => {
      try {
        const { data } = await api.get('/pedidos/pendientes/count')
        setPedidosPendientes(data.data?.total ?? 0)
      } catch {
        // silencioso
      }
    }

    fetchPendientes()
    intervalRef.current = setInterval(fetchPendientes, 30000)
    return () => clearInterval(intervalRef.current)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const openLogin = () => {
    setNavExpanded(false)
    setShowAuthModal(true)
  }

  return (
    <Navbar
      style={{ backgroundColor: '#F0F0F0' }}
      variant="light"
      expand="lg"
      className="shadow custom-navbar"
      expanded={navExpanded}
      onToggle={setNavExpanded}
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold" onClick={() => setNavExpanded(false)}>
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
            <Nav.Link as={Link} to="/" active={location.pathname === '/'} onClick={() => setNavExpanded(false)}>
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/productos" active={location.pathname === '/productos'} onClick={() => setNavExpanded(false)}>
              Productos
            </Nav.Link>
            <Nav.Link as={Link} to="/nosotros" active={location.pathname === '/nosotros'} onClick={() => setNavExpanded(false)}>
              Nosotros
            </Nav.Link>
            <Nav.Link as={Link} to="/contacto" active={location.pathname === '/contacto'} onClick={() => setNavExpanded(false)}>
              Contacto
            </Nav.Link>
          </Nav>

          <Nav className="align-items-center">
            {!['admin', 'empleado', 'mayorista'].includes(user?.rol) && (
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
            )}

            {esCliente && (
              <Dropdown
                show={showNotifDropdown}
                onToggle={(open) => { setShowNotifDropdown(open); if (open) fetchRecientes(); }}
                className="me-2"
              >
                <Dropdown.Toggle
                  as="button"
                  className="position-relative border-0 bg-transparent nav-link"
                  style={{ fontSize: '1.3rem', lineHeight: 1 }}
                >
                  🔔
                  {noLeidas > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.65em' }}
                    >
                      {noLeidas > 9 ? '9+' : noLeidas}
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu align="end" style={{ width: 320, maxHeight: 420, overflowY: 'auto' }}>
                  <div className="px-3 py-2 d-flex justify-content-between align-items-center border-bottom">
                    <strong className="small">Notificaciones</strong>
                    {noLeidas > 0 && (
                      <button
                        className="btn btn-link btn-sm p-0 text-decoration-none small"
                        onClick={marcarTodasLeidas}
                      >
                        Marcar todas leídas
                      </button>
                    )}
                  </div>
                  {recientes.length === 0 ? (
                    <div className="px-3 py-4 text-center text-muted small">Sin notificaciones</div>
                  ) : (
                    recientes.map(n => (
                      <div
                        key={n.id}
                        className={`px-3 py-2 border-bottom d-flex gap-2 align-items-start${!n.leida ? ' bg-light' : ''}`}
                        style={{ cursor: !n.leida ? 'pointer' : 'default', fontSize: '0.85rem' }}
                        onClick={() => !n.leida && marcarLeida(n.id)}
                      >
                        <span style={{ fontSize: '1rem' }}>
                          {{ pedido_nuevo:'📦', pedido_confirmado:'✅', pedido_preparando:'📋', pedido_enviado:'🚚', pedido_entregado:'🎉', pedido_cancelado:'❌', pedido_devuelto:'↩️', pago_verificado:'💳', pago_rechazado:'⚠️' }[n.tipo] || '🔔'}
                        </span>
                        <div className="flex-grow-1">
                          <div className={n.leida ? 'text-muted' : 'fw-bold'}>{n.titulo}</div>
                          {n.mensaje && <div className="text-secondary small">{n.mensaje}</div>}
                        </div>
                        {!n.leida && <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#0d6efd', marginTop: 4, flexShrink: 0 }} />}
                      </div>
                    ))
                  )}
                  <Dropdown.Item as={Link} to="/mis-notificaciones" className="text-center small py-2">
                    Ver todas las notificaciones →
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {user ? (
              <Dropdown>
                <Dropdown.Toggle variant="outline-dark" id="dropdown-basic" className="position-relative">
                  👋 <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>{user.nombre}</span>
                  {['admin','empleado'].includes(user.rol) && pedidosPendientes > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute top-0 start-100 translate-middle"
                      style={{ fontSize: '0.65em' }}
                    >
                      {pedidosPendientes}
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {user.rol === 'admin' ? (
                    <>
                      <Dropdown.Item as={Link} to="/admin">Dashboard</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/productos">Productos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/pedidos">
                        Pedidos
                        {pedidosPendientes > 0 && <Badge bg="danger" pill className="ms-2">{pedidosPendientes}</Badge>}
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/inventario">Inventario</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/pagos">Pagos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/facturas">Comprobantes</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/clientes">Clientes</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/usuarios">Usuarios Web</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/estadisticas">Estadísticas</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/cupones">Cupones</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/proveedores">Proveedores</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/auditoria">Auditoría</Dropdown.Item>
                    </>
                  ) : user.rol === 'empleado' ? (
                    <>
                      <Dropdown.Item as={Link} to="/admin">Dashboard</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/productos">Productos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/pedidos">
                        Pedidos
                        {pedidosPendientes > 0 && <Badge bg="danger" pill className="ms-2">{pedidosPendientes}</Badge>}
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/inventario">Inventario</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/pagos">Pagos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/facturas">Comprobantes</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/proveedores">Proveedores</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/marcas">Marcas</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/categorias">Categorías</Dropdown.Item>
                    </>
                  ) : user.rol === 'mayorista' ? (
                    <>
                      <Dropdown.Item as={Link} to="/mayorista">Mi Portal</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mayorista/pedidos">Mis Pedidos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mayorista/perfil">Mi Empresa</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mayorista/contacto">Contactar</Dropdown.Item>
                    </>
                  ) : (
                    <>
                      <Dropdown.Item as={Link} to="/mi-perfil">Mi Perfil</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mis-pedidos">Mis Pedidos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mis-favoritos">❤️ Mis Favoritos</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/mis-notificaciones">
                        🔔 Notificaciones{noLeidas > 0 && <Badge bg="danger" pill className="ms-2">{noLeidas}</Badge>}
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as="button" onClick={openLogin} className="btn btn-outline-2D5A27">
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