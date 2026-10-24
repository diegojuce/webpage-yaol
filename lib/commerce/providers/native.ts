// Adaptador nativo: catálogo y carrito desde el backend propio (/bypass/shop)
// sin el formato de Shopify.
import { TAGS } from "lib/constants";
import type {
  Cart,
  CartAttribute,
  CartItem,
  CategoryKind,
  Collection,
  Image,
  Money,
  Product,
  ProductAvailability,
  ProductVariant,
} from "lib/commerce/types";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { cookies } from "next/headers";

// Respuesta de /bypass/shop (ver src/routes/services/shop.service.js en el
// backend).
type ShopProduct = {
  id: string;
  handle: string;
  sku: string;
  title: string;
  brand: string | null;
  size: string | null;
  rim: string | null;
  category: string | null;
  supplier: string | null;
  supplierSku: string | null;
  description: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  currency: string;
  taxIncluded: boolean;
  available: boolean;
  stock: { total: number; colima: number; manzanillo: number };
  images: Image[];
  tags: string[];
  updatedAt: string | null;
};

type ShopBrand = { handle: string; title: string; productCount: number };

type SortParams = { sortKey?: string; reverse?: boolean };

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export type UnavailableLine = { sku: string; title: string; quantityAvailable: number };

export class ShopApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    // Renglones sin existencia (checkout con code SIN_EXISTENCIA).
    readonly lines?: UnavailableLine[],
  ) {
    super(message);
    this.name = "ShopApiError";
  }
}

// null = 404. Cualquier otro error lanza ShopApiError (con el `code` del
// backend cuando lo trae, p. ej. SIN_EXISTENCIA).
async function shopFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  init: { method?: string; body?: unknown } = {},
): Promise<T | null> {
  const url = new URL(`${BACKEND_URL}/bypass/shop${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.BACKEND_API_TOKEN ?? ""}`,
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (res.status === 404 && (init.method ?? "GET") === "GET") return null;
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      lines?: UnavailableLine[];
    };
    throw new ShopApiError(
      err.error ?? `/bypass/shop${path} respondió ${res.status}`,
      res.status,
      err.code,
      err.lines,
    );
  }
  return (await res.json()) as T;
}

const sortQuery = ({ sortKey, reverse }: SortParams) => ({
  // El backend no distingue fecha de alta; misma regla que el adaptador viejo.
  sort: sortKey === "CREATED_AT" ? "UPDATED_AT" : sortKey,
  reverse: reverse ? true : undefined,
});

const money = (cents: number, currencyCode: string): Money => ({
  amount: (cents / 100).toFixed(2),
  currencyCode,
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

// Tipo de entrega por renglón. Para la UI son las dos "variantes" de cada
// llanta, como lo eran en Shopify: id = "<sku>:<entrega>".
export type Fulfillment = "install" | "delivery";
const FULFILLMENT_LABEL: Record<Fulfillment, string> = {
  install: "Instalar en sucursal",
  delivery: "Envío a domicilio",
};

export const variantId = (sku: string, fulfillment: Fulfillment) => `${sku}:${fulfillment}`;

export function parseVariantId(id: string): { sku: string; fulfillment: Fulfillment } {
  const [sku = "", fulfillment] = id.split(":");
  return { sku, fulfillment: fulfillment === "delivery" ? "delivery" : "install" };
}

function fulfillmentVariants(v: {
  sku: string;
  available: boolean;
  quantityAvailable: number;
  price: Money;
  compareAtPrice: Money | null;
  supplierSku?: string;
}): ProductVariant[] {
  return (Object.keys(FULFILLMENT_LABEL) as Fulfillment[]).map((f) => ({
    id: variantId(v.sku, f),
    title: FULFILLMENT_LABEL[f],
    availableForSale: v.available,
    quantityAvailable: v.quantityAvailable,
    sku: v.supplierSku,
    selectedOptions: [{ name: "Entrega", value: FULFILLMENT_LABEL[f] }],
    price: v.price,
    compareAtPrice: v.compareAtPrice,
  }));
}

export function toProduct(p: ShopProduct): Product {
  const price = money(p.priceCents, p.currency);
  const compareAt =
    p.compareAtPriceCents != null ? money(p.compareAtPriceCents, p.currency) : null;
  const rim = p.rim ? `R${p.rim}` : "";
  const summary = [p.brand, p.size, rim].filter(Boolean).join(" ");
  const description =
    p.description || [summary, p.title].filter(Boolean).join(" - ");

  return {
    id: p.id,
    handle: p.handle,
    availableForSale: p.available,
    title: p.title,
    vendor: p.brand ?? undefined,
    description,
    descriptionHtml: `<p>${escapeHtml(description)}</p>`,
    // Sin opciones: la única elección es la entrega (dos variantes).
    options: [],
    priceRange: {
      minVariantPrice: price,
      maxVariantPrice: compareAt ?? price,
    },
    variants: fulfillmentVariants({
      sku: p.sku,
      available: p.available,
      quantityAvailable: p.stock.total,
      price,
      compareAtPrice: compareAt,
      supplierSku: p.supplierSku ?? undefined,
    }),
    featuredImage: p.images[0]!,
    images: p.images,
    seo: {
      title: p.title,
      description: [summary, p.category].filter(Boolean).join(" | "),
    },
    tags: p.tags,
    updatedAt: p.updatedAt ?? new Date().toISOString(),
  };
}

const ALL_COLLECTION: Collection = {
  handle: "",
  title: "All",
  description: "All products",
  seo: { title: "All", description: "All products" },
  path: "/search",
  updatedAt: new Date(0).toISOString(),
};

const toCollection = (b: ShopBrand): Collection => ({
  handle: b.handle,
  title: b.title,
  description: "",
  seo: { title: b.title, description: "" },
  path: `/search/${b.handle}`,
  updatedAt: new Date(0).toISOString(),
});

export async function getProducts({
  query,
  ...sort
}: { query?: string } & SortParams): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopFetch<{ products: ShopProduct[] }>("/products", {
    q: query,
    ...sortQuery(sort),
  });
  return (res?.products ?? []).map(toProduct);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopFetch<{ product: ShopProduct }>(
    `/products/${encodeURIComponent(handle)}`,
  );
  return res ? toProduct(res.product) : undefined;
}

// Sin caché: validación de último momento (al agregar o pagar).
export async function getProductFresh(
  handle: string,
  quantity: number,
): Promise<ProductAvailability | undefined> {
  const res = await shopFetch<{ available: boolean; sufficientStock: boolean }>(
    `/products/${encodeURIComponent(handle)}/availability`,
    { quantity },
  );
  if (!res) return undefined;
  return { availableForSale: res.available, sufficientStock: res.sufficientStock };
}

// En el catálogo nativo el id del producto es su handle.
export async function getProductRecommendations(productId: string): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  try {
    const res = await shopFetch<{ products: ShopProduct[] }>(
      `/products/${encodeURIComponent(productId)}/recommendations`,
    );
    return (res?.products ?? []).map(toProduct);
  } catch (e) {
    // Las recomendaciones nunca deben tumbar la página de producto.
    console.error(`getProductRecommendations(${productId}) failed`, e);
    return [];
  }
}

export async function getCategoryProducts({
  kind,
  value,
  ...sort
}: { kind: CategoryKind; value: string } & SortParams): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products, TAGS.collections);
  cacheLife("days");

  try {
    const res = await shopFetch<{ products: ShopProduct[] }>(
      `/categories/${encodeURIComponent(kind)}/${encodeURIComponent(value)}`,
      sortQuery(sort),
    );
    return (res?.products ?? []).map(toProduct);
  } catch (e) {
    console.error(`getCategoryProducts(${kind}/${value}) failed`, e);
    return [];
  }
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  try {
    const res = await shopFetch<{ brands: ShopBrand[] }>("/brands");
    return [ALL_COLLECTION, ...(res?.brands ?? []).map(toCollection)];
  } catch (e) {
    console.error("getCollections failed", e);
    return [ALL_COLLECTION];
  }
}

export async function getCollection(handle: string): Promise<Collection | undefined> {
  // Una marca sin existencia no aparece en /brands, pero su página no debe
  // dar 404: se devuelve un metadato mínimo con el handle.
  const brand = (await getCollections()).find((c) => c.handle === handle);
  return brand ?? toCollection({ handle, title: handle, productCount: 0 });
}

export async function getCollectionProducts({
  collection,
  ...sort
}: { collection: string } & SortParams): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const res = await shopFetch<{ products: ShopProduct[] }>(
    `/brands/${encodeURIComponent(collection)}/products`,
    sortQuery(sort),
  );
  return (res?.products ?? []).map(toProduct);
}

// --- Carrito (Fase 2) ------------------------------------------------------

type ShopCartLine = {
  id: string;
  sku: string;
  fulfillment: Fulfillment;
  quantity: number;
  quantityAvailable: number;
  available: boolean;
  exceedsStock: boolean;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  lineTotalCents: number;
  product: {
    handle: string;
    title: string;
    brand: string | null;
    size: string | null;
    rim: string | null;
    image: Image | null;
  };
};

type ShopCart = {
  id: string;
  status: "active" | "converted" | "abandoned";
  phone: string | null;
  branchCode: string | null;
  quoteId: string | null;
  lines: ShopCartLine[];
  totalQuantity: number;
  currency: string;
  totals: { subtotalCents: number; taxCents: number; totalCents: number };
};

const DEFAULT_IMAGE_URL =
  "https://static.vecteezy.com/system/resources/previews/008/730/042/non_2x/car-rim-and-tire-linear-icon-thin-line-illustration-automobile-wheel-contour-symbol-isolated-outline-drawing-vector.jpg";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isValidCartId = (id?: string): id is string => !!id && UUID_RE.test(id);

// Atributos del carrito de Shopify ↔ campos del carrito nativo.
const ATTRIBUTE_FIELDS = {
  quote_id: "quoteId",
  sucursal: "branchCode",
  telefono: "phone",
} as const;

function attributesToFields(attributes: CartAttribute[] = []) {
  const fields: Record<string, string> = {};
  for (const { key, value } of attributes) {
    const field = ATTRIBUTE_FIELDS[key as keyof typeof ATTRIBUTE_FIELDS];
    if (field) fields[field] = value;
  }
  return fields;
}

function toCartItem(line: ShopCartLine, currency: string): CartItem {
  const price = money(line.unitPriceCents, currency);
  const compareAt =
    line.compareAtPriceCents != null ? money(line.compareAtPriceCents, currency) : null;
  const variants = fulfillmentVariants({
    sku: line.sku,
    available: line.available,
    quantityAvailable: line.quantityAvailable,
    price,
    compareAtPrice: compareAt,
  });
  const current = variants.find((v) => v.id === variantId(line.sku, line.fulfillment))!;
  return {
    id: line.id,
    quantity: line.quantity,
    cost: { totalAmount: money(line.lineTotalCents, currency) },
    merchandise: {
      id: current.id,
      title: current.title,
      selectedOptions: current.selectedOptions,
      product: {
        id: line.product.handle,
        handle: line.product.handle,
        title: line.product.title,
        featuredImage: line.product.image ?? {
          url: DEFAULT_IMAGE_URL,
          altText: line.product.title,
          width: 800,
          height: 800,
        },
        variants,
      },
    },
  };
}

export function toCart(c: ShopCart): Cart {
  const attributes: CartAttribute[] = [
    ...(c.quoteId ? [{ key: "quote_id", value: c.quoteId }] : []),
    ...(c.branchCode ? [{ key: "sucursal", value: c.branchCode }] : []),
    ...(c.phone ? [{ key: "telefono", value: c.phone }] : []),
  ];
  return {
    id: c.id,
    // El checkout nativo (Fase 3) crea la sesión de pago al momento.
    checkoutUrl: "",
    attributes,
    cost: {
      // Precios con IVA incluido: el subtotal que ve el cliente es el total.
      subtotalAmount: money(c.totals.totalCents, c.currency),
      totalTaxAmount: money(c.totals.taxCents, c.currency),
      totalAmount: money(c.totals.totalCents, c.currency),
    },
    lines: c.lines.map((l) => toCartItem(l, c.currency)),
    totalQuantity: c.totalQuantity,
  };
}

async function cartIdFromCookie() {
  const id = (await cookies()).get("cartId")?.value;
  return isValidCartId(id) ? id : undefined;
}

async function requireCartId(cartId?: string) {
  const id = cartId ?? (await cartIdFromCookie());
  if (!isValidCartId(id)) throw new ShopApiError("Carrito no encontrado", 404);
  return id;
}

async function cartMutation(path: string, method: string, body?: unknown): Promise<Cart> {
  const res = await shopFetch<{ cart: ShopCart }>(path, {}, { method, body });
  return toCart(res!.cart);
}

// undefined si no hay carrito, expiró o ya se pagó (convertido).
export async function getCart(): Promise<Cart | undefined> {
  const id = await cartIdFromCookie();
  if (!id) return undefined;
  const res = await shopFetch<{ cart: ShopCart }>(`/carts/${id}`);
  if (!res || res.cart.status !== "active") return undefined;
  return toCart(res.cart);
}

export function createCart(attributes?: CartAttribute[]): Promise<Cart> {
  return cartMutation("/carts", "POST", attributesToFields(attributes));
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
  cartId?: string,
): Promise<Cart> {
  const id = await requireCartId(cartId);
  let cart: Cart | undefined;
  for (const line of lines) {
    const { sku, fulfillment } = parseVariantId(line.merchandiseId);
    cart = await cartMutation(`/carts/${id}/items`, "POST", {
      sku,
      quantity: line.quantity,
      fulfillment,
    });
  }
  return cart ?? (await getCart())!;
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const id = await requireCartId();
  let cart: Cart | undefined;
  for (const lineId of lineIds) {
    cart = await cartMutation(`/carts/${id}/items/${encodeURIComponent(lineId)}`, "DELETE");
  }
  return cart ?? (await getCart())!;
}

// Cambia cantidad y, si cambió la variante, el tipo de entrega del renglón.
export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const id = await requireCartId();
  let cart: Cart | undefined;
  for (const line of lines) {
    const { fulfillment } = parseVariantId(line.merchandiseId);
    cart = await cartMutation(`/carts/${id}/items/${encodeURIComponent(line.id)}`, "PATCH", {
      quantity: line.quantity,
      fulfillment,
    });
  }
  return cart ?? (await getCart())!;
}

export async function updateCartAttributes(
  attributes: CartAttribute[],
  cartId?: string,
): Promise<Cart> {
  const id = await requireCartId(cartId);
  return cartMutation(`/carts/${id}`, "PATCH", attributesToFields(attributes));
}

// --- Checkout con Stripe (Fase 3) -------------------------------------------
// Stripe Checkout en modo `elements`: el backend abre la sesión y el sitio
// pinta el formulario de pago en /pago/<sessionId>, sin salir a Stripe.
// `returnUrl`: origen del sitio (solo para pagos que necesiten redirigir).
// El pedido solo se marca pagado desde el webhook del backend.

export type CheckoutSession = {
  orderId: number;
  sessionId: string;
  clientSecret: string;
};

// comprar → agendar: paga el carrito de la cookie.
export async function startCheckout(returnUrl: string): Promise<CheckoutSession> {
  const cartId = await requireCartId();
  const res = await shopFetch<CheckoutSession>("/checkout", {}, {
    method: "POST",
    body: { cartId, returnUrl },
  });
  return res!;
}

// agendar → pagar: liga de pago de una cotización (/pagar/<token>).
export type QuoteLink = {
  quoteId: number;
  clientName: string;
  branchCode: string;
  open: boolean;
  paid: boolean;
  lines: { title: string; quantity: number; totalCents: number }[];
  totalCents: number;
  paidCents: number;
  dueCents: number;
};

export async function getQuoteLink(token: string): Promise<QuoteLink | undefined> {
  if (!isValidCartId(token)) return undefined;
  const res = await shopFetch<{ link: QuoteLink }>(`/quote-links/${token}`);
  return res?.link;
}

export async function startQuoteCheckout(
  token: string,
  returnUrl: string,
): Promise<CheckoutSession> {
  const res = await shopFetch<CheckoutSession>(`/quote-links/${token}/checkout`, {}, {
    method: "POST",
    body: { returnUrl },
  });
  return res!;
}

// Página de pago (/pago/<sessionId>) y regreso a /agendar-cita.
export type CheckoutOrder = {
  orderId: number;
  kind: "cart" | "quote";
  status:
    | "pending_payment"
    | "paid"
    | "cancelled"
    | "expired"
    | "refunded"
    | "partially_refunded";
  quoteId: string | null;
  needsAppointment: boolean;
  hasDelivery: boolean;
  totalCents: number;
  expiresAt: string;
  customerName: string | null;
  customerEmail: string | null;
  lines: {
    title: string;
    quantity: number;
    unitPriceCents: number;
    fulfillment: Fulfillment | null;
  }[];
  // Solo mientras el pedido se puede pagar.
  clientSecret: string | null;
};

export async function getOrderBySession(sessionId: string): Promise<CheckoutOrder | undefined> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return undefined;
  const res = await shopFetch<{ order: CheckoutOrder }>(
    `/orders/by-session/${encodeURIComponent(sessionId)}`,
  );
  return res?.order;
}

// Nombre y email del formulario de pago (antes de confirmar).
export async function updateOrderContact(
  sessionId: string,
  contact: { name: string; email: string },
): Promise<void> {
  await shopFetch(
    `/orders/by-session/${encodeURIComponent(sessionId)}/contact`,
    {},
    { method: "PATCH", body: contact },
  );
}
