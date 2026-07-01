// ============================================================
// Prerender estático de meta SEO/GEO (skill seo-geo-advanced §9, §10).
//
// Se ejecuta DESPUÉS de `vite build`:
//   1. Rutas públicas ESTÁTICAS (src/seo/config.js) → dist/<ruta>/index.html
//   2. Rutas de PRODUCTO (fetch a la API en build-time) → dist/producto/<id>/index.html
//   3. sitemap.xml dinámico (rutas estáticas + productos) → dist/sitemap.xml
//
// nginx (try_files $uri $uri/ /index.html) sirve los dirs prerenderizados, así
// los scrapers/crawlers sin JS ven el meta correcto. Los tags llevan
// data-rh="true" + un <script> inline que los elimina antes de que arranque
// React → en el navegador react-helmet-async queda como única fuente (sin
// duplicados). Sin navegador headless → funciona en node:20-alpine.
//
// Si la API no está disponible en build-time, el prerender de productos y las
// URLs de producto del sitemap se OMITEN con una advertencia; el build NO falla.
// ============================================================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SITE_URL,
  BRAND,
  DEFAULT_TITLE,
  DEFAULT_IMAGE,
  staticRoutes,
} from "../src/seo/config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");
const template = readFileSync(resolve(distDir, "index.html"), "utf-8");
const BUILD_DATE = new Date().toISOString().slice(0, 10);

// Escapa para uso seguro dentro de atributos HTML.
const attr = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// Escapa "<" en el JSON-LD para no cerrar el <script> por accidente.
const jsonLdScript = (obj) =>
  `<script type="application/ld+json" data-rh="true">${JSON.stringify(
    obj
  ).replace(/</g, "\\u003c")}</script>`;

function buildHead(path, meta) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = meta.title ? `${meta.title} | ${BRAND}` : DEFAULT_TITLE;
  const desc = meta.description || "";
  const image = meta.image || DEFAULT_IMAGE;
  const type = meta.type || "website";
  const tags = [
    `<title data-rh="true">${attr(fullTitle)}</title>`,
    `<meta data-rh="true" name="description" content="${attr(desc)}">`,
    `<link data-rh="true" rel="canonical" href="${url}">`,
    `<meta data-rh="true" name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">`,
    `<meta data-rh="true" property="og:type" content="${type}">`,
    `<meta data-rh="true" property="og:site_name" content="${BRAND}">`,
    `<meta data-rh="true" property="og:locale" content="es_PE">`,
    `<meta data-rh="true" property="og:title" content="${attr(fullTitle)}">`,
    `<meta data-rh="true" property="og:description" content="${attr(desc)}">`,
    `<meta data-rh="true" property="og:url" content="${url}">`,
    `<meta data-rh="true" property="og:image" content="${attr(image)}">`,
    `<meta data-rh="true" name="twitter:card" content="summary_large_image">`,
    `<meta data-rh="true" name="twitter:title" content="${attr(fullTitle)}">`,
    `<meta data-rh="true" name="twitter:description" content="${attr(desc)}">`,
    `<meta data-rh="true" name="twitter:image" content="${attr(image)}">`,
  ];
  if (meta.jsonLd) tags.push(jsonLdScript(meta.jsonLd));
  // Los scrapers/crawlers sin JS conservan estos tags. En un navegador real,
  // este script CLÁSICO inline corre durante el parseo (antes del bundle
  // type="module", que es diferido) y elimina los tags prerenderizados para
  // que react-helmet-async sea la ÚNICA fuente y no queden duplicados.
  tags.push(
    `<script>document.querySelectorAll('[data-rh]').forEach(function(e){e.parentNode.removeChild(e)})</script>`
  );
  return tags.join("\n  ");
}

function writeRoute(path, meta) {
  const head = buildHead(path, meta);
  const html = template.replace("</head>", `  ${head}\n</head>`);
  const outPath =
    path === "/"
      ? resolve(distDir, "index.html")
      : resolve(distDir, path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf-8");
  console.log(`  prerender ✓ ${path} → ${outPath.replace(distDir, "dist")}`);
}

// --- 1. Rutas estáticas ---
for (const [path, meta] of Object.entries(staticRoutes)) writeRoute(path, meta);

// --- 2. Productos (API en build-time, con degradación elegante) ---
async function fetchProductos() {
  const base = process.env.VITE_API_URL;
  if (!base) {
    console.warn(
      "  [productos] VITE_API_URL no definido — se omite el prerender de /producto/:id"
    );
    return [];
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(`${base.replace(/\/$/, "")}/productos/activos`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];
    return list.filter((p) => p && p.id != null);
  } catch (e) {
    console.warn(
      `  [productos] no se pudo obtener el catálogo (${e.message}) — /producto/:id queda como SPA (Google lo renderiza vía JS)`
    );
    return [];
  }
}

const productos = await fetchProductos();
for (const p of productos) {
  const path = `/producto/${p.id}`;
  const imagenAbs = p.imagen
    ? String(p.imagen).startsWith("http")
      ? p.imagen
      : `${SITE_URL}${p.imagen}`
    : DEFAULT_IMAGE;
  const desc = (
    p.descripcion ||
    `Compra ${p.nombre} en CampOrganic. Huevos orgánicos frescos con entrega a domicilio en Perú.`
  ).slice(0, 160);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nombre,
    description: p.descripcion,
    image: imagenAbs,
    category: p.categoria,
    brand: { "@type": "Brand", name: BRAND },
    offers: {
      "@type": "Offer",
      price: p.precio,
      priceCurrency: "PEN",
      availability:
        p.stock != null && p.stock <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `${SITE_URL}${path}`,
    },
  };
  writeRoute(path, {
    title: p.nombre,
    description: desc,
    image: imagenAbs,
    type: "product",
    jsonLd,
  });
}

// --- 3. sitemap.xml dinámico (sobreescribe el estático de public/) ---
function buildSitemap(productoPaths) {
  const urls = [
    { loc: "/", changefreq: "daily", priority: "1.0" },
    { loc: "/productos", changefreq: "daily", priority: "0.9" },
    { loc: "/nosotros", changefreq: "monthly", priority: "0.6" },
    { loc: "/contacto", changefreq: "monthly", priority: "0.5" },
    ...productoPaths.map((loc) => ({
      loc,
      changefreq: "weekly",
      priority: "0.7",
    })),
  ];
  const body = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

writeFileSync(
  resolve(distDir, "sitemap.xml"),
  buildSitemap(productos.map((p) => `/producto/${p.id}`)),
  "utf-8"
);
console.log(
  `  sitemap ✓ dist/sitemap.xml (${4 + productos.length} URLs, ${productos.length} productos)`
);
console.log(
  `Prerender completado: ${Object.keys(staticRoutes).length} estáticas + ${productos.length} productos.`
);
