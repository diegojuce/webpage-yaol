import { NextRequest, NextResponse } from "next/server";
import {
  VehicleFitmentError,
  listVehicleMakes,
  listVehicleModels,
  listVehicleYears,
  searchVehicleTireSizes,
} from "lib/vehicle-fitment";

const CACHE_HEADERS_CATALOG = {
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
} as const;

const CACHE_HEADERS_SEARCH = {
  "Cache-Control": "no-store",
} as const;

const asNonEmptyString = (value: string | null) => value?.trim() || "";

const getFriendlyErrorMessage = (error: VehicleFitmentError) => {
  if (error.message.includes("WHEEL_SIZE_API_KEY")) {
    return "El buscador por auto no está configurado: falta WHEEL_SIZE_API_KEY en el servidor.";
  }

  if (error.status === 401 || error.status === 403) {
    return "No se pudo autenticar la consulta de fitment. Revisa la configuración de la API key.";
  }

  if (error.status === 429) {
    return "Límite de consultas alcanzado temporalmente. Intenta de nuevo en unos minutos.";
  }

  if (error.status >= 500) {
    return "El proveedor de fitment no está disponible en este momento.";
  }

  return error.message || "No fue posible completar la búsqueda de fitment.";
};

export async function GET(req: NextRequest) {
  const action = asNonEmptyString(req.nextUrl.searchParams.get("action"));
  const region = asNonEmptyString(req.nextUrl.searchParams.get("region"));
  const normalizedRegion = region.toLowerCase() || undefined;

  try {
    if (action === "makes") {
      const options = await listVehicleMakes(normalizedRegion);
      return NextResponse.json({ options }, { headers: CACHE_HEADERS_CATALOG });
    }

    if (action === "models") {
      const make = asNonEmptyString(req.nextUrl.searchParams.get("make"));
      if (!make) {
        return NextResponse.json(
          { error: "Debes enviar el parámetro make." },
          { status: 400, headers: CACHE_HEADERS_SEARCH },
        );
      }

      const options = await listVehicleModels({
        make,
        region: normalizedRegion,
      });
      return NextResponse.json({ options }, { headers: CACHE_HEADERS_CATALOG });
    }

    if (action === "years") {
      const make = asNonEmptyString(req.nextUrl.searchParams.get("make"));
      const model = asNonEmptyString(req.nextUrl.searchParams.get("model"));

      if (!make || !model) {
        return NextResponse.json(
          { error: "Debes enviar los parámetros make y model." },
          { status: 400, headers: CACHE_HEADERS_SEARCH },
        );
      }

      const options = await listVehicleYears({
        make,
        model,
        region: normalizedRegion,
      });
      return NextResponse.json({ options }, { headers: CACHE_HEADERS_CATALOG });
    }

    if (action === "tires") {
      const make = asNonEmptyString(req.nextUrl.searchParams.get("make"));
      const model = asNonEmptyString(req.nextUrl.searchParams.get("model"));
      const year = asNonEmptyString(req.nextUrl.searchParams.get("year"));

      if (!make || !model || !year) {
        return NextResponse.json(
          { error: "Debes enviar los parámetros make, model y year." },
          { status: 400, headers: CACHE_HEADERS_SEARCH },
        );
      }

      if (!/^\d{4}$/.test(year)) {
        return NextResponse.json(
          { error: "El parámetro year debe tener formato YYYY." },
          { status: 400, headers: CACHE_HEADERS_SEARCH },
        );
      }

      const result = await searchVehicleTireSizes({
        make,
        model,
        year,
        region: normalizedRegion,
      });

      return NextResponse.json(result, { headers: CACHE_HEADERS_SEARCH });
    }

    return NextResponse.json(
      {
        error:
          "Acción inválida. Usa action=makes|models|years|tires en /api/vehicle-fitment.",
      },
      { status: 400, headers: CACHE_HEADERS_SEARCH },
    );
  } catch (error) {
    if (error instanceof VehicleFitmentError) {
      return NextResponse.json(
        {
          error: getFriendlyErrorMessage(error),
          providerMessage: error.message,
        },
        { status: error.status || 500, headers: CACHE_HEADERS_SEARCH },
      );
    }

    return NextResponse.json(
      { error: "Error inesperado al consultar fitment." },
      { status: 500, headers: CACHE_HEADERS_SEARCH },
    );
  }
}
