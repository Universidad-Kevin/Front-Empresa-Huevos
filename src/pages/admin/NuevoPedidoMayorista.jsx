import { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Form, Button, Alert,
  Table, Badge, InputGroup, Spinner,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Seo from "../../components/Seo";

const METODOS_PAGO = [
  { id: "efectivo", label: "💵 Pago contra entrega" },
  { id: "transferencia", label: "🏦 Transferencia bancaria" },
  { id: "tarjeta", label: "💳 Tarjeta" },
];

function NuevoPedidoMayorista() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [nota, setNota] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/clientes/${id}`),
      api.get("/productos/activos"),
    ])
      .then(([cRes, pRes]) => {
        setCliente(cRes.data.data);
        setProductos(pRes.data.data);
      })
      .catch(() => setError("Error cargando datos"))
      .finally(() => setLoading(false));
  }, [id]);

  const productosFiltrados = productos.filter(p =>
    !items.find(i => i.producto_id === p.id) &&
    (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.codigo || "").toLowerCase().includes(busqueda.toLowerCase()))
  );

  const agregarProducto = (producto) => {
    setItems(prev => [...prev, {
      producto_id: producto.id,
      nombre_producto: producto.nombre,
      cantidad: 1,
      precio_unitario: parseFloat(producto.precio),
      stock: producto.stock,
      unidad: producto.unidad || "uds.",
      codigo: producto.codigo || "",
    }]);
    setBusqueda("");
  };

  const actualizarCantidad = (producto_id, valor) => {
    const n = parseInt(valor);
    setItems(prev => prev.map(i =>
      i.producto_id === producto_id
        ? { ...i, cantidad: isNaN(n) || n < 1 ? 1 : Math.min(n, i.stock) }
        : i
    ));
  };

  const actualizarPrecio = (producto_id, valor) => {
    setItems(prev => prev.map(i =>
      i.producto_id === producto_id
        ? { ...i, precio_unitario: parseFloat(valor) || 0 }
        : i
    ));
  };

  const quitarItem = (producto_id) => {
    setItems(prev => prev.filter(i => i.producto_id !== producto_id));
  };

  const total = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { setError("Agrega al menos un producto"); return; }
    setSubmitting(true);
    setError("");
    try {
      await api.post("/mayorista/pedidos", {
        cliente_id: parseInt(id),
        items,
        metodo_pago: metodoPago,
        nota: nota.trim() || null,
      });
      navigate(`/admin/editar-cliente/${id}`, {
        state: { successMsg: "Pedido mayorista creado exitosamente" },
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Container className="py-5 text-center">
      <Spinner animation="border" variant="success" />
    </Container>
  );

  return (
    <Container className="py-4">
      <Seo path="/admin/nuevo-pedido-mayorista" title="Nuevo Pedido Mayorista" noindex />
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fw-bold">Nuevo Pedido Mayorista</h1>
              <p className="text-muted mb-0">
                {cliente?.nombre_empresa} · {cliente?.contacto_nombre}
              </p>
            </div>
            <Link to={`/admin/editar-cliente/${id}`} className="btn btn-outline-secondary">
              ← Volver al cliente
            </Link>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Columna izquierda — buscador + lista de pedido */}
          <Col lg={7} className="mb-4">
            <Card className="shadow-sm mb-3">
              <Card.Header className="bg-white fw-bold">Agregar productos</Card.Header>
              <Card.Body>
                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Buscar por nombre o código SKU..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    autoFocus
                  />
                </InputGroup>

                {busqueda && (
                  <div className="border rounded" style={{ maxHeight: 260, overflowY: "auto" }}>
                    {productosFiltrados.length === 0 ? (
                      <p className="text-muted text-center py-3 mb-0 small">Sin resultados</p>
                    ) : productosFiltrados.map(p => (
                      <div
                        key={p.id}
                        className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
                        style={{ cursor: "pointer" }}
                        onClick={() => agregarProducto(p)}
                      >
                        <div>
                          <span className="fw-bold">{p.nombre}</span>
                          {p.codigo && (
                            <Badge bg="light" text="dark" className="ms-2 font-monospace">{p.codigo}</Badge>
                          )}
                          <div className="text-muted small">Stock: {p.stock} {p.unidad || "uds."}</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold text-success">S/.{parseFloat(p.precio).toFixed(2)}</div>
                          <Button size="sm" variant="outline-success" className="mt-1">+ Agregar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Header className="bg-white fw-bold d-flex justify-content-between">
                <span>Productos del pedido</span>
                <Badge bg="success">{items.length} ítem(s)</Badge>
              </Card.Header>
              <Card.Body className="p-0">
                {items.length === 0 ? (
                  <p className="text-muted text-center py-4 mb-0">
                    Usa el buscador para agregar productos
                  </p>
                ) : (
                  <Table className="mb-0" size="sm" responsive>
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th style={{ width: 90 }}>Cant.</th>
                        <th style={{ width: 110 }}>P. Unit. (S/.)</th>
                        <th className="text-end" style={{ width: 90 }}>Subtotal</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.producto_id}>
                          <td>
                            <div className="fw-bold small">{item.nombre_producto}</div>
                            {item.codigo && (
                              <code className="text-muted" style={{ fontSize: 11 }}>{item.codigo}</code>
                            )}
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              min={1}
                              max={item.stock}
                              value={item.cantidad}
                              onChange={e => actualizarCantidad(item.producto_id, e.target.value)}
                              style={{ width: 70 }}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              size="sm"
                              min={0}
                              step="0.01"
                              value={item.precio_unitario}
                              onChange={e => actualizarPrecio(item.producto_id, e.target.value)}
                              style={{ width: 90 }}
                            />
                          </td>
                          <td className="text-end fw-bold">
                            S/.{(item.cantidad * item.precio_unitario).toFixed(2)}
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => quitarItem(item.producto_id)}
                            >
                              ×
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Columna derecha — resumen + opciones */}
          <Col lg={5} className="mb-4">
            <Card className="shadow-sm mb-3">
              <Card.Header className="bg-white fw-bold">Resumen del pedido</Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2 text-muted small">
                  <span>Subtotal</span>
                  <span>S/.{total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-muted small">
                  <span>Envío</span>
                  <span className="text-success">Gratis</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span className="text-success">S/.{total.toFixed(2)}</span>
                </div>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-3">
              <Card.Header className="bg-white fw-bold">Método de pago</Card.Header>
              <Card.Body>
                {METODOS_PAGO.map(m => (
                  <Form.Check
                    key={m.id}
                    type="radio"
                    id={`pago-${m.id}`}
                    label={m.label}
                    name="metodoPago"
                    value={m.id}
                    checked={metodoPago === m.id}
                    onChange={() => setMetodoPago(m.id)}
                    className="mb-2"
                  />
                ))}
              </Card.Body>
            </Card>

            <Card className="shadow-sm mb-3">
              <Card.Header className="bg-white fw-bold">Nota interna (opcional)</Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ej: Entrega el martes, llamar antes..."
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                />
              </Card.Body>
            </Card>

            <div className="d-grid gap-2">
              <Button
                type="submit"
                variant="success"
                size="lg"
                disabled={submitting || items.length === 0}
              >
                {submitting
                  ? <><Spinner animation="border" size="sm" className="me-2" />Creando pedido...</>
                  : `Confirmar pedido · S/.${total.toFixed(2)}`}
              </Button>
              <Link to={`/admin/editar-cliente/${id}`} className="btn btn-outline-secondary">
                Cancelar
              </Link>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default NuevoPedidoMayorista;
