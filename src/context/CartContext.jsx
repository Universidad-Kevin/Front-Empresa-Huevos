import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('campOrganicCart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // skipSyncRef: evita que el resultado de una sync del servidor vuelva a disparar otra sync
  const skipSyncRef = useRef(false);
  // isFirstRenderRef: no sincronizar al montar (el carrito viene de localStorage, no es un cambio del usuario)
  const isFirstRenderRef = useRef(true);

  const syncWithServer = useCallback(async (localItems) => {
    try {
      const token = localStorage.getItem('huevos_token');
      if (!token) return;

      // Personal y mayoristas no tienen carrito — no sincronizar
      const savedUser = localStorage.getItem('huevos_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (['mayorista', 'admin', 'empleado'].includes(u.rol)) return;
      }

      const items = localItems.map(i => ({
        producto_id: i.id,
        cantidad: i.quantity,
      }));

      const { data } = await api.post('/carrito/sync', { items });

      // Mapear respuesta del servidor al formato del carrito local
      const merged = data.data.map(item => ({
        id: item.producto_id,
        nombre: item.nombre,
        precio: parseFloat(item.precio),
        imagen: item.imagen,
        stock: item.stock,
        quantity: item.cantidad,
      }));

      // Marcar que el próximo cambio de cartItems viene del servidor (no re-sincronizar)
      skipSyncRef.current = true;
      setCartItems(merged);
    } catch {
      // Si falla la sync, el carrito local sigue funcionando
    }
  }, []);

  // Persistir en localStorage siempre
  useEffect(() => {
    localStorage.setItem('campOrganicCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Auto-sincronizar con el servidor cada vez que el carrito cambia (excepto carga inicial y respuestas del servidor)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    const token = localStorage.getItem('huevos_token');
    if (!token) return;
    syncWithServer(cartItems);
  }, [cartItems, syncWithServer]);

  // Sincronizar al login (el carrito local puede tener items añadidos antes de autenticarse)
  useEffect(() => {
    const onLogin = () => syncWithServer(cartItems);
    window.addEventListener('userLoggedIn', onLogin);
    return () => window.removeEventListener('userLoggedIn', onLogin);
  }, [cartItems, syncWithServer]);

  const getStaffRol = () => {
    try {
      const u = JSON.parse(localStorage.getItem('huevos_user') || 'null');
      return u?.rol === 'admin' || u?.rol === 'empleado';
    } catch { return false; }
  };

  const addToCart = (product, quantity = 1) => {
    if (getStaffRol()) return;
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(next[idx].quantity + quantity, product.stock) };
        return next;
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCartItems(prev =>
      prev.map(i => i.id === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i)
    );
  };

  const clearCart = () => {
    skipSyncRef.current = true; // El DELETE /carrito ya limpia el servidor; no necesitamos sync
    setCartItems([]);
    const token = localStorage.getItem('huevos_token');
    const savedUser = localStorage.getItem('huevos_user');
    const rol = savedUser ? JSON.parse(savedUser).rol : null;
    if (token && !['mayorista', 'admin', 'empleado'].includes(rol)) {
      api.delete('/carrito').catch(() => {});
    }
  };

  const toggleCart = () => setIsCartOpen(p => !p);
  const closeCart = () => setIsCartOpen(false);
  const openCart = () => setIsCartOpen(true);

  const cartTotal = cartItems.reduce((t, i) => t + i.precio * i.quantity, 0);
  const itemCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const isStaff = getStaffRol();

  return (
    <CartContext.Provider value={{
      cartItems, isCartOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
      toggleCart, closeCart, openCart,
      cartTotal, itemCount, syncWithServer,
      isStaff,
    }}>
      {children}
    </CartContext.Provider>
  );
}
