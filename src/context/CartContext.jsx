import { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

  // Sincronizar carrito con el servidor
  const syncWithServer = useCallback(async (localItems) => {
    try {
      const token = localStorage.getItem('huevos_token');
      if (!token) return;

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

      setCartItems(merged);
    } catch {
      // Si falla la sync, el carrito local sigue funcionando
    }
  }, []);

  // Persistir en localStorage siempre
  useEffect(() => {
    localStorage.setItem('campOrganicCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sincronizar al login
  useEffect(() => {
    const onLogin = () => syncWithServer(cartItems);
    window.addEventListener('userLoggedIn', onLogin);
    return () => window.removeEventListener('userLoggedIn', onLogin);
  }, [cartItems, syncWithServer]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(next[idx].quantity + quantity, product.stock) };
      } else {
        next = [...prev, { ...product, quantity }];
      }
      // Sync silencioso en background
      syncWithServer(next);
      return next;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const next = prev.filter(i => i.id !== productId);
      syncWithServer(next);
      return next;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setCartItems(prev => {
      const next = prev.map(i => i.id === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i);
      syncWithServer(next);
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    // Vaciar en servidor también
    const token = localStorage.getItem('huevos_token');
    if (token) api.delete('/carrito').catch(() => {});
  };

  const toggleCart = () => setIsCartOpen(p => !p);
  const closeCart = () => setIsCartOpen(false);
  const openCart = () => setIsCartOpen(true);

  const cartTotal = cartItems.reduce((t, i) => t + i.precio * i.quantity, 0);
  const itemCount = cartItems.reduce((t, i) => t + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, isCartOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
      toggleCart, closeCart, openCart,
      cartTotal, itemCount, syncWithServer,
    }}>
      {children}
    </CartContext.Provider>
  );
}
