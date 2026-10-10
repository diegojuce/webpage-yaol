// Cortafuegos de comercio: mientras Shopify esté suspendido, todas las
// llamadas a su API fallan y tumbaban el render del sitio (Navbar -> getMenu,
// layout -> getCart, etc.). Con el flag apagado el sitio sigue navegable con
// contenido propio (backend, imágenes, buscador) y el carrito queda inhabilitado.
//
// Para reactivar carrito y pago: NEXT_PUBLIC_COMMERCE_ENABLED=true
export const COMMERCE_ENABLED =
  process.env.NEXT_PUBLIC_COMMERCE_ENABLED === "true";

export const COMMERCE_DISABLED_MESSAGE =
  "Carrito y pagos no disponibles: sitio en construcción. Llámanos o visítanos en sucursal para comprar.";
