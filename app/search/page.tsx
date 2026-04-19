import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import Collections from "components/layout/search/collections";
import FilterList from "components/layout/search/filter";
import PanelSearchForm from "components/layout/search/panel-search-form";
import SizeChipsSelector from "components/layout/search/size-chips-selector";
import { defaultSort, sorting } from "lib/constants";
import { getProducts } from "lib/shopify";
import { Product } from "lib/shopify/types";

export const metadata = {
  title: "Buscar",
  description: "Busca productos en la tienda.",
};

const parseFirstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const normalizeVehicleSize = (value: string | undefined) => {
  if (!value) return null;
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

const mergeUniqueSizes = (first: string[], second: string[]) => {
  const unique = new Set<string>();
  for (const size of first) unique.add(size);
  for (const size of second) unique.add(size);
  return Array.from(unique);
};

const orderSelectedSizes = (selected: string[], available: string[]) => {
  const selectedSet = new Set(selected);
  return available.filter((size) => selectedSet.has(size));
};

const NEAR_WIDTH_MIN = 135;
const NEAR_WIDTH_MAX = 325;
const NEAR_HEIGHT_MIN = 30;
const NEAR_HEIGHT_MAX = 90;
const NEARBY_LIMIT = 8;
const WIDTH_DELTAS = [-10, 10, -20, 20];
const HEIGHT_DELTAS = [-5, 5, -10, 10];

type ParsedSizeParts = {
  width: number;
  height: number;
  rim: number;
};

const parseSizeParts = (size: string): ParsedSizeParts | null => {
  const normalized = normalizeVehicleSize(size);
  if (!normalized) return null;
  const match = normalized.match(/^(\d{2,3})\/(\d{2})\sR(\d{1,2})$/);
  if (!match) return null;

  const width = Number(match[1]);
  const height = Number(match[2]);
  const rim = Number(match[3]);

  if (
    Number.isNaN(width) ||
    Number.isNaN(height) ||
    Number.isNaN(rim) ||
    width < NEAR_WIDTH_MIN ||
    width > NEAR_WIDTH_MAX ||
    height < NEAR_HEIGHT_MIN ||
    height > NEAR_HEIGHT_MAX
  ) {
    return null;
  }

  return { width, height, rim };
};

const buildNearbySizes = (baseSize: string, maxSuggestions = NEARBY_LIMIT) => {
  const parsedBase = parseSizeParts(baseSize);
  if (!parsedBase) return [];

  const candidates: Array<{
    size: string;
    score: number;
    widthDistance: number;
    heightDistance: number;
  }> = [];

  for (const widthDelta of WIDTH_DELTAS) {
    const nextWidth = parsedBase.width + widthDelta;
    if (nextWidth < NEAR_WIDTH_MIN || nextWidth > NEAR_WIDTH_MAX) continue;

    for (const heightDelta of HEIGHT_DELTAS) {
      const nextHeight = parsedBase.height + heightDelta;
      if (nextHeight < NEAR_HEIGHT_MIN || nextHeight > NEAR_HEIGHT_MAX) {
        continue;
      }

      const nextSize = `${nextWidth}/${nextHeight} R${parsedBase.rim}`;
      if (nextSize === baseSize) continue;

      candidates.push({
        size: nextSize,
        score: Math.abs(widthDelta) + Math.abs(heightDelta),
        widthDistance: Math.abs(widthDelta),
        heightDistance: Math.abs(heightDelta),
      });
    }
  }

  const uniqueBySize = new Map<string, (typeof candidates)[number]>();
  for (const candidate of candidates) {
    const existing = uniqueBySize.get(candidate.size);
    if (!existing || candidate.score < existing.score) {
      uniqueBySize.set(candidate.size, candidate);
    }
  }

  return Array.from(uniqueBySize.values())
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      if (a.widthDistance !== b.widthDistance) {
        return a.widthDistance - b.widthDistance;
      }
      if (a.heightDistance !== b.heightDistance) {
        return a.heightDistance - b.heightDistance;
      }
      return a.size.localeCompare(b.size, "es", { sensitivity: "base" });
    })
    .slice(0, maxSuggestions)
    .map((candidate) => candidate.size);
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
  const normalizedSearchMeasure = normalizeVehicleSize(searchValue);
  const searchMode = parseFirstParam(searchParams?.by);
  const vehicleMake = parseFirstParam(searchParams?.make);
  const vehicleModel = parseFirstParam(searchParams?.model);
  const vehicleYear = parseFirstParam(searchParams?.year);
  const sizesParam = parseFirstParam(searchParams?.sizes);
  const availableSizesParam = parseFirstParam(searchParams?.availableSizes);
  const parsedSelectedSizes = parseVehicleSizes(sizesParam);
  const parsedAvailableSizes = parseVehicleSizes(availableSizesParam);

  let sizeSearchMode: "vehicle" | "measure" | null = null;
  let selectedSizes: string[] = [];
  let availableSizes: string[] = [];

  if (searchMode === "vehicle") {
    sizeSearchMode = "vehicle";
    selectedSizes = parsedSelectedSizes.slice(0, 1);
    availableSizes =
      parsedAvailableSizes.length > 0
        ? parsedAvailableSizes
        : parsedSelectedSizes;

    if (selectedSizes.length === 0 && availableSizes.length > 0) {
      selectedSizes = [availableSizes[0] ?? ""].filter(Boolean);
    }
  } else if (searchMode === "measure") {
    sizeSearchMode = "measure";
    selectedSizes = (
      parsedSelectedSizes.length > 0
        ? parsedSelectedSizes
        : normalizedSearchMeasure
          ? [normalizedSearchMeasure]
          : []
    ).slice(0, 1);
    availableSizes =
      parsedAvailableSizes.length > 0
        ? parsedAvailableSizes
        : [...selectedSizes];

    if (selectedSizes.length === 0 && availableSizes.length > 0) {
      selectedSizes = [availableSizes[0] ?? ""].filter(Boolean);
    }
  } else if (normalizedSearchMeasure) {
    sizeSearchMode = "measure";
    selectedSizes = (
      parsedSelectedSizes.length > 0
        ? parsedSelectedSizes
        : [normalizedSearchMeasure]
    ).slice(0, 1);
    availableSizes =
      parsedAvailableSizes.length > 0
        ? parsedAvailableSizes
        : [...selectedSizes];
  }

  availableSizes = mergeUniqueSizes(availableSizes, selectedSizes);
  selectedSizes = orderSelectedSizes(selectedSizes, availableSizes);
  selectedSizes = selectedSizes.slice(0, 1);

  if (
    sizeSearchMode === "measure" &&
    selectedSizes.length === 1 &&
    availableSizes.length <= 1
  ) {
    availableSizes = mergeUniqueSizes(
      availableSizes,
      buildNearbySizes(selectedSizes[0] ?? "", NEARBY_LIMIT),
    );
    selectedSizes = orderSelectedSizes(selectedSizes, availableSizes);
  }

  if (selectedSizes.length === 0 || availableSizes.length === 0) {
    sizeSearchMode = null;
    selectedSizes = [];
    availableSizes = [];
  }

  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  const queriesToRun =
    selectedSizes.length > 0 ? selectedSizes : searchValue ? [searchValue] : [];

  const productGroups = await Promise.all(
    queriesToRun.map((query) => getProducts({ sortKey, reverse, query })),
  );

  const products = dedupeProducts(productGroups.flat());
  const resultsText = products.length > 1 ? "resultados" : "resultado";
  const hasProducts = products.length > 0;
  const isVehicleSearch = sizeSearchMode === "vehicle";
  const isMeasureSizesSearch = sizeSearchMode === "measure";
  const vehicleLabel =
    `${humanizeSlug(vehicleMake)} ${humanizeSlug(vehicleModel)} ${vehicleYear || ""}`.trim();
  const primaryMeasureLabel = selectedSizes[0] ?? normalizedSearchMeasure ?? "";

  return (
    <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-10 text-black dark:text-white mt-35">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full flex-none lg:max-w-[240px]">
          <div className="hidden space-y-3 md:block lg:sticky lg:top-24">
            <PanelSearchForm />
            <div className="rounded-[14px] border border-[#1e1e1e] bg-[#161616] p-[18px]">
              <FilterList list={sorting} title="Ordenar por" />
            </div>
            <div className="rounded-[14px] border border-[#1e1e1e] bg-[#161616] p-[18px]">
              <Collections />
            </div>
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
                ({availableSizes.length} medidas detectadas)
              </span>
            </p>
          ) : isMeasureSizesSearch ? (
            <p className="mb-4 text-sm md:text-base">
              {hasProducts
                ? `Mostrando ${products.length} ${resultsText} para `
                : "No hay productos que coincidan con "}
              <span className="font-semibold">
                &quot;{primaryMeasureLabel}&quot;
              </span>
              {availableSizes.length > 1 ? (
                <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                  ({availableSizes.length - 1} medidas cercanas disponibles)
                </span>
              ) : null}
            </p>
          ) : searchValue ? (
            <p className="mb-4 text-sm md:text-base">
              {hasProducts
                ? `Mostrando ${products.length} ${resultsText} para `
                : "No hay productos que coincidan con "}
              <span className="font-semibold">&quot;{searchValue}&quot;</span>
            </p>
          ) : null}
          {sizeSearchMode ? (
            <SizeChipsSelector
              mode={sizeSearchMode}
              selectedSizes={selectedSizes}
              availableSizes={availableSizes}
              className="mb-5"
            />
          ) : null}
          {hasProducts ? (
            <Grid className="grid-cols-1 gap-6 xl:gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
