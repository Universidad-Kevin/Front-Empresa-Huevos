import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Páginas públicas
import Home from './pages/public/Home'
import Productos from './pages/public/Productos'
import ProductoDetalle from './pages/public/ProductoDetalle'
import Nosotros from './pages/public/Nosotros'
import Contacto from './pages/public/Contacto'
import Login from './pages/public/Login'

// Páginas admin
import Dashboard from './pages/admin/Dashboard'
import ProductosAdmin from './pages/admin/ProductosAdmin'
import AgregarProducto from './pages/admin/AgregarProducto'
import Estadisticas from './pages/admin/Estadisticas'
import Pedidos from './pages/admin/Pedidos'
import Configuracion from './pages/admin/Configuracion'

import './styles/App.css'

function App() {
  return (
    <AuthProvider>
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
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas - Admin */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/productos" element={
              <ProtectedRoute>
                <ProductosAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/agregar-producto" element={
              <ProtectedRoute>
                <AgregarProducto />
              </ProtectedRoute>
            } />
            <Route path="/admin/estadisticas" element={
              <ProtectedRoute>
                <Estadisticas />
              </ProtectedRoute>
            } />
            <Route path="/admin/pedidos" element={
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracion" element={
              <ProtectedRoute>
                <Configuracion />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App