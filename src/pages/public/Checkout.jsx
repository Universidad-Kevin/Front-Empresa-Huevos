import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form, Badge, InputGroup } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const METODOS_PAGO = [
  {
    id: 'efectivo',
    label: 'Pago contra entrega',
    descripcion: 'Paga en efectivo cuando recibas tu pedido.',
    icono: '💵',
    requiereVoucher: false,
  },
  {
    id: 'yape',
    label: 'Yape',
    descripcion: 'Yapea al número registrado y sube tu comprobante.',
    icono: '📱',
    requiereVoucher: true,
  },
  {
    id: 'plin',
    label: 'Plin',
    descripcion: 'Paga con Plin y sube tu comprobante.',
    icono: '💜',
    requiereVoucher: true,
  },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    descripcion: 'Transfiere a nuestra cuenta BCP y sube el comprobante.',
    icono: '🏦',
    requiereVoucher: true,
  },
  {
    id: 'tarjeta',
    label: 'Tarjeta de crédito / débito',
    descripcion: 'Un asesor te contactará para procesar el cobro.',
    icono: '💳',
    requiereVoucher: false,
  },
];

const INFO_PAGO = {
  yape: {
    titulo: 'Datos para Yape',
    lineas: ['📱 Número: 999-999-999', '👤 Titular: CampOrganic'],
  },
  plin: {
    titulo: 'Datos para Plin',
    lineas: ['📱 Número: 999-999-999', '👤 Titular: CampOrganic'],
  },
  transferencia: {
    titulo: 'Datos bancarios (BCP)',
    lineas: ['🏦 Banco: BCP', '💳 Cuenta corriente: 000-000000000-0-00', '👤 Titular: CampOrganic SAC', '⏰ Tienes 48h para transferir'],
  },
};

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);

  // Cupón
  const [cuponCodigo, setCuponCodigo] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null); // { codigo, descripcion, descuento }
  const [cuponError, setCuponError] = useState('');
  const [cuponLoading, setCuponLoading] = useState(false);

  // Comprobante de pago
  const [tipoComprobante, setTipoComprobante] = useState('boleta');
  const [compNombre, setCompNombre] = useState('');
  const [compDocumento, setCompDocumento] = useState('');
  const [compRazonSocial, setCompRazonSocial] = useState('');
  const [compRuc, setCompRuc] = useState('');
  const [compDireccion, setCompDireccion] = useState('');

  useEffect(() => {
    if (!user) navigate('/');
    else if (user.rol === 'admin' || user.rol === 'mayorista') navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (user) setCompNombre(user.nombre || '');
  }, [user]);

  useEffect(() => {
    setVoucherFile(null);
    setVoucherPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }, [metodoPago]);

  if (!user || user.rol === 'admin' || user.rol === 'mayorista') return null;

  const metodoActual = METODOS_PAGO.find(m => m.id === metodoPago);
  const totalConDescuento = Math.max(0, cartTotal - (cuponAplicado?.descuento || 0));

  const aplicarCupon = async () => {
    if (!cuponCodigo.trim()) return;
    setCuponLoading(true);
    setCuponError('');
    setCuponAplicado(null);
    try {
      const { data } = await api.get(`/cupones/validar?codigo=${encodeURIComponent(cuponCodigo.trim())}&total=${cartTotal}`);
      setCuponAplicado(data.data);
    } catch (err) {
      setCuponError(err.response?.data?.error || 'Cupón no válido');
    } finally {
      setCuponLoading(false);
    }
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCuponCodigo('');
    setCuponError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setVoucherFile(null); setVoucherPreview(null); return; }
    if (file.size > 5 * 1024 * 1024) {
      setError('El comprobante no debe superar 5 MB.');
      e.target.value = '';
      return;
    }
    setVoucherFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setVoucherPreview(ev.target.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const leerBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleConfirmar = async () => {
    if (cartItems.length === 0) return;
    if (metodoActual?.requiereVoucher && !voucherFile) {
      setError('Debes adjuntar el comprobante de pago antes de confirmar el pedido.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const items = cartItems.map(item => ({
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.precio,
        nombre_producto: item.nombre,
      }));

      const { data } = await api.post('/pedidos', {
        items,
        metodo_pago: metodoPago,
        cupon_codigo: cuponAplicado?.codigo || undefined,
      });
      const pedidoId = data.data.id;

      // Registrar voucher en /pagos (obligatorio para yape/plin/transferencia)
      if (metodoActual.requiereVoucher) {
        const base64 = await leerBase64(voucherFile);
        await api.post('/pagos', { pedido_id: pedidoId, voucher: base64 });
      }

      // Generar comprobante
      try {
        const facturaPayload = tipoComprobante === 'factura'
          ? { pedido_id: pedidoId, tipo: 'factura', tipo_documento: 'ruc', nombre_razon_social: compRazonSocial, documento: compRuc, direccion: compDireccion }
          : { pedido_id: pedidoId, tipo: 'boleta', tipo_documento: 'dni', nombre_razon_social: compNombre || user.nombre, documento: compDocumento };
        await api.post('/facturas', facturaPayload);
      } catch {
        // El comprobante es opcional; no bloquea el flujo
      }

      clearCart();
      navigate(`/mis-pedidos/${pedidoId}`, { state: { pedido: data.data, nuevo: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Finalizar Compra</h1>
          <p className="text-muted">Hola {user.nombre}, revisa tu pedido y elige cómo pagar.</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {/* Columna izquierda */}
        <Col lg={8} className="mb-4">
          {/* Productos */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Tus Productos</h5>
            </Card.Header>
            <Card.Body>
              {cartItems.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No tienes productos para comprar.</p>
                  <Button as={Link} to="/productos" variant="success">Volver a Productos</Button>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img
                      src={item.imagen || "/images/placeholder.jpg"}
                      alt={item.nombre}
                      style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                      className="rounded me-3"
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{item.nombre}</h6>
                      <small className="text-muted">{item.quantity} × S/.{parseFloat(item.precio).toFixed(2)}</small>
                    </div>
                    <div className="fw-bold text-success">
                      S/.{(item.precio * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </Card.Body>
          </Card>

          {/* Métodos de pago */}
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Método de Pago</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-2">
                {METODOS_PAGO.map(metodo => (
                  <Col key={metodo.id} md={4} xs={6}>
                    <div
                      onClick={() => setMetodoPago(metodo.id)}
                      className="p-3 rounded border h-100"
                      style={{
                        cursor: 'pointer',
                        borderColor: metodoPago === metodo.id ? '#2D5A27' : '#dee2e6',
                        borderWidth: metodoPago === metodo.id ? '2px' : '1px',
                        backgroundColor: metodoPago === metodo.id ? '#f0f9f0' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div className="d-flex align-items-center mb-1">
                        <Form.Check
                          type="radio"
                          checked={metodoPago === metodo.id}
                          onChange={() => setMetodoPago(metodo.id)}
                          className="me-2"
                          readOnly
                        />
                        <span className="fs-5 me-1">{metodo.icono}</span>
                        <span className="fw-bold" style={{ fontSize: '0.8rem' }}>{metodo.label}</span>
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{metodo.descripcion}</small>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Info de pago según método */}
              {INFO_PAGO[metodoPago] && (
                <Alert variant="info" className="mt-3 mb-0">
                  <strong>{INFO_PAGO[metodoPago].titulo}</strong>
                  <ul className="mb-0 mt-1">
                    {INFO_PAGO[metodoPago].lineas.map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </Alert>
              )}

              {metodoPago === 'tarjeta' && (
                <Alert variant="warning" className="mt-3 mb-0">
                  Un asesor se pondrá en contacto contigo para procesar el pago con tarjeta de forma segura.
                </Alert>
              )}

              {/* Subir comprobante */}
              {metodoActual?.requiereVoucher && (
                <div className="mt-3 p-3 rounded border" style={{ borderColor: '#dee2e6' }}>
                  <p className="mb-2 fw-bold small">
                    📎 Comprobante de pago <span className="text-danger">*</span>
                    <span className="text-muted fw-normal ms-1">(obligatorio para confirmar el pedido)</span>
                  </p>
                  <Form.Control
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    size="sm"
                  />
                  {voucherPreview && (
                    <div className="mt-2">
                      <img
                        src={voucherPreview}
                        alt="Vista previa del comprobante"
                        style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }}
                      />
                      <div>
                        <small className="text-success">✓ {voucherFile?.name}</small>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
          {/* Comprobante de pago */}
          <Card className="shadow-sm mt-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Comprobante de Pago</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-3 mb-3">
                {['boleta', 'factura'].map(t => (
                  <div
                    key={t}
                    onClick={() => setTipoComprobante(t)}
                    className="p-3 rounded border flex-fill"
                    style={{
                      cursor: 'pointer',
                      borderColor: tipoComprobante === t ? '#2D5A27' : '#dee2e6',
                      borderWidth: tipoComprobante === t ? '2px' : '1px',
                      backgroundColor: tipoComprobante === t ? '#f0f9f0' : 'white',
                    }}
                  >
                    <Form.Check
                      type="radio"
                      checked={tipoComprobante === t}
                      onChange={() => setTipoComprobante(t)}
                      label={<span className="fw-bold">{t === 'boleta' ? '🧾 Boleta de Venta' : '📄 Factura'}</span>}
                    />
                    <small className="text-muted ms-4">
                      {t === 'boleta' ? 'Para personas naturales' : 'Requiere RUC de empresa'}
                    </small>
                  </div>
                ))}
              </div>

              {tipoComprobante === 'boleta' ? (
                <Row className="g-2">
                  <Col md={7}>
                    <Form.Label className="small mb-1">Nombre completo</Form.Label>
                    <Form.Control
                      size="sm"
                      value={compNombre}
                      onChange={e => setCompNombre(e.target.value)}
                      placeholder="Como aparece en tu DNI"
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Label className="small mb-1">DNI <span className="text-muted">(opcional)</span></Form.Label>
                    <Form.Control
                      size="sm"
                      value={compDocumento}
                      onChange={e => setCompDocumento(e.target.value)}
                      placeholder="12345678"
                      maxLength={8}
                    />
                  </Col>
                </Row>
              ) : (
                <Row className="g-2">
                  <Col md={7}>
                    <Form.Label className="small mb-1">Razón social *</Form.Label>
                    <Form.Control
                      size="sm"
                      value={compRazonSocial}
                      onChange={e => setCompRazonSocial(e.target.value)}
                      placeholder="Empresa S.A.C."
                      required
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Label className="small mb-1">RUC *</Form.Label>
                    <Form.Control
                      size="sm"
                      value={compRuc}
                      onChange={e => setCompRuc(e.target.value.replace(/\D/g, ''))}
                      placeholder="20123456789"
                      maxLength={11}
                      required
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Label className="small mb-1">Dirección fiscal <span className="text-muted">(opcional)</span></Form.Label>
                    <Form.Control
                      size="sm"
                      value={compDireccion}
                      onChange={e => setCompDireccion(e.target.value)}
                      placeholder="Av. Principal 123, Lima"
                    />
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Resumen */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>S/.{cartTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Envío</span>
                <span className="text-success">Gratis</span>
              </div>

              {/* Cupón de descuento */}
              {!cuponAplicado ? (
                <div className="mb-3">
                  <Form.Label className="small mb-1 fw-bold">🏷️ ¿Tienes un cupón?</Form.Label>
                  <InputGroup size="sm">
                    <Form.Control
                      placeholder="Código de cupón"
                      value={cuponCodigo}
                      onChange={e => { setCuponCodigo(e.target.value.toUpperCase()); setCuponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && aplicarCupon()}
                      disabled={cuponLoading}
                    />
                    <Button
                      variant="outline-success"
                      onClick={aplicarCupon}
                      disabled={cuponLoading || !cuponCodigo.trim()}
                    >
                      {cuponLoading ? <Spinner size="sm" /> : 'Aplicar'}
                    </Button>
                  </InputGroup>
                  {cuponError && <small className="text-danger">{cuponError}</small>}
                </div>
              ) : (
                <div className="mb-3 p-2 rounded" style={{ background: '#f0f9f0', border: '1px solid #2D5A27' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <small className="fw-bold text-success">✓ Cupón aplicado</small>
                      <div className="fw-bold font-monospace">{cuponAplicado.codigo}</div>
                      {cuponAplicado.descripcion && <small className="text-muted">{cuponAplicado.descripcion}</small>}
                    </div>
                    <Button size="sm" variant="link" className="text-danger p-0" onClick={quitarCupon}>✕</Button>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-success">Descuento</small>
                    <small className="text-success fw-bold">-S/.{cuponAplicado.descuento.toFixed(2)}</small>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between mb-3">
                <span>Método de pago</span>
                <Badge bg="secondary">{metodoActual?.icono} {metodoActual?.label}</Badge>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total</span>
                <div className="text-end">
                  {cuponAplicado && (
                    <div className="text-muted text-decoration-line-through small">S/.{cartTotal.toFixed(2)}</div>
                  )}
                  <span className="fw-bold fs-5 text-success">S/.{totalConDescuento.toFixed(2)}</span>
                </div>
              </div>

              <Button
                variant="success"
                size="lg"
                className="w-100"
                onClick={handleConfirmar}
                disabled={cartItems.length === 0 || loading || (metodoActual?.requiereVoucher && !voucherFile)}
              >
                {loading
                  ? <><Spinner size="sm" className="me-2" />Procesando...</>
                  : 'Confirmar Pedido'}
              </Button>
              <p className="text-muted text-center mt-2 small">
                Al confirmar aceptas nuestros términos y condiciones.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;
