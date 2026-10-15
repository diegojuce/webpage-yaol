import type { ProductVariant } from "./types";

export const normalizeVariantId = (id: unknown): string | undefined => {
  if (typeof id === "string") {
    return id;
  }

  if (!id || typeof id !== "object") {
    return undefined;
  }

  const record = id as {
    variantId?: unknown;
    id?: unknown;
    gid?: unknown;
  };

  if (typeof record.variantId === "string") {
    return record.variantId;
  }

  if (typeof record.id === "string") {
    return record.id;
  }

  if (typeof record.gid === "string") {
    return record.gid;
  }

  return undefined;
};

// Variantes del producto de un renglón del carrito. El carrito de Shopify las
// trae como Connection (edges/node); el nativo, como arreglo.
export const cartLineVariants = (product: unknown): ProductVariant[] => {
  const variants = (product as { variants?: unknown } | null)?.variants;
  if (Array.isArray(variants)) return variants as ProductVariant[];
  const edges = (variants as { edges?: { node: ProductVariant }[] } | undefined)?.edges;
  return Array.isArray(edges) ? edges.map((e) => e.node) : [];
};
