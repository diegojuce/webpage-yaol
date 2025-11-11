import { backendFetch, reshapeProduct } from "./index";
import {
    Product,
    ShopifyProductOperation
} from "./types";
  
export async function getProduct(handle: string): Promise<Product | undefined> {
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
  console.log({ product });

  return reshapeProduct(product, false);
}