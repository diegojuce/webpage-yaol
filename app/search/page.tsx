import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import Collections from "components/layout/search/collections";
import FilterList from "components/layout/search/filter";
import PanelSearchForm from "components/layout/search/panel-search-form";
import { defaultSort, sorting } from "lib/constants";
import { getProducts } from "lib/shopify";
import { Product } from "lib/shopify/types";

export const metadata = {
  title: "Buscar",
  description: "Busca productos en la tienda.",
};

const parseFirstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeVehicleSize = (value: string) => {
  const match = value.match(
    /^\s*(\d{2,3})\s*\/\s*(\d{2})\s*[Rr]\s*(\d{1,2})\s*$/,
  );
  if (!match) return null;

  const width = match[1] ?? "";
  const height = match[2] ?? "";
  const rim = match[3] ?? "";

  if (!width || !height || !rim) return null;
  return `${width}/${height} R${rim}`;
};

const parseVehicleSizes = (sizesParam: string | undefined) => {
  if (!sizesParam) return [];

  const unique = new Set<string>();
  for (const raw of sizesParam.split(",")) {
    const normalized = normalizeVehicleSize(raw);
    if (normalized) unique.add(normalized);
  }

  return Array.from(unique);
};

const humanizeSlug = (value: string | undefined) => {
  if (!value) return "";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const dedupeProducts = (products: Product[]) => {
  const uniqueByKey = new Map<string, Product>();

  for (const product of products) {
    const key = product.handle || product.id;
    if (!uniqueByKey.has(key)) {
      uniqueByKey.set(key, product);
    }
  }

  return Array.from(uniqueByKey.values());
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const sort = parseFirstParam(searchParams?.sort);
  const searchValue = parseFirstParam(searchParams?.q);
  const searchMode = parseFirstParam(searchParams?.by);
  const vehicleMake = parseFirstParam(searchParams?.make);
  const vehicleModel = parseFirstParam(searchParams?.model);
  const vehicleYear = parseFirstParam(searchParams?.year);
  const vehicleSizes =
    searchMode === "vehicle"
      ? parseVehicleSizes(parseFirstParam(searchParams?.sizes))
      : [];

  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const queriesToRun =
    vehicleSizes.length > 0 ? vehicleSizes : searchValue ? [searchValue] : [];

  const productGroups = await Promise.all(
    queriesToRun.map((query) => getProducts({ sortKey, reverse, query })),
  );

  const products = dedupeProducts(productGroups.flat());
  const resultsText = products.length > 1 ? "resultados" : "resultado";
  const hasProducts = products.length > 0;
  const isVehicleSearch = vehicleSizes.length > 0;
  const vehicleLabel =
    `${humanizeSlug(vehicleMake)} ${humanizeSlug(vehicleModel)} ${vehicleYear || ""}`.trim();

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-10 text-black dark:text-white mt-35">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full flex-none lg:max-w-[240px]">
          <PanelSearchForm />
          <div className="space-y-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 lg:sticky lg:top-24">
            <FilterList list={sorting} title="Ordenar por" />
            <Collections />
          </div>
        </aside>
        <div className="flex-1">
          {isVehicleSearch ? (
            <p className="mb-4 text-sm md:text-base">
              {hasProducts
                ? `Mostrando ${products.length} ${resultsText} para `
                : "No hay productos que coincidan con "}
              <span className="font-semibold">&quot;{vehicleLabel}&quot;</span>
              <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                ({vehicleSizes.length} medidas detectadas)
              </span>
            </p>
          ) : searchValue ? (
            <p className="mb-4 text-sm md:text-base">
              {hasProducts
                ? `Mostrando ${products.length} ${resultsText} para `
                : "No hay productos que coincidan con "}
              <span className="font-semibold">&quot;{searchValue}&quot;</span>
            </p>
          ) : null}
          {hasProducts ? (
            <Grid className="grid-cols-1 gap-6 xl:gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ProductGridItems products={products} />
            </Grid>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              <p>
                {searchValue || isVehicleSearch
                  ? "Intenta ajustar tus filtros o término de búsqueda para encontrar lo que necesitas."
                  : "No pudimos encontrar productos para mostrar en este momento."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
