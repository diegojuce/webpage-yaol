import { getCollections, getPages, getProducts } from "lib/shopify";
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  validateEnvironmentVariables();

  const routesMap = [""].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

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
      lastModified: collection.updatedAt,
    })),
  );

  const productsPromise = safe("products", async () =>
    (await getProducts({})).map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: product.updatedAt,
    })),
  );

  const pagesPromise = safe("pages", async () =>
    (await getPages()).map((page) => ({
      url: `${baseUrl}/${page.handle}`,
      lastModified: page.updatedAt,
    })),
  );

  const fetchedRoutes = (
    await Promise.all([collectionsPromise, productsPromise, pagesPromise])
  ).flat();

  return [...routesMap, ...fetchedRoutes];
}
