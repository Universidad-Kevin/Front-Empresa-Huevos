import { Offcanvas, Button, Badge, ListGroup } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function CartOffcanvas({ onShowLogin }) {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    cartTotal
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    if (!user) {
      onShowLogin();
    } else {
      navigate('/checkout');
    }
  };

  return (
    <Offcanvas show={isCartOpen} onHide={closeCart} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fw-bold">
          Mi Carrito <Badge bg="success" className="ms-2">{cartItems.length}</Badge>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column">
        {cartItems.length === 0 ? (
          <div className="text-center mt-5">
            <h5 className="text-muted">Tu carrito está vacío</h5>
            <p>¡Agrega algunos productos orgánicos!</p>
            <Button variant="outline-success" onClick={closeCart} className="mt-3">
              Seguir Comprando
            </Button>
          </div>
        ) : (
          <>
            <ListGroup variant="flush" className="flex-grow-1 overflow-auto mb-3">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.id} className="py-3 px-0 border-bottom">
                  <div className="d-flex align-items-center">
                    <img
                      src={item.imagen || "/images/placeholder.jpg"}
                      alt={item.nombre}
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      className="rounded me-3"
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0 text-truncate" style={{ maxWidth: '150px' }}>
                        {item.nombre}
                      </h6>
                      <small className="text-success fw-bold">${item.precio}</small>

                      <div className="d-flex align-items-center mt-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="px-2 py-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="mx-2 small">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="px-2 py-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="ms-2 text-end">
                      <div className="fw-bold mb-2">
                        ${(item.precio * item.quantity).toFixed(2)}
                      </div>
                      <Button
                        variant="link"
                        className="text-danger p-0 text-decoration-none small"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="border-top pt-3 mt-auto">
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold fs-5">Total:</span>
                <span className="fw-bold fs-5 text-success">${cartTotal.toFixed(2)}</span>
              </div>
              <Button
                variant="success"
                size="lg"
                className="w-100 fw-bold shadow-sm"
                onClick={handleCheckout}
              >
                Comprar
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default CartOffcanvas;
