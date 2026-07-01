// ============================================================
// Configuración SEO/GEO centralizada (skill seo-geo-advanced).
// FUENTE ÚNICA de verdad para el meta por página: la consumen
//   1. src/components/Seo.jsx  (runtime, react-helmet-async)
//   2. scripts/prerender.js    (build, inyecta meta en el HTML estático)
// Mantener este archivo SIN imports de React/JSX para que Node
// pueda importarlo directamente durante el build.
// ============================================================

// Dominio de producción — reemplazar aquí si cambia el dominio.
export const SITE_URL = "https://fearless-flow-production.up.railway.app";
export const BRAND = "CampOrganic";
export const DEFAULT_TITLE =
  "CampOrganic - Huevos Orgánicos Frescos a Domicilio en Perú";
export const DEFAULT_IMAGE = `${SITE_URL}/images/hero-huevos.jpg`;

// FAQ de la página de Contacto → schema FAQPage (muy citable en GEO, §5.1/§11).
const FAQ_CONTACTO = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Hacen entregas a domicilio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí, realizamos entregas a domicilio en toda el área metropolitana. Consulta nuestra zona de cobertura.",
      },
    },
    {
      "@type": "Question",
      name: "¿Son realmente orgánicos?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutamente. Contamos con certificación orgánica y nuestras gallinas son criadas libremente con alimentación 100% orgánica.",
      },
    },
  ],
};

/**
 * Rutas públicas ESTÁTICAS que se prerenderizan en el build.
 * title: null → usa DEFAULT_TITLE. Las rutas dinámicas (ej. /producto/:id)
 * NO van aquí: pasan su meta explícita a <Seo> y quedan como SPA.
 */
export const staticRoutes = {
  "/": {
    title: null,
    description:
      "Compra huevos orgánicos frescos de gallinas libres, sin químicos ni conservantes. Huevos omega-3, de codorniz y azules con entrega a domicilio en Perú. Tienda online de CampOrganic.",
  },
  "/productos": {
    title: "Nuestros Productos",
    description:
      "Catálogo de huevos orgánicos de CampOrganic: huevos frescos de gallinas libres, omega-3, de codorniz y azules. Sin químicos ni conservantes, con entrega a domicilio en Perú.",
  },
  "/nosotros": {
    title: "Nosotros",
    description:
      "Conoce a CampOrganic: agricultura regenerativa, bienestar animal y gallinas criadas en libertad. Producimos huevos orgánicos certificados con los más altos controles de calidad en Perú.",
  },
  "/contacto": {
    title: "Contacto",
    description:
      "Contacta con CampOrganic. Resolvemos tus dudas sobre huevos orgánicos, entregas a domicilio y certificación orgánica. Escríbenos y te ayudamos.",
    jsonLd: FAQ_CONTACTO,
  },
};
