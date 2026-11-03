import type { Product } from "lib/commerce/types";

// Imagen que pone el backend (DEFAULT_IMAGE_URL en shop.service.js) cuando
// un producto no tiene foto. Debe ser la misma URL en ambos lados.
export const DEFAULT_IMAGE_URL =
  "https://static.vecteezy.com/system/resources/previews/008/730/042/non_2x/car-rim-and-tire-linear-icon-thin-line-illustration-automobile-wheel-contour-symbol-isolated-outline-drawing-vector.jpg";

// Fotos de "IMAGE COMING SOON" guardadas en el bucket de imágenes con
// nombre de llanta; se usan como relleno en varios productos.
const COMING_SOON_IMAGE_URLS = new Set([
  "https://f004.backblazeb2.com/file/imagenes-llantas/falken-wildpeak-a-t3w_001.jpg",
]);

const isPlaceholderUrl = (url: string) =>
  url === DEFAULT_IMAGE_URL || COMING_SOON_IMAGE_URLS.has(url);

// true si el producto trae al menos una foto propia (no un placeholder).
export function hasRealImage(product: Product): boolean {
  const urls = [product.featuredImage?.url, ...(product.images ?? []).map((i) => i?.url)];
  return urls.some((url) => !!url && !isPlaceholderUrl(url));
}
