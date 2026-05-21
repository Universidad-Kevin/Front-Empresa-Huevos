# CampOrganic — Frontend

E-commerce y sistema de inventarios para empresa de huevos orgánicos. Plataforma completa con tienda pública para clientes y panel de administración para gestión interna.

## Stack tecnológico

| Tecnología | Versión |
|------------|---------|
| React | 19.1.1 |
| Vite | 7.1.7 |
| React Bootstrap | 2.10.10 |
| React Router DOM | 7.9.4 |
| Axios | latest |

## Requisitos previos

- Node.js 18+
- Docker y Docker Compose
- Backend corriendo ([Back-Empresa-Huevos](../Back-Empresa-Huevos))

## Instalación y ejecución

### Con Docker (recomendado)

```bash
# Levantar solo el frontend (el backend debe estar corriendo primero)
docker compose up -d
```

El frontend estará disponible en `http://localhost:5173`

### Sin Docker (desarrollo local)

```bash
npm install
npm run dev
```

> El backend debe estar corriendo en `http://localhost:3000` para que las llamadas a la API funcionen.

## Variables de entorno

Crear un archivo `.env` en la raíz:

```env
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000/api
```

## Estructura del proyecto

```
src/
├── components/
│   ├── AuthModal.jsx        # Modal de login/registro
│   ├── CartOffcanvas.jsx    # Carrito lateral deslizante
│   ├── Footer.jsx
│   ├── Navbar.jsx           # Barra de navegación con rol adaptativo
│   ├── ProtectedRoute.jsx   # Rutas protegidas por rol
│   └── SkeletonLoader.jsx   # Esqueletos de carga reutilizables
├── context/
│   ├── AuthContext.jsx      # Autenticación global (JWT)
│   └── CartContext.jsx      # Estado del carrito + sync con servidor
├── pages/
│   ├── public/
│   │   ├── Home.jsx
│   │   ├── Productos.jsx       # Catálogo con filtros y paginación
│   │   ├── ProductoDetalle.jsx
│   │   ├── Checkout.jsx        # Proceso de compra
│   │   ├── MisPedidos.jsx      # Historial de pedidos del cliente
│   │   └── MiPerfil.jsx        # Perfil y cambio de contraseña
│   └── admin/
│       ├── Dashboard.jsx
│       ├── ProductosAdmin.jsx
│       ├── AgregarProducto.jsx
│       ├── EditarProducto.jsx
│       ├── ProductosInactivos.jsx
│       ├── Clientes.jsx
│       ├── AgregarCliente.jsx
│       ├── EditarCliente.jsx
│       ├── Pedidos.jsx          # Gestión y cambio de estado de pedidos
│       ├── Estadisticas.jsx
│       └── Configuracion.jsx
└── services/
    └── api.js               # Instancia Axios con interceptor JWT
```

## Funcionalidades

### Área pública (clientes)
- Catálogo de productos con filtros (categoría, precio, stock, orden) y paginación
- Carrito de compras persistente en `localStorage` y sincronizado con el servidor
- Proceso de checkout con selección de método de pago (efectivo / transferencia / tarjeta)
- Registro e inicio de sesión mediante modal
- Historial de pedidos con detalle por pedido
- Perfil personal: edición de datos y cambio de contraseña

### Área administrativa (admin)
- Dashboard con estadísticas generales (productos, clientes, stock)
- CRUD completo de productos con manejo de características y estado activo/inactivo
- CRUD de clientes mayoristas con límite de crédito y tipo de negocio
- Gestión de pedidos: cambio de estado secuencial (pendiente → procesando → enviado → completado) y cancelación
- Vista de productos inactivos con opción de reactivar

### Autenticación
- JWT almacenado en `localStorage`
- Rutas protegidas por rol (`admin` / `cliente`)
- El Navbar adapta su menú al rol del usuario

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@camporganic.com` | `password` |
| Cliente | Registrarse en el sitio | — |

## Rutas disponibles

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Página de inicio |
| `/productos` | Público | Catálogo de productos |
| `/producto/:id` | Público | Detalle de producto |
| `/checkout` | Requiere login | Proceso de compra |
| `/mis-pedidos` | Cliente | Lista de pedidos |
| `/mis-pedidos/:id` | Cliente | Detalle de pedido |
| `/mi-perfil` | Cliente | Perfil y contraseña |
| `/admin` | Admin | Dashboard |
| `/admin/productos` | Admin | Gestión de productos |
| `/admin/clientes` | Admin | Gestión de clientes |
| `/admin/pedidos` | Admin | Gestión de pedidos |
| `/admin/estadisticas` | Admin | Estadísticas |

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo con HMR
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # Linter ESLint
```

## Relacionado

- [Back-Empresa-Huevos](../Back-Empresa-Huevos) — API REST con Express, MySQL y JWT
