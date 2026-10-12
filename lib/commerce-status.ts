// Cortafuegos de comercio: mientras Shopify esté suspendido, todas las
// llamadas a su API fallan y tumbaban el render del sitio (Navbar -> getMenu,
// layout -> getCart, etc.). Con el proveedor en "off" el sitio sigue navegable
// con contenido propio (backend, imágenes, buscador) y el carrito queda
// inhabilitado.
//
// NEXT_PUBLIC_COMMERCE_PROVIDER = "off" | "shopify" | "native"
//   off     → sin carrito ni pago (default)
//   shopify → carrito y checkout de Shopify (legado)
//   native  → carrito propio + Stripe (en construcción; no usar antes de la
//             Fase 2 del plan en docs/plan-migracion-commerce-nativo.md)
//
// Compatibilidad: si no está definido pero NEXT_PUBLIC_COMMERCE_ENABLED=true,
// se toma "shopify".
export type CommerceProvider = "off" | "shopify" | "native";

function resolveProvider(): CommerceProvider {
  const value = process.env.NEXT_PUBLIC_COMMERCE_PROVIDER;
  if (value === "off" || value === "shopify" || value === "native") {
    return value;
  }
  return process.env.NEXT_PUBLIC_COMMERCE_ENABLED === "true" ? "shopify" : "off";
}

export const COMMERCE_PROVIDER: CommerceProvider = resolveProvider();

// Carrito y pago disponibles en la UI (cualquier proveedor que no sea "off").
export const COMMERCE_ENABLED = COMMERCE_PROVIDER !== "off";

// Llamadas reales a la API de Shopify (sólo con el proveedor legado).
export const SHOPIFY_ENABLED = COMMERCE_PROVIDER === "shopify";

export const COMMERCE_DISABLED_MESSAGE =
  "Carrito y pagos no disponibles: sitio en construcción. Llámanos o visítanos en sucursal para comprar.";
