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

const parseJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
};

const fetchVehicleFitment = async <T>(
  params: Record<string, string>,
): Promise<T> => {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(
    `/api/vehicle-fitment?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    const payload = await parseJson<{ error?: string }>(response);
    throw new Error(payload.error || "No fue posible consultar el fitment.");
  }

  return parseJson<T>(response);
};

export const fetchVehicleMakes = async () => {
  const payload = await fetchVehicleFitment<{ options: VehicleMakeOption[] }>({
    action: "makes",
  });

  return payload.options || [];
};

export const fetchVehicleModels = async (make: string) => {
  const payload = await fetchVehicleFitment<{ options: VehicleModelOption[] }>({
    action: "models",
    make,
  });

  return payload.options || [];
};

export const fetchVehicleYears = async (make: string, model: string) => {
  const payload = await fetchVehicleFitment<{ options: VehicleYearOption[] }>({
    action: "years",
    make,
    model,
  });

  return payload.options || [];
};

export const fetchVehicleTires = async ({
  make,
  model,
  year,
}: {
  make: string;
  model: string;
  year: string;
}) =>
  fetchVehicleFitment<VehicleTireSearchResponse>({
    action: "tires",
    make,
    model,
    year,
  });
