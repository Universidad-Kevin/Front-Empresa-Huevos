import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";

// Páginas públicas
import Home from "./pages/public/Home";
import Productos from "./pages/public/Productos";
import ProductoDetalle from "./pages/public/ProductoDetalle";
import Nosotros from "./pages/public/Nosotros";
import Contacto from "./pages/public/Contacto";
import Checkout from "./pages/public/Checkout";
import { MisPedidos, DetallePedidoPage } from "./pages/public/MisPedidos";
import MiPerfil from "./pages/public/MiPerfil";

// Páginas admin
import Dashboard from "./pages/admin/Dashboard";
import ProductosAdmin from "./pages/admin/ProductosAdmin";
import AgregarProducto from "./pages/admin/AgregarProducto";
import EditarProducto from "./pages/admin/EditarProducto";
import ProductosInactivos from "./pages/admin/ProductosInactivos";
import Estadisticas from "./pages/admin/Estadisticas";
import Clientes from "./pages/admin/Clientes";
import AgregarCliente from "./pages/admin/AgregarCliente";
import EditarCliente from "./pages/admin/EditarCliente";
import NuevoPedidoMayorista from "./pages/admin/NuevoPedidoMayorista";
import Pedidos from "./pages/admin/Pedidos";
import Configuracion from "./pages/admin/Configuracion";
import Usuarios from "./pages/admin/Usuarios";
import DashboardMayorista from "./pages/mayorista/DashboardMayorista";
import { ListaPedidosMayorista, DetallePedidoMayorista } from "./pages/mayorista/PedidosMayorista";
import PerfilMayorista from "./pages/mayorista/PerfilMayorista";
import ContactoMayorista from "./pages/mayorista/ContactoMayorista";

import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
            <Route path="/mis-pedidos/:id" element={<DetallePedidoPage />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />

            {/* Rutas protegidas - Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute>
                  <ProductosAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agregar-producto"
              element={
                <ProtectedRoute>
                  <AgregarProducto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/editar-producto/:id"
              element={
                <ProtectedRoute>
                  <EditarProducto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos-inactivos"
              element={
                <ProtectedRoute>
                  <ProductosInactivos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/estadisticas"
              element={
                <ProtectedRoute>
                  <Estadisticas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pedidos"
              element={
                <ProtectedRoute>
                  <Pedidos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/configuracion"
              element={
                <ProtectedRoute>
                  <Configuracion />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clientes"
              element={
                <ProtectedRoute>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agregar-cliente"
              element={
                <ProtectedRoute>
                  <AgregarCliente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/editar-cliente/:id"
              element={
                <ProtectedRoute>
                  <EditarCliente />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clientes/:id/nuevo-pedido"
              element={
                <ProtectedRoute>
                  <NuevoPedidoMayorista />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute>
                  <Usuarios />
                </ProtectedRoute>
              }
            />

            {/* Rutas portal mayorista */}
            <Route path="/mayorista" element={<ProtectedRoute allowedRoles={["mayorista"]}><DashboardMayorista /></ProtectedRoute>} />
            <Route path="/mayorista/pedidos" element={<ProtectedRoute allowedRoles={["mayorista"]}><ListaPedidosMayorista /></ProtectedRoute>} />
            <Route path="/mayorista/pedidos/:id" element={<ProtectedRoute allowedRoles={["mayorista"]}><DetallePedidoMayorista /></ProtectedRoute>} />
            <Route path="/mayorista/perfil" element={<ProtectedRoute allowedRoles={["mayorista"]}><PerfilMayorista /></ProtectedRoute>} />
            <Route path="/mayorista/contacto" element={<ProtectedRoute allowedRoles={["mayorista"]}><ContactoMayorista /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
