import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export function useNotificaciones(user) {
  const [noLeidas, setNoLeidas] = useState(0);
  const [recientes, setRecientes] = useState([]);
  const intervalRef = useRef(null);

  const esCliente = user && user.rol !== 'admin' && user.rol !== 'mayorista';

  const fetchConteo = useCallback(async () => {
    if (!esCliente) return;
    try {
      const { data } = await api.get('/notificaciones/conteo');
      setNoLeidas(data.no_leidas);
    } catch {
      // silencioso
    }
  }, [esCliente]);

  const fetchRecientes = useCallback(async () => {
    if (!esCliente) return;
    try {
      const { data } = await api.get('/notificaciones?limite=5');
      setRecientes(data.data);
      setNoLeidas(data.no_leidas);
    } catch {
      // silencioso
    }
  }, [esCliente]);

  useEffect(() => {
    if (!esCliente) { setNoLeidas(0); setRecientes([]); return; }
    fetchRecientes();
    intervalRef.current = setInterval(fetchConteo, 30000);
    return () => clearInterval(intervalRef.current);
  }, [user]);

  const marcarLeida = useCallback(async (id) => {
    try {
      await api.patch(`/notificaciones/${id}/leer`);
      setRecientes(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch { /* silencioso */ }
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    try {
      await api.patch('/notificaciones/leer-todas');
      setRecientes(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch { /* silencioso */ }
  }, []);

  return { noLeidas, recientes, fetchRecientes, marcarLeida, marcarTodasLeidas, esCliente };
}
