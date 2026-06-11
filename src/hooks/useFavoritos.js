import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useFavoritos(user) {
  const [ids, setIds] = useState(new Set());
  const [cargando, setCargando] = useState(false);

  const esCliente = user && user.rol !== 'admin' && user.rol !== 'mayorista';

  useEffect(() => {
    if (!esCliente) { setIds(new Set()); return; }
    api.get('/favoritos/ids')
      .then(({ data }) => setIds(new Set(data.data)))
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(async (producto_id) => {
    if (!esCliente) return;
    const esFav = ids.has(producto_id);
    // Optimistic update
    setIds(prev => {
      const next = new Set(prev);
      esFav ? next.delete(producto_id) : next.add(producto_id);
      return next;
    });
    try {
      if (esFav) {
        await api.delete(`/favoritos/${producto_id}`);
      } else {
        await api.post('/favoritos', { producto_id });
      }
    } catch {
      // Revert on error
      setIds(prev => {
        const next = new Set(prev);
        esFav ? next.add(producto_id) : next.delete(producto_id);
        return next;
      });
    }
  }, [ids, esCliente]);

  const isFav = useCallback((id) => ids.has(id), [ids]);

  return { isFav, toggle, cargando, esCliente };
}
