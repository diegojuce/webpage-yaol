// Única puerta de entrada al comercio para app/ y components/. Nadie fuera de
// lib/commerce importa de un proveedor.
//
// - Catálogo: siempre del backend propio (providers/native.ts).
// - Carrito: según NEXT_PUBLIC_COMMERCE_PROVIDER (lib/commerce-status.ts).
//   "off" cae en shopify, que corta cada llamada con su propio cortafuegos
//   (SHOPIFY_ENABLED).
import { COMMERCE_PROVIDER } from "lib/commerce-status";
import type { Cart, CartAttribute } from "./types";
import * as native from "./providers/native";
import * as shopify from "./providers/shopify";

export {
  getCategoryProducts,
  getCollection,
  getCollectionProducts,
  getCollections,
  getProduct,
  getProductFresh,
  getProductRecommendations,
  getProducts,
} from "./providers/native";

// Checkout con Stripe: solo existe en el proveedor nativo.
export {
  getOrderBySession,
  getQuoteLink,
  ShopApiError,
  startCheckout,
  startQuoteCheckout,
  updateOrderContact,
} from "./providers/native";
export type {
  CheckoutDetails,
  CheckoutOrder,
  QuoteLink,
  UnavailableLine,
} from "./providers/native";

const cartProvider = () => (COMMERCE_PROVIDER === "native" ? native : shopify);

// La cookie `cartId` guarda un UUID (nativo) o el gid con ?key= (Shopify).
export function isValidCartId(id?: string): id is string {
  if (COMMERCE_PROVIDER === "native") return native.isValidCartId(id);
  return !!id && id.startsWith("gid://shopify/Cart/") && id.includes("?key=");
}

export async function getCart(): Promise<Cart | undefined> {
  return cartProvider().getCart();
}

export async function createCart(attributes?: CartAttribute[]): Promise<Cart> {
  return cartProvider().createCart(attributes);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
  cartId?: string,
): Promise<Cart> {
  return cartProvider().addToCart(lines, cartId);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  return cartProvider().removeFromCart(lineIds);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  return cartProvider().updateCart(lines);
}

export async function updateCartAttributes(
  attributes: CartAttribute[],
  cartId?: string,
): Promise<Cart> {
  return cartProvider().updateCartAttributes(attributes, cartId);
}
