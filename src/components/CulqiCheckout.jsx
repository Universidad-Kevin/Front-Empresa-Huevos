import { useEffect, useRef, useState } from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import api from "../services/api";

const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY;

/**
 * Botón de pago con tarjeta vía Culqi.
 * Props:
 *   pedidoId  — ID del pedido a pagar
 *   total     — monto en soles (ej. 25.00)
 *   email     — email del cliente
 *   onSuccess — callback cuando el pago se completa
 *   onError   — callback con mensaje de error
 */
export default function CulqiCheckout({ pedidoId, total, email, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const culqiRef = useRef(null);

  useEffect(() => {
    if (!CULQI_PUBLIC_KEY) return;

    const script = document.createElement("script");
    script.src = "https://checkout.culqi.com/js/v4";
    script.async = true;
    script.onload = () => {
      if (!window.Culqi) return;
      window.Culqi.publicKey = CULQI_PUBLIC_KEY;
      window.culqi = handleCulqiToken;
      culqiRef.current = window.Culqi;
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleCulqiToken = async () => {
    if (!window.culqiToken) return;
    const token = window.culqiToken.id;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/pagos/culqi/cargo", {
        pedido_id: pedidoId,
        culqi_token: token,
      });
      onSuccess?.(data);
    } catch (err) {
      const msg = err.response?.data?.error || "Error al procesar el pago";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const openCheckout = () => {
    if (!culqiRef.current) {
      setError("Culqi no está disponible. Verifica tu conexión.");
      return;
    }
    const amountCentavos = Math.round(parseFloat(total) * 100);
    culqiRef.current.open({
      title: "CampOrganic",
      currency: "PEN",
      amount: amountCentavos,
      order: `PEDIDO-${pedidoId}`,
      email,
    });
  };

  if (!CULQI_PUBLIC_KEY) {
    return (
      <Alert variant="warning" className="mb-0">
        Pago con tarjeta no disponible (VITE_CULQI_PUBLIC_KEY no configurado).
      </Alert>
    );
  }

  return (
    <div>
      {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
      <Button
        variant="primary"
        onClick={openCheckout}
        disabled={loading}
        className="w-100"
      >
        {loading ? (
          <><Spinner size="sm" className="me-2" />Procesando pago...</>
        ) : (
          `Pagar S/ ${parseFloat(total).toFixed(2)} con tarjeta`
        )}
      </Button>
    </div>
  );
}
