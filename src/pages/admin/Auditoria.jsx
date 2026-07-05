import { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Table, Badge, Form, Button, Spinner } from "react-bootstrap";
import api from "../../services/api";
import Seo from "../../components/Seo";

const METODO_COLOR = { POST: "success", PUT: "primary", PATCH: "warning", DELETE: "danger" };

const fmtFecha = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "medium" });
};

function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filtros, setFiltros] = useState({ accion: "", entidad: "", usuario_id: "" });

  const limite = 50;

  const cargar = useCallback(async (off = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limite, offset: off });
      if (filtros.accion) params.set("accion", filtros.accion);
      if (filtros.entidad) params.set("entidad", filtros.entidad);
      if (filtros.usuario_id) params.set("usuario_id", filtros.usuario_id);
      const { data } = await api.get(`/auditoria?${params}`);
      setLogs(data.data);
      setTotal(data.total);
      setOffset(off);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => { cargar(0); }, [cargar]);

  const metodoDeAccion = (accion = "") => accion.split(" ")[0];
  const rutaDeAccion  = (accion = "") => accion.split(" ").slice(1).join(" ");

  return (
    <Container fluid className="py-4 px-4">
      <Seo path="/admin/auditoria" title="Auditoría del Sistema" noindex />
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold">Auditoría del Sistema</h1>
          <p className="text-muted mb-0">Registro de todas las acciones realizadas por usuarios</p>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Form.Label className="small fw-semibold">Filtrar por acción</Form.Label>
              <Form.Control
                size="sm"
                placeholder="ej. POST /productos"
                value={filtros.accion}
                onChange={e => setFiltros(f => ({ ...f, accion: e.target.value }))}
              />
            </Col>
            <Col md={3}>
              <Form.Label htmlFor="filtro-entidad" className="small fw-semibold">Entidad</Form.Label>
              <Form.Select id="filtro-entidad" size="sm" value={filtros.entidad} onChange={e => setFiltros(f => ({ ...f, entidad: e.target.value }))}>
                <option value="">Todas</option>
                {["productos","pedidos","usuarios","clientes","pagos","cupones","inventario","proveedores","categorias","marcas","facturas","valoraciones","auditoria"].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small fw-semibold">ID Usuario</Form.Label>
              <Form.Control
                size="sm"
                type="number"
                placeholder="ID"
                value={filtros.usuario_id}
                onChange={e => setFiltros(f => ({ ...f, usuario_id: e.target.value }))}
              />
            </Col>
            <Col md={2}>
              <Button size="sm" variant="success" className="w-100" onClick={() => cargar(0)}>
                Buscar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-bold mb-0">
            {loading ? "Cargando…" : `${total.toLocaleString()} registros`}
          </h2>
          <small className="text-muted">{offset + 1}–{Math.min(offset + limite, total)} de {total}</small>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0" style={{ fontSize: "0.8rem" }}>
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Acción</th>
                    <th>Entidad</th>
                    <th>ID</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4 text-muted">Sin registros</td></tr>
                  ) : logs.map(log => (
                    <tr key={log.id}>
                      <td className="text-nowrap">{fmtFecha(log.creado_en)}</td>
                      <td>
                        {log.usuario_nombre
                          ? <><strong>{log.usuario_nombre}</strong><br /><span className="text-muted">{log.usuario_email}</span></>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        {log.rol && <Badge bg={log.rol === "admin" ? "danger" : log.rol === "empleado" ? "warning" : "secondary"} text={log.rol === "empleado" ? "dark" : undefined} style={{ fontSize: "0.7rem" }}>{log.rol}</Badge>}
                      </td>
                      <td>
                        <Badge bg={METODO_COLOR[metodoDeAccion(log.accion)] || "secondary"} text={metodoDeAccion(log.accion) === "PATCH" ? "dark" : undefined} className="me-1" style={{ fontSize: "0.7rem" }}>
                          {metodoDeAccion(log.accion)}
                        </Badge>
                        <code style={{ fontSize: "0.75rem" }}>{rutaDeAccion(log.accion)}</code>
                      </td>
                      <td><Badge bg="light" text="dark" style={{ fontSize: "0.7rem" }}>{log.entidad || "—"}</Badge></td>
                      <td>{log.entidad_id ?? "—"}</td>
                      <td className="text-muted">{log.ip || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        {total > limite && (
          <Card.Footer className="bg-transparent border-0 d-flex gap-2 justify-content-center py-3">
            <Button size="sm" variant="outline-secondary" disabled={offset === 0} onClick={() => cargar(Math.max(0, offset - limite))}>
              ← Anterior
            </Button>
            <Button size="sm" variant="outline-secondary" disabled={offset + limite >= total} onClick={() => cargar(offset + limite)}>
              Siguiente →
            </Button>
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
}

export default Auditoria;
