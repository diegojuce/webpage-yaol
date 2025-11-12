import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT
} from "lib/constants";
import { isShopifyError } from "lib/type-guards";
import { ensureStartsWith } from "lib/utils";
import {
  getProductQuery
} from "./queries/product";
import {
  BackendImageOperation,
  Connection,
  Image,
  Product,
  ShopifyProduct,
  ShopifyProductOperation,
} from "./types";
const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}`;
const BACKEND_URL = process.env.SHOPIFY_BACKEND_URL || "http://localhost:3050";
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
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
  filterHiddenProducts: boolean = true,
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }
  
  const { images, variants, ...rest } = product;

  const toreturn = {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
  };
  return toreturn;
};

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
    // const BACKEND_URL = 'https://stg-back.yantissimo.com'
    const route = "/bypass/shopify";
    const backend_endpoint = `${BACKEND_URL + route + endpoint}`;
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
    throw {
      error: e,
    };
  }
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

export async function getRawProduct(handle: string): Promise<Product | undefined> {
  // -------------------------------------------------------
  // Bloque de interés
  // -------------------------------------------------------
  const res = await backendFetch<ShopifyProductOperation>({
    endpoint: "/get/raw-product",
    variables: {
      handle,
    },
  });
  const product = res.body.data.product;
  
  const reshapedProduct = reshapeProduct(product, false);
  console.log('reshapedProduct: ', reshapedProduct);
  return reshapedProduct;
}

export async function _getProduct(
  handle: string,
): Promise<Product | undefined> {

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