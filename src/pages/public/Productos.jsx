import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Container, Row, Col, Card, Button, Form,
  InputGroup, Alert, Badge,
} from "react-bootstrap";
import PaginacionVentana from "../../components/PaginacionVentana";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useFavoritos } from "../../hooks/useFavoritos";
import { SkeletonProductGrid } from "../../components/SkeletonLoader";
import Seo from "../../components/Seo";

const POR_PAGINA = 8;

function Productos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, isStaff } = useCart();
  const { user } = useAuth();
  const { isFav, toggle: toggleFav, esCliente } = useFavoritos(user);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [orden, setOrden] = useState("reciente");
  const [pagina, setPagina] = useState(1);

  const [categoriasApi, setCategoriasApi] = useState([]);

  useEffect(() => {
    api.get("/productos/activos")
      .then(({ data }) => {
        if (data?.success && Array.isArray(data.data)) setProductos(data.data);
        else if (Array.isArray(data)) setProductos(data);
        else setError("Respuesta inesperada del servidor");
      })
      .catch(() => setError("Error al cargar los productos. Verifica que el backend esté corriendo."))
      .finally(() => setLoading(false));
    api.get("/categorias").then(({ data }) => setCategoriasApi(data.data || [])).catch(() => {});
  }, []);

  // Categorías para el filtro: preferir API, fallback a derivar de productos
  const categorias = useMemo(() => {
    if (categoriasApi.length > 0) return categoriasApi.map(c => c.nombre);
    return [...new Set(productos.map(p => p.categoria).filter(Boolean))];
  }, [categoriasApi, productos]);

  // Rango de precios real
  const precios = useMemo(() => productos.map(p => parseFloat(p.precio)), [productos]);
  const precioRealMin = precios.length ? Math.min(...precios) : 0;
  const precioRealMax = precios.length ? Math.max(...precios) : 9999;

  const productosFiltrados = useMemo(() => {
    let lista = [...productos];

    if (busqueda) lista = lista.filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()));
    if (categoria) lista = lista.filter(p => p.categoria === categoria);
    if (soloDisponibles) lista = lista.filter(p => p.stock > 0);
    if (precioMin !== "") lista = lista.filter(p => parseFloat(p.precio) >= parseFloat(precioMin));
    if (precioMax !== "") lista = lista.filter(p => parseFloat(p.precio) <= parseFloat(precioMax));

    switch (orden) {
      case "precio_asc":  lista.sort((a, b) => a.precio - b.precio); break;
      case "precio_desc": lista.sort((a, b) => b.precio - a.precio); break;
      case "nombre_asc":  lista.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case "nombre_desc": lista.sort((a, b) => b.nombre.localeCompare(a.nombre)); break;
      default: break; // reciente: ya viene ordenado del backend
    }

    return lista;
  }, [productos, busqueda, categoria, soloDisponibles, precioMin, precioMax, orden]);

  const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA);
  const paginaActual = Math.min(pagina, totalPaginas || 1);
  const productosPagina = productosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  // Resetear página al cambiar filtros
  useEffect(() => { setPagina(1); }, [busqueda, categoria, soloDisponibles, precioMin, precioMax, orden]);

  const limpiarFiltros = () => {
    setBusqueda(""); setCategoria(""); setSoloDisponibles(false);
    setPrecioMin(""); setPrecioMax(""); setOrden("reciente"); setPagina(1);
  };

  const hayFiltrosActivos = busqueda || categoria || soloDisponibles || precioMin !== "" || precioMax !== "" || orden !== "reciente";

  if (loading) return (
    <>
      <Container className="py-5">
        <Row className="mb-3">
          <Col>
            <h1 className="fw-bold">Nuestros Productos</h1>
            <p className="text-muted">Descubre nuestra variedad de huevos orgánicos</p>
          </Col>
        </Row>
        <Card className="shadow-sm mb-4" style={{ height: 80 }} />
      </Container>
      <SkeletonProductGrid count={8} />
    </>
  );

  return (
    <>
      <Seo path="/productos" />
      <Container className="py-5">
        <Row className="mb-3">
          <Col>
            <h1 className="fw-bold">Nuestros Productos</h1>
            <p className="text-muted">Descubre nuestra variedad de huevos orgánicos</p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger">
            {error}
            <Button variant="outline-danger" size="sm" className="ms-3" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Barra de filtros */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3 align-items-end">
              {/* Búsqueda */}
              <Col md={4}>
                <Form.Label className="small fw-bold text-muted">BUSCAR</Form.Label>
                <InputGroup>
                  <InputGroup.Text>🔍</InputGroup.Text>
                  <Form.Control
                    placeholder="Nombre del producto..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                </InputGroup>
              </Col>

              {/* Categoría */}
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">CATEGORÍA</Form.Label>
                <Form.Select value={categoria} onChange={e => setCategoria(e.target.value)}>
                  <option value="">Todas</option>
                  {categorias.map(c => (
                    <option key={c} value={c} className="text-capitalize">{c}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Precio mín */}
              <Col xs={6} md={1}>
                <Form.Label className="small fw-bold text-muted">PRECIO MÍN</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={`S/.${precioRealMin}`}
                  value={precioMin}
                  onChange={e => setPrecioMin(e.target.value)}
                  min={0}
                />
              </Col>

              {/* Precio máx */}
              <Col xs={6} md={1}>
                <Form.Label className="small fw-bold text-muted">PRECIO MÁX</Form.Label>
                <Form.Control
                  type="number"
                  placeholder={`S/.${precioRealMax}`}
                  value={precioMax}
                  onChange={e => setPrecioMax(e.target.value)}
                  min={0}
                />
              </Col>

              {/* Ordenar */}
              <Col md={2}>
                <Form.Label className="small fw-bold text-muted">ORDENAR POR</Form.Label>
                <Form.Select value={orden} onChange={e => setOrden(e.target.value)}>
                  <option value="reciente">Más recientes</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                  <option value="nombre_asc">Nombre: A → Z</option>
                  <option value="nombre_desc">Nombre: Z → A</option>
                </Form.Select>
              </Col>

              {/* Disponibilidad + limpiar */}
              <Col md={2} className="d-flex flex-column gap-2">
                <Form.Check
                  type="switch"
                  id="solo-disponibles"
                  label="Solo con stock"
                  checked={soloDisponibles}
                  onChange={e => setSoloDisponibles(e.target.checked)}
                />
                {hayFiltrosActivos && (
                  <Button variant="outline-secondary" size="sm" onClick={limpiarFiltros}>
                    Limpiar filtros
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Resultado count */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted small">
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
            {hayFiltrosActivos && <Badge bg="success" className="ms-2">Filtros activos</Badge>}
          </span>
          <span className="text-muted small">
            Página {paginaActual} de {totalPaginas || 1}
          </span>
        </div>
      </Container>

      <section style={{ backgroundColor: '#DAF9DD' }}>
        <Container className="py-4">
          <Row>
            {productosPagina.map(producto => (
              <Col key={producto.id} xs={6} md={6} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={producto.imagen || "/images/placeholder.jpg"}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={e => { e.target.src = "/images/placeholder.jpg"; }}
                    />
                    {esCliente && (
                      <button
                        onClick={() => toggleFav(producto.id)}
                        className="position-absolute top-0 end-0 m-2 border-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                        title={isFav(producto.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                      >
                        {isFav(producto.id) ? '❤️' : '🤍'}
                      </button>
                    )}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between mb-1">
                      <Badge bg="secondary" className="text-capitalize">{producto.categoria}</Badge>
                      {producto.stock === 0 && <Badge bg="danger">Sin stock</Badge>}
                      {producto.stock > 0 && producto.stock <= 5 && <Badge bg="warning" text="dark">Últimas {producto.stock}</Badge>}
                    </div>
                    <Card.Title className="mt-2">{producto.nombre}</Card.Title>
                    <Card.Text className="flex-grow-1 text-muted small">
                      {producto.descripcion}
                    </Card.Text>
                    <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="text-success mb-0">S/.{parseFloat(producto.precio).toFixed(2)}</h5>
                        <small className="text-muted">Stock: {producto.stock}</small>
                      </div>
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
            ))}
          </Row>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-5">
              <h5 className="text-muted">No se encontraron productos con esos filtros</h5>
              <Button variant="outline-success" onClick={limpiarFiltros} className="mt-2">
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Paginación */}
          <PaginacionVentana
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onChange={setPagina}
          />
        </Container>
      </section>
    </>
  );
}

export default Productos;
