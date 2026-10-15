import { getCollections, getProducts } from "lib/commerce";
import { baseUrl, validateEnvironmentVariables } from "lib/utils";
import { MetadataRoute } from "next";

type Route = {
  url: string;
  lastModified: string;
};

export const revalidate = 3600;

const SITEMAP_FETCH_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`[sitemap] ${label} timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

// Sitemap <lastmod> must be W3C Datetime / ISO 8601. Upstream sources sometimes
// return localized strings (e.g. "23/05") which Google rejects — fall back to
// "now" so the entry stays valid instead of poisoning the whole sitemap.
function toIsoDate(value: unknown): string {
  if (typeof value === "string" || value instanceof Date) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routesMap = [
    "",
    "/nosotros",
    "/servicios",
    "/ubicaciones",
    "/contacto",
    "/agendar",
    "/club",
    "/politica-privacidad",
    "/privacy-advice",
    "/return-policy",
    "/shipping-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Sin variables del backend el sitemap sale solo con las páginas fijas, en
  // lugar de tumbar el build (el sitemap se prerenderiza al compilar).
  try {
    validateEnvironmentVariables();
  } catch (error) {
    console.error("[sitemap] catálogo omitido:", error);
    return routesMap;
  }

  // Each source is isolated: a failing or slow source yields [] instead of
  // taking down the whole sitemap (keeps the endpoint at 200 with the rest).
  const safe = async (
    label: string,
    fn: () => Promise<Route[]>,
  ): Promise<Route[]> => {
    try {
      return await withTimeout(fn(), SITEMAP_FETCH_TIMEOUT_MS, label);
    } catch (error) {
      console.error("[sitemap] source failed:", error);
      return [];
    }
  };

  const collectionsPromise = safe("collections", async () =>
    (await getCollections()).map((collection) => ({
      url: `${baseUrl}${collection.path}`,
      lastModified: toIsoDate(collection.updatedAt),
    })),
  );

  const productsPromise = safe("products", async () =>
    (await getProducts({})).map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: toIsoDate(product.updatedAt),
    })),
  );

  const fetchedRoutes = (
    await Promise.all([collectionsPromise, productsPromise])
  ).flat();

  return [...routesMap, ...fetchedRoutes];
}
