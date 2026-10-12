// Única puerta de entrada al comercio para app/ y components/. Nadie fuera de
// lib/commerce importa de un proveedor.
//
// - Catálogo: siempre del backend propio (providers/native.ts).
// - Carrito: según NEXT_PUBLIC_COMMERCE_PROVIDER (lib/commerce-status.ts).
//   "native" todavía no tiene carrito (Fase 2): getCart devuelve undefined y
//   las escrituras lanzan.
import { COMMERCE_PROVIDER } from "lib/commerce-status";
import type { Cart, CartAttribute } from "./types";
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

export class NativeCartNotReadyError extends Error {
  constructor() {
    super("El carrito nativo llega en la Fase 2");
    this.name = "NativeCartNotReadyError";
  }
}

function cartProvider() {
  if (COMMERCE_PROVIDER === "native") throw new NativeCartNotReadyError();
  // "off" también cae aquí: lib/shopify corta cada llamada con su propio
  // cortafuegos (SHOPIFY_ENABLED).
  return shopify;
}

export async function getCart(): Promise<Cart | undefined> {
  if (COMMERCE_PROVIDER === "native") return undefined;
  return shopify.getCart();
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
