import {
  HIDDEN_PRODUCT_TAG
} from "lib/constants";
import {
  Connection,
  Image,
  Product,
  ShopifyProduct,
  ShopifyProductOperation
} from "./types";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3050";

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