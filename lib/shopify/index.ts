import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "lib/constants";
import { isShopifyError } from "lib/type-guards";
import { ensureStartsWith } from "lib/utils";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
  revalidateTag,
} from "next/cache";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { getCartQuery } from "./queries/cart";
import { getCollectionQuery, getCollectionsQuery } from "./queries/collection";
import { getMenuQuery } from "./queries/menu";
import { getPageQuery, getPagesQuery } from "./queries/page";
import {
  getProductQuery,
  getProductRecommendationsQuery,
} from "./queries/product";
import {
  BackendImageOperation,
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation,
} from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;

const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

// Keep cartId as returned by Shopify (includes ?key=...)
function isValidCartId(id?: string): boolean {
  return !!id && id.startsWith("gid://shopify/Cart/") && id.includes("?key=");
}

export async function shopifyFetch<T>({
  headers,
  query,
  variables,
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": key,
        ...headers,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}
export async function backendFetch<T>({
  headers,
  variables,
  endpoint,
}: {
  headers?: HeadersInit;
  variables?: ExtractVariables<T>;
  endpoint: String;
}): Promise<{ status: number; body: T } | never> {
  try {
    // const backend_url = 'https://stg-back.yantissimo.com'
    const route = "/bypass/shopify";
    const backend_endpoint = `${backend_url + route + endpoint}`;
    const result = await fetch(backend_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Backend-bearer-token": "HNFEggYGyfFgjkhKHfdtdtfhlJugyfTd",
        ...headers,
      },
      body: JSON.stringify({
        ...(variables && { variables }),
      }),
    });

    const body = await result.json();
    // body = { body: { data: { products: [Array] } } }
    // console.debug(body);
    // console.dir(body, { depth: null })

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
      };
    }

    throw {
      error: e,
    };
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  // Ensure tax field
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: cart.cost.totalAmount.currencyCode,
    } as any;
  }

  // Fallbacks for line amounts and images using product data
  const edges = (cart.lines as any)?.edges ?? [];
  let computedSubtotal = 0;
  let currencyCode: string | undefined = undefined;

  for (const edge of edges) {
    const node = edge?.node;
    if (!node) continue;

    const lineQty = Number(node.quantity) || 0;
    const lineCost = node.cost?.totalAmount?.amount;
    const lineCurrency = node.cost?.totalAmount?.currencyCode;
    let amountNum = parseFloat(lineCost);

    // Establish currency preference order
    const productMinPrice = node?.merchandise?.product?.priceRange?.minVariantPrice;
    const fallbackAmountStr = productMinPrice?.amount;
    const fallbackCurrency = productMinPrice?.currencyCode || lineCurrency;

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      const fallbackAmountNum = parseFloat(fallbackAmountStr);
      if (Number.isFinite(fallbackAmountNum) && fallbackAmountNum > 0) {
        amountNum = fallbackAmountNum * (lineQty || 1);
        node.cost = node.cost || {};
        node.cost.totalAmount = {
          amount: amountNum.toString(),
          currencyCode: fallbackCurrency || "MXN",
        };
      }
    } else {
      amountNum = amountNum; // keep
    }

    if (!currencyCode) {
      currencyCode = node.cost?.totalAmount?.currencyCode || fallbackCurrency;
    }

    computedSubtotal += Number.isFinite(amountNum) ? amountNum : 0;

    // Ensure featured image exists: fallback to first product image
    const product = node?.merchandise?.product;
    if (product && !product?.featuredImage) {
      const firstImg = (product?.images?.edges?.[0]?.node) || null;
      if (firstImg) {
        product.featuredImage = firstImg;
      }
    }
  }

  // Recompute cart totals from lines if needed
  if (computedSubtotal > 0) {
    cart.cost.subtotalAmount = {
      amount: computedSubtotal.toString(),
      currencyCode: currencyCode || cart.cost.totalAmount.currencyCode,
    } as any;
    cart.cost.totalAmount = {
      amount: computedSubtotal.toString(),
      currencyCode: currencyCode || cart.cost.totalAmount.currencyCode,
    } as any;
  }

  return {
    ...(cart as any),
    lines: removeEdgesAndNodes(cart.lines as any),
  } as Cart;
};

const reshapeCollection = (
  collection: ShopifyCollection
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`,
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`,
    };
  });
};

export const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function createCart(): Promise<Cart> {
  const { cart } = await createCartWithLines([]);
  return cart;
}

export async function createCartWithLines(
  lines: {
    merchandiseId: string;
    quantity: number;
    sellingPlanId?: string;
  }[],
): Promise<{ cart: Cart; checkoutUrl: string }> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    variables: { lineItems: lines },
  });

  const cart = reshapeCart(res.body.data.cartCreate.cart);
  return { cart, checkoutUrl: cart.checkoutUrl };
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
  cartIdOverride?: string
): Promise<Cart> {
  const cookieId = (await cookies()).get("cartId")?.value;
  const cartId = cartIdOverride ?? cookieId!;
  console.debug("[lib][addToCart] Using cartId:", cartId);
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
  });
  try {
    console.debug("[lib][addToCart] raw body:", JSON.stringify(res.body));
  } catch {}
  console.debug(
    "[AddToCartOperation] response:",
    res.body?.data?.cartLinesAdd?.cart ?? null
  );
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
    },
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
    },
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  const cartId = (await cookies()).get("cartId")?.value;

  if (!cartId && !isValidCartId(cartId)) {
    return undefined;
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId: cartId! },
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    } as unknown as ShopifyCollectionOperation["variables"],
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  const res = await backendFetch<ShopifyCollectionProductsOperation>({
    endpoint: "/get/collection",
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "UPDATED_AT" : sortKey,
    },
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products)
  );
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery,
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: new Date().toISOString(),
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith("hidden")
    ),
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  return (
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: item.url
        .replace(domain, "")
        .replace("/collections", "/search")
        .replace("/pages", ""),
    })) || []
  );
}

export async function getPage(handle: string): Promise<Page> {
  const res = await shopifyFetch<ShopifyPageOperation>({
    query: getPageQuery,
    variables: { handle },
  });

  return res.body.data.pageByHandle;
}

export async function getPages(): Promise<Page[]> {
  const res = await shopifyFetch<ShopifyPagesOperation>({
    query: getPagesQuery,
  });

  return removeEdgesAndNodes(res.body.data.pages);
}

export async function _getProduct(
  handle: string
): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  const res_2 = await backendFetch<BackendImageOperation>({
    endpoint: "/get/image",
    variables: {
      handle,
    },
  });
  const product = res.body.data.product;
  const image = res_2.body?.data?.product?.image;
  const newFeaturedImage: Image = {
    url: image,
    altText: product.title,
    width: 800,
    height: 800,
  };
  // reemplace featuredImage con image
  if (image) {
    product.featuredImage = newFeaturedImage;
    product.images.edges = [
      { node: newFeaturedImage },
      ...product.images.edges,
    ];
  }
  console.log({ product });

  return reshapeProduct(product, false);
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  // -------------------------------------------------------
  // Bloque de interés
  // -------------------------------------------------------
  const res = await backendFetch<ShopifyProductOperation>({
    endpoint: "/get/product",
    variables: {
      handle,
    },
  });
  const product = res.body.data.product;

  const reshaped = reshapeProduct(product, false);
  console.dir(reshaped, { depth: null });
  return reshaped;
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  // If the productId is not a Shopify GID, skip recommendations gracefully.
  // Backend returns IDs like "gid://yssm/Product/..." which are invalid for Shopify API.
  if (!productId?.startsWith("gid://shopify/")) {
    return [];
  }

  try {
    const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
      query: getProductRecommendationsQuery,
      variables: {
        productId,
      },
    });

    return reshapeProducts(res.body.data.productRecommendations);
  } catch (e) {
    // Do not fail the product page if recommendations are unavailable.
    return [];
  }
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  // -------------------------------------------------------
  // Bloque de interés
  // -------------------------------------------------------
  const res = await backendFetch<ShopifyProductsOperation>({
    endpoint: "/get/products",
    variables: {
      query,
      reverse,
      sortKey,
    },
  });
  console.log("data:", res.body.data);

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, { expire: 0 });
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, { expire: 0 });
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
