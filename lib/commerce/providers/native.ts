// Adaptador nativo: catálogo desde el backend propio (/bypass/shop) sin el
// formato de Shopify. El carrito nativo llega en la Fase 2.
import { TAGS } from "lib/constants";
import type {
  CategoryKind,
  Collection,
  Image,
  Money,
  Product,
  ProductAvailability,
} from "lib/commerce/types";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

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

class ShopFetchError extends Error {
  constructor(path: string, status: number) {
    super(`/bypass/shop${path} respondió ${status}`);
    this.name = "ShopFetchError";
  }
}

// null = 404. Cualquier otro error lanza.
async function shopFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T | null> {
  const url = new URL(`${BACKEND_URL}/bypass/shop${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.BACKEND_API_TOKEN ?? ""}` },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new ShopFetchError(path, res.status);
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
    // Un solo SKU por llanta: sin opciones que elegir.
    options: [],
    priceRange: {
      minVariantPrice: price,
      maxVariantPrice: compareAt ?? price,
    },
    variants: [
      {
        id: p.sku,
        title: p.title,
        availableForSale: p.available,
        quantityAvailable: p.stock.total,
        sku: p.supplierSku ?? undefined,
        selectedOptions: [
          { name: "Medida", value: p.size ?? "" },
          { name: "Rin", value: p.rim ?? "" },
          { name: "Marca", value: p.brand ?? "" },
        ],
        price,
        compareAtPrice: compareAt,
      },
    ],
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
