const DEFAULT_WHEEL_SIZE_API_BASE_URL = "https://api.wheel-size.com/v2";
const DEFAULT_WHEEL_SIZE_REGION = "mxndm";
const MAX_TIRE_SIZES_PER_QUERY = 10;

type WheelSizeApiListResponse<T> = {
  data?: T[];
};

type WheelSizeCatalogRecord = {
  slug?: string | number;
  name?: string | number;
  name_en?: string;
};

type WheelSizeSearchByModelRecord = {
  wheels?: Array<{
    front?: { tire?: string };
    rear?: { tire?: string };
  }>;
};

export type VehicleMakeOption = {
  slug: string;
  name: string;
};

export type VehicleModelOption = {
  slug: string;
  name: string;
};

export type VehicleYearOption = {
  slug: string;
  name: string;
};

export type VehicleTireSearchResponse = {
  sizes: string[];
  source: "wheel-size-v2";
  region: string;
};

export class VehicleFitmentError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "VehicleFitmentError";
    this.status = status;
  }
}

const normalizeBaseUrl = () => {
  const raw = (
    process.env.WHEEL_SIZE_API_BASE_URL || DEFAULT_WHEEL_SIZE_API_BASE_URL
  ).trim();
  return raw.replace(/\/+$/, "");
};

const getDefaultRegion = () =>
  (process.env.WHEEL_SIZE_REGION_DEFAULT || DEFAULT_WHEEL_SIZE_REGION)
    .trim()
    .toLowerCase();

const getApiKey = () => {
  const apiKey = process.env.WHEEL_SIZE_API_KEY?.trim();
  if (!apiKey) {
    throw new VehicleFitmentError(
      "WHEEL_SIZE_API_KEY no está configurada en el servidor.",
      503,
    );
  }

  return apiKey;
};

const asRecordArray = <T>(value: unknown): T[] => {
  if (!Array.isArray(value)) return [];
  return value as T[];
};

const normalizeCatalogRecords = (
  data: WheelSizeCatalogRecord[] | undefined,
): Array<{ slug: string; name: string }> => {
  if (!data?.length) return [];

  const uniqueBySlug = new Map<string, { slug: string; name: string }>();

  for (const item of data) {
    const slug = String(item.slug ?? "").trim();
    if (!slug) continue;

    const preferredName = String(item.name ?? item.name_en ?? slug).trim();
    if (!preferredName) continue;

    uniqueBySlug.set(slug, { slug, name: preferredName });
  }

  return Array.from(uniqueBySlug.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
  );
};

const normalizeYears = (
  data: WheelSizeCatalogRecord[] | undefined,
): VehicleYearOption[] => {
  if (!data?.length) return [];

  const uniqueYears = new Set<string>();

  for (const item of data) {
    const yearCandidate = String(item.slug ?? item.name ?? "").trim();
    if (!/^\d{4}$/.test(yearCandidate)) continue;
    uniqueYears.add(yearCandidate);
  }

  return Array.from(uniqueYears)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({ slug: year, name: year }));
};

const normalizeTireSize = (raw: string | undefined): string | null => {
  if (!raw) return null;

  // Keep only basic metric format understood by current storefront search.
  const compact = raw.toUpperCase().replace(/\s+/g, "");
  const match = compact.match(/(\d{2,3})\/(\d{2})(?:ZR|RF|R|D)?(\d{2})/);

  if (!match) return null;

  const width = match[1];
  const aspectRatio = match[2];
  const rim = match[3];

  if (!width || !aspectRatio || !rim) return null;

  return `${width}/${aspectRatio} R${rim}`;
};

const buildRequestUrl = (
  endpoint: string,
  params: Record<string, string | number | undefined>,
) => {
  const url = new URL(`${normalizeBaseUrl()}${endpoint}`);
  url.searchParams.set("user_key", getApiKey());

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const normalizedValue = String(value).trim();
    if (!normalizedValue) continue;
    url.searchParams.set(key, normalizedValue);
  }

  return url;
};

const readErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;
  const maybeError = payload as Record<string, unknown>;

  const detail = maybeError.detail;
  if (typeof detail === "string" && detail.trim()) return detail.trim();

  const message = maybeError.message;
  if (typeof message === "string" && message.trim()) return message.trim();

  return null;
};

const fetchWheelSizeApi = async <T>({
  endpoint,
  params,
}: {
  endpoint: string;
  params: Record<string, string | number | undefined>;
}): Promise<T> => {
  const url = buildRequestUrl(endpoint, params);
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const raw = await response.text();
  let payload: unknown = {};

  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      throw new VehicleFitmentError(
        "Respuesta inválida del proveedor de fitment.",
        502,
      );
    }
  }

  if (!response.ok) {
    const providerMessage = readErrorMessage(payload);
    throw new VehicleFitmentError(
      providerMessage || "No fue posible consultar la base de fitment.",
      response.status,
    );
  }

  return payload as T;
};

export const listVehicleMakes = async (
  region = getDefaultRegion(),
): Promise<VehicleMakeOption[]> => {
  const response = await fetchWheelSizeApi<
    WheelSizeApiListResponse<WheelSizeCatalogRecord>
  >({
    endpoint: "/makes/",
    params: { region, ordering: "slug" },
  });

  return normalizeCatalogRecords(response.data);
};

export const listVehicleModels = async ({
  make,
  region = getDefaultRegion(),
}: {
  make: string;
  region?: string;
}): Promise<VehicleModelOption[]> => {
  const response = await fetchWheelSizeApi<
    WheelSizeApiListResponse<WheelSizeCatalogRecord>
  >({
    endpoint: "/models/",
    params: { make, region, ordering: "slug" },
  });

  return normalizeCatalogRecords(response.data);
};

export const listVehicleYears = async ({
  make,
  model,
  region = getDefaultRegion(),
}: {
  make: string;
  model: string;
  region?: string;
}): Promise<VehicleYearOption[]> => {
  const response = await fetchWheelSizeApi<
    WheelSizeApiListResponse<WheelSizeCatalogRecord>
  >({
    endpoint: "/years/",
    params: { make, model, region, ordering: "-slug" },
  });

  return normalizeYears(response.data);
};

export const searchVehicleTireSizes = async ({
  make,
  model,
  year,
  region = getDefaultRegion(),
  maxSizes = MAX_TIRE_SIZES_PER_QUERY,
}: {
  make: string;
  model: string;
  year: string;
  region?: string;
  maxSizes?: number;
}): Promise<VehicleTireSearchResponse> => {
  const response = await fetchWheelSizeApi<
    WheelSizeApiListResponse<WheelSizeSearchByModelRecord>
  >({
    endpoint: "/search/by_model/",
    params: { make, model, year, region },
  });

  const uniqueSizes = new Set<string>();
  const entries = asRecordArray<WheelSizeSearchByModelRecord>(response.data);

  for (const entry of entries) {
    const wheelPairs = asRecordArray<{
      front?: { tire?: string };
      rear?: { tire?: string };
    }>(entry.wheels);

    for (const wheelPair of wheelPairs) {
      const normalizedFront = normalizeTireSize(wheelPair.front?.tire);
      if (normalizedFront) uniqueSizes.add(normalizedFront);

      if (uniqueSizes.size >= maxSizes) break;

      const normalizedRear = normalizeTireSize(wheelPair.rear?.tire);
      if (normalizedRear) uniqueSizes.add(normalizedRear);

      if (uniqueSizes.size >= maxSizes) break;
    }

    if (uniqueSizes.size >= maxSizes) break;
  }

  return {
    sizes: Array.from(uniqueSizes).slice(0, maxSizes),
    source: "wheel-size-v2",
    region,
  };
};
