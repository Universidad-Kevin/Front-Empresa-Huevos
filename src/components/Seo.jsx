import { Helmet } from "react-helmet-async";
import {
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_IMAGE,
  BRAND,
  staticRoutes,
} from "../seo/config";

// Re-exportado por compatibilidad (ProductoDetalle importa { SITE_URL } desde aquí).
export { SITE_URL };

/**
 * Componente SEO/GEO reutilizable (skill seo-geo-advanced §4, §5, §9, §10).
 * Inyecta title, description, canonical, robots, Open Graph, Twitter Cards
 * y (opcional) JSON-LD por página, vía react-helmet-async.
 *
 * Para rutas estáticas basta con pasar `path`: el title/description/jsonLd se
 * toman de src/seo/config.js (misma fuente que usa el prerender del build).
 * Cualquier prop explícita sobreescribe el preset.
 *
 * @param {string}  path        Ruta relativa para canonical/OG (ej. "/productos").
 * @param {string}  [title]     Título sin marca (se añade "| CampOrganic").
 * @param {string}  [description] Meta description.
 * @param {string}  [image]     URL absoluta de la imagen social (og:image).
 * @param {boolean} [noindex]   Si true, marca la página como noindex.
 * @param {string}  [type]      og:type ("website" | "article" | "product").
 * @param {object}  [jsonLd]    JSON-LD adicional específico de la página.
 */
export default function Seo({
  path = "",
  title,
  description,
  image = DEFAULT_IMAGE,
  noindex = false,
  type = "website",
  jsonLd,
}) {
  const preset = staticRoutes[path] || {};
  const resolvedTitle = title ?? preset.title;
  const resolvedDescription = description ?? preset.description;
  const resolvedJsonLd = jsonLd ?? preset.jsonLd ?? null;

  const url = `${SITE_URL}${path}`;
  const fullTitle = resolvedTitle ? `${resolvedTitle} | ${BRAND}` : DEFAULT_TITLE;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {resolvedDescription && (
        <meta name="description" content={resolvedDescription} />
      )}
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, follow"
            : "index, follow, max-snippet:-1, max-image-preview:large"
        }
      />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:locale" content="es_PE" />
      <meta property="og:title" content={fullTitle} />
      {resolvedDescription && (
        <meta property="og:description" content={resolvedDescription} />
      )}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {resolvedDescription && (
        <meta name="twitter:description" content={resolvedDescription} />
      )}
      <meta name="twitter:image" content={image} />

      {/* JSON-LD específico de la página */}
      {resolvedJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(resolvedJsonLd)}
        </script>
      )}
    </Helmet>
  );
}
