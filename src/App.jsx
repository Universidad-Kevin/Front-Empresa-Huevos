import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
import LoadingSpinner from "./components/LoadingSpinner";

// ── Páginas públicas ─────────────────────────────────────────────────────────
const Home               = lazy(() => import("./pages/public/Home"));
const Productos          = lazy(() => import("./pages/public/Productos"));
const ProductoDetalle    = lazy(() => import("./pages/public/ProductoDetalle"));
const Nosotros           = lazy(() => import("./pages/public/Nosotros"));
const Contacto           = lazy(() => import("./pages/public/Contacto"));
const Checkout           = lazy(() => import("./pages/public/Checkout"));
const MisPedidos         = lazy(() => import("./pages/public/MisPedidos").then(m => ({ default: m.MisPedidos })));
const DetallePedidoPage  = lazy(() => import("./pages/public/MisPedidos").then(m => ({ default: m.DetallePedidoPage })));
const MiPerfil           = lazy(() => import("./pages/public/MiPerfil"));
const MisFavoritos       = lazy(() => import("./pages/public/MisFavoritos"));
const MisNotificaciones  = lazy(() => import("./pages/public/MisNotificaciones"));
const ForgotPassword     = lazy(() => import("./pages/public/ForgotPassword"));
const ResetPassword      = lazy(() => import("./pages/public/ResetPassword"));

// ── Páginas admin ────────────────────────────────────────────────────────────
const Dashboard            = lazy(() => import("./pages/admin/Dashboard"));
const ProductosAdmin       = lazy(() => import("./pages/admin/ProductosAdmin"));
const AgregarProducto      = lazy(() => import("./pages/admin/AgregarProducto"));
const EditarProducto       = lazy(() => import("./pages/admin/EditarProducto"));
const ProductosInactivos   = lazy(() => import("./pages/admin/ProductosInactivos"));
const Estadisticas         = lazy(() => import("./pages/admin/Estadisticas"));
const Clientes             = lazy(() => import("./pages/admin/Clientes"));
const AgregarCliente       = lazy(() => import("./pages/admin/AgregarCliente"));
const EditarCliente        = lazy(() => import("./pages/admin/EditarCliente"));
const NuevoPedidoMayorista = lazy(() => import("./pages/admin/NuevoPedidoMayorista"));
const Pedidos              = lazy(() => import("./pages/admin/Pedidos"));
const Configuracion        = lazy(() => import("./pages/admin/Configuracion"));
const Usuarios             = lazy(() => import("./pages/admin/Usuarios"));
const Categorias           = lazy(() => import("./pages/admin/Categorias"));
const Marcas               = lazy(() => import("./pages/admin/Marcas"));
const Inventario           = lazy(() => import("./pages/admin/Inventario"));
const Proveedores          = lazy(() => import("./pages/admin/Proveedores"));
const Pagos                = lazy(() => import("./pages/admin/Pagos"));
const Facturas             = lazy(() => import("./pages/admin/Facturas"));
const Cupones              = lazy(() => import("./pages/admin/Cupones"));
const Valoraciones         = lazy(() => import("./pages/admin/Valoraciones"));
const Auditoria            = lazy(() => import("./pages/admin/Auditoria"));

// ── Páginas mayorista ────────────────────────────────────────────────────────
const DashboardMayorista    = lazy(() => import("./pages/mayorista/DashboardMayorista"));
const ListaPedidosMayorista = lazy(() => import("./pages/mayorista/PedidosMayorista").then(m => ({ default: m.ListaPedidosMayorista })));
const DetallePedidoMayorista= lazy(() => import("./pages/mayorista/PedidosMayorista").then(m => ({ default: m.DetallePedidoMayorista })));
const PerfilMayorista       = lazy(() => import("./pages/mayorista/PerfilMayorista"));
const ContactoMayorista     = lazy(() => import("./pages/mayorista/ContactoMayorista"));

import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/"                    element={<Home />} />
                <Route path="/productos"           element={<Productos />} />
                <Route path="/producto/:id"        element={<ProductoDetalle />} />
                <Route path="/nosotros"            element={<Nosotros />} />
                <Route path="/contacto"            element={<Contacto />} />
                <Route path="/checkout"            element={<Checkout />} />
                <Route path="/mis-pedidos"         element={<MisPedidos />} />
                <Route path="/mis-pedidos/:id"     element={<DetallePedidoPage />} />
                <Route path="/mi-perfil"           element={<MiPerfil />} />
                <Route path="/mis-favoritos"       element={<MisFavoritos />} />
                <Route path="/mis-notificaciones"  element={<MisNotificaciones />} />
                <Route path="/recuperar-password"  element={<ForgotPassword />} />
                <Route path="/reset-password"      element={<ResetPassword />} />

                {/* Rutas protegidas - Admin + Empleado */}
                <Route path="/admin"                            element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/productos"                  element={<ProtectedRoute allowedRoles={["admin","empleado"]}><ProductosAdmin /></ProtectedRoute>} />
                <Route path="/admin/agregar-producto"           element={<ProtectedRoute allowedRoles={["admin","empleado"]}><AgregarProducto /></ProtectedRoute>} />
                <Route path="/admin/editar-producto/:id"        element={<ProtectedRoute allowedRoles={["admin","empleado"]}><EditarProducto /></ProtectedRoute>} />
                <Route path="/admin/productos-inactivos"        element={<ProtectedRoute allowedRoles={["admin","empleado"]}><ProductosInactivos /></ProtectedRoute>} />
                <Route path="/admin/pedidos"                    element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Pedidos /></ProtectedRoute>} />
                <Route path="/admin/inventario"                 element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Inventario /></ProtectedRoute>} />
                <Route path="/admin/proveedores"                element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Proveedores /></ProtectedRoute>} />
                <Route path="/admin/pagos"                      element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Pagos /></ProtectedRoute>} />
                <Route path="/admin/facturas"                   element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Facturas /></ProtectedRoute>} />
                <Route path="/admin/marcas"                     element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Marcas /></ProtectedRoute>} />
                <Route path="/admin/categorias"                 element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Categorias /></ProtectedRoute>} />

                {/* Rutas protegidas - Solo Admin */}
                <Route path="/admin/estadisticas"               element={<ProtectedRoute allowedRoles={["admin"]}><Estadisticas /></ProtectedRoute>} />
                <Route path="/admin/clientes"                   element={<ProtectedRoute allowedRoles={["admin"]}><Clientes /></ProtectedRoute>} />
                <Route path="/admin/agregar-cliente"            element={<ProtectedRoute allowedRoles={["admin"]}><AgregarCliente /></ProtectedRoute>} />
                <Route path="/admin/editar-cliente/:id"         element={<ProtectedRoute allowedRoles={["admin"]}><EditarCliente /></ProtectedRoute>} />
                <Route path="/admin/clientes/:id/nuevo-pedido"  element={<ProtectedRoute allowedRoles={["admin"]}><NuevoPedidoMayorista /></ProtectedRoute>} />
                <Route path="/admin/usuarios"                   element={<ProtectedRoute allowedRoles={["admin"]}><Usuarios /></ProtectedRoute>} />
                <Route path="/admin/cupones"                    element={<ProtectedRoute allowedRoles={["admin"]}><Cupones /></ProtectedRoute>} />
                <Route path="/admin/valoraciones"               element={<ProtectedRoute allowedRoles={["admin"]}><Valoraciones /></ProtectedRoute>} />
                <Route path="/admin/auditoria"                  element={<ProtectedRoute allowedRoles={["admin"]}><Auditoria /></ProtectedRoute>} />
                <Route path="/admin/configuracion"              element={<ProtectedRoute allowedRoles={["admin"]}><Configuracion /></ProtectedRoute>} />

                {/* Rutas portal mayorista */}
                <Route path="/mayorista"              element={<ProtectedRoute allowedRoles={["mayorista"]}><DashboardMayorista /></ProtectedRoute>} />
                <Route path="/mayorista/pedidos"      element={<ProtectedRoute allowedRoles={["mayorista"]}><ListaPedidosMayorista /></ProtectedRoute>} />
                <Route path="/mayorista/pedidos/:id"  element={<ProtectedRoute allowedRoles={["mayorista"]}><DetallePedidoMayorista /></ProtectedRoute>} />
                <Route path="/mayorista/perfil"       element={<ProtectedRoute allowedRoles={["mayorista"]}><PerfilMayorista /></ProtectedRoute>} />
                <Route path="/mayorista/contacto"     element={<ProtectedRoute allowedRoles={["mayorista"]}><ContactoMayorista /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
