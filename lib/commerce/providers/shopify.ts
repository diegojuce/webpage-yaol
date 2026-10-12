// Adaptador Shopify (legado, temporal): solo el carrito. El catálogo ya sale
// del backend propio (providers/native.ts). Se borra en la Fase 6 junto con
// lib/shopify.
export {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
  updateCartAttributes,
} from "lib/shopify";
