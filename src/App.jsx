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
import MisFavoritos from "./pages/public/MisFavoritos";
import MisNotificaciones from "./pages/public/MisNotificaciones";

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
import Categorias from "./pages/admin/Categorias";
import Marcas from "./pages/admin/Marcas";
import Inventario from "./pages/admin/Inventario";
import Proveedores from "./pages/admin/Proveedores";
import Pagos from "./pages/admin/Pagos";
import Facturas from "./pages/admin/Facturas";
import Cupones from "./pages/admin/Cupones";
import Valoraciones from "./pages/admin/Valoraciones";
import Auditoria from "./pages/admin/Auditoria";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
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
            <Route path="/mis-favoritos" element={<MisFavoritos />} />
            <Route path="/mis-notificaciones" element={<MisNotificaciones />} />
            <Route path="/recuperar-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rutas protegidas - Admin + Empleado */}
            <Route path="/admin"                        element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/productos"              element={<ProtectedRoute allowedRoles={["admin","empleado"]}><ProductosAdmin /></ProtectedRoute>} />
            <Route path="/admin/agregar-producto"       element={<ProtectedRoute allowedRoles={["admin","empleado"]}><AgregarProducto /></ProtectedRoute>} />
            <Route path="/admin/editar-producto/:id"    element={<ProtectedRoute allowedRoles={["admin","empleado"]}><EditarProducto /></ProtectedRoute>} />
            <Route path="/admin/productos-inactivos"    element={<ProtectedRoute allowedRoles={["admin","empleado"]}><ProductosInactivos /></ProtectedRoute>} />
            <Route path="/admin/pedidos"                element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Pedidos /></ProtectedRoute>} />
            <Route path="/admin/inventario"             element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Inventario /></ProtectedRoute>} />
            <Route path="/admin/proveedores"            element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Proveedores /></ProtectedRoute>} />
            <Route path="/admin/pagos"                  element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Pagos /></ProtectedRoute>} />
            <Route path="/admin/facturas"               element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Facturas /></ProtectedRoute>} />
            <Route path="/admin/marcas"                 element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Marcas /></ProtectedRoute>} />
            <Route path="/admin/categorias"             element={<ProtectedRoute allowedRoles={["admin","empleado"]}><Categorias /></ProtectedRoute>} />

            {/* Rutas protegidas - Solo Admin */}
            <Route path="/admin/estadisticas"           element={<ProtectedRoute allowedRoles={["admin"]}><Estadisticas /></ProtectedRoute>} />
            <Route path="/admin/clientes"               element={<ProtectedRoute allowedRoles={["admin"]}><Clientes /></ProtectedRoute>} />
            <Route path="/admin/agregar-cliente"        element={<ProtectedRoute allowedRoles={["admin"]}><AgregarCliente /></ProtectedRoute>} />
            <Route path="/admin/editar-cliente/:id"     element={<ProtectedRoute allowedRoles={["admin"]}><EditarCliente /></ProtectedRoute>} />
            <Route path="/admin/clientes/:id/nuevo-pedido" element={<ProtectedRoute allowedRoles={["admin"]}><NuevoPedidoMayorista /></ProtectedRoute>} />
            <Route path="/admin/usuarios"               element={<ProtectedRoute allowedRoles={["admin"]}><Usuarios /></ProtectedRoute>} />
            <Route path="/admin/cupones"                element={<ProtectedRoute allowedRoles={["admin"]}><Cupones /></ProtectedRoute>} />
            <Route path="/admin/valoraciones"           element={<ProtectedRoute allowedRoles={["admin"]}><Valoraciones /></ProtectedRoute>} />
            <Route path="/admin/auditoria"              element={<ProtectedRoute allowedRoles={["admin"]}><Auditoria /></ProtectedRoute>} />
            <Route path="/admin/configuracion"          element={<ProtectedRoute allowedRoles={["admin"]}><Configuracion /></ProtectedRoute>} />

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
