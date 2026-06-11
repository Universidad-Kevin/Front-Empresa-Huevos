import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Alert } from "react-bootstrap";
import { Link, useParams, useLocation } from "react-router-dom";
import api from "../../services/api";

const estadoVariant = {
  pendiente: "warning", confirmado: "info", preparando: "secondary",
  enviado: "primary", entregado: "success", cancelado: "danger", devuelto: "dark",
  procesando: "info", completado: "success",
};
const estadoLabel = {
  pendiente: "Pendiente", confirmado: "Confirmado", preparando: "En Preparación",
  enviado: "En Camino", entregado: "Entregado", cancelado: "Cancelado", devuelto: "Devuelto",
  procesando: "En Preparación", completado: "Entregado",
};
const metodoPagoLabel = { efectivo: "💵 Pago contra entrega", transferencia: "🏦 Transferencia bancaria", tarjeta: "💳 Tarjeta" };

export function ListaPedidosMayorista() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/mayorista/pedidos")
      .then(({ data }) => setPedidos(data.data))
      .catch(() => setError("No se pudieron cargar tus pedidos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Mis Pedidos</h2>
        <Button as={Link} to="/mayorista" variant="outline-secondary" size="sm">← Volver</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <p className="text-muted">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <Card className="shadow-sm text-center py-5">
          <Card.Body>
            <p className="text-muted mb-3">Aún no tienes pedidos registrados.</p>
            <p className="small text-muted">Cuando realices un pedido con nosotros, aparecerá aquí.</p>
          </Card.Body>
        </Card>
      ) : (
        pedidos.map(pedido => (
          <Card key={pedido.id} className="shadow-sm mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-1">Pedido #{pedido.id}</h6>
                  <small className="text-muted">
                    {new Date(pedido.creado_en).toLocaleDateString("es-PE", { dateStyle: "medium" })}
                    {" · "}{pedido.items?.length} producto(s)
                  </small>
                </div>
                <div className="text-end">
                  <div className="fw-bold text-success mb-1">S/.{parseFloat(pedido.total).toFixed(2)}</div>
                  <Badge bg={estadoVariant[pedido.estado]}>{estadoLabel[pedido.estado]}</Badge>
                </div>
              </div>
              <div className="mt-2">
                <Button as={Link} to={`/mayorista/pedidos/${pedido.id}`} size="sm" variant="outline-success">
                  Ver recibo
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export function DetallePedidoMayorista() {
  const { id } = useParams();
  const location = useLocation();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/mayorista/pedidos/${id}`)
      .then(({ data }) => setPedido(data.data))
      .catch(() => setError("No se pudo cargar el pedido."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Container className="py-5"><p className="text-muted">Cargando...</p></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!pedido) return null;

  const fecha = new Date(pedido.creado_en).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Container className="py-5">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .recibo-card { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <Button as={Link} to="/mayorista/pedidos" variant="outline-secondary" size="sm">← Mis pedidos</Button>
        <Button variant="outline-success" size="sm" onClick={() => window.print()}>
          🖨️ Imprimir / Guardar PDF
        </Button>
      </div>

      <Card className="shadow-sm recibo-card" style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ background: "#2D5A27", padding: "20px 28px", borderRadius: "7px 7px 0 0" }}
          className="d-flex justify-content-between align-items-center">
          <div>
            <h4 style={{ color: "#fff", margin: 0 }}>🌿 CampOrganic</h4>
            <small style={{ color: "#c8e6c9" }}>Portal Mayorista</small>
          </div>
          <div className="text-end">
            <h5 style={{ color: "#fff", margin: 0 }}>RECIBO #{pedido.id}</h5>
            <small style={{ color: "#c8e6c9" }}>{fecha}</small>
          </div>
        </div>

        <div style={{ background: "#f0f7f0", padding: "14px 28px", borderBottom: "1px solid #ddd" }}>
          <Row>
            <Col>
              <small className="text-muted">EMPRESA</small>
              <p className="mb-0 fw-bold">{pedido.nombre_empresa}</p>
              <small className="text-muted">{pedido.cliente_nombre} · {pedido.cliente_email}</small>
            </Col>
            <Col className="text-end">
              <small className="text-muted">ESTADO</small>
              <div>
                <Badge bg={estadoVariant[pedido.estado]} className="fs-6 px-3 py-1">
                  {estadoLabel[pedido.estado]}
                </Badge>
              </div>
            </Col>
          </Row>
        </div>

        <Card.Body className="px-4">
          <table className="table table-sm mb-0">
            <thead style={{ background: "#2D5A27" }}>
              <tr>
                <th style={{ color: "#fff", fontWeight: 500, fontSize: 12 }}>CÓD.</th>
                <th style={{ color: "#fff", fontWeight: 500, fontSize: 12 }}>PRODUCTO</th>
                <th style={{ color: "#fff", fontWeight: 500, fontSize: 12, textAlign: "center" }}>CANT.</th>
                <th style={{ color: "#fff", fontWeight: 500, fontSize: 12, textAlign: "right" }}>P. UNIT.</th>
                <th style={{ color: "#fff", fontWeight: 500, fontSize: 12, textAlign: "right" }}>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items?.map(item => (
                <tr key={item.id}>
                  <td className="font-monospace text-muted" style={{ fontSize: 12 }}>{item.codigo_producto || "—"}</td>
                  <td>{item.nombre_producto}</td>
                  <td className="text-center">{item.cantidad} <small className="text-muted">{item.unidad || "uds."}</small></td>
                  <td className="text-end">S/.{parseFloat(item.precio_unitario).toFixed(2)}</td>
                  <td className="text-end fw-bold">S/.{(item.cantidad * item.precio_unitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="text-end text-muted" style={{ fontSize: 13 }}>Envío:</td>
                <td className="text-end text-success" style={{ fontSize: 13 }}>Gratis</td>
              </tr>
              <tr style={{ borderTop: "2px solid #2D5A27" }}>
                <td colSpan={4} className="text-end fw-bold fs-5">TOTAL:</td>
                <td className="text-end fw-bold fs-5 text-success">S/.{parseFloat(pedido.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </Card.Body>

        <div style={{ padding: "0 28px 24px" }}>
          <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 6, padding: 16 }}>
            <p className="mb-0">
              <strong>Método de pago:</strong>{" "}
              {metodoPagoLabel[pedido.metodo_pago] || pedido.metodo_pago}
            </p>
          </div>
        </div>

        <div style={{ background: "#f0f0f0", padding: "12px 28px", borderRadius: "0 0 7px 7px", textAlign: "center" }}>
          <small className="text-muted">CampOrganic · Productos orgánicos frescos · camporganic@gmail.com</small>
        </div>
      </Card>
    </Container>
  );
}
