// URLs de /search para búsqueda por medida y por auto (mismos parámetros que
// lee app/search/page.tsx).

export const measureSearchUrl = (measure: string) => {
  const params = new URLSearchParams();
  params.set("q", measure);
  params.set("by", "measure");
  params.set("sizes", measure);
  params.set("availableSizes", measure);
  return `/search?${params.toString()}`;
};

export const vehicleSearchUrl = ({
  make,
  model,
  year,
  sizes,
}: {
  make: string;
  model: string;
  year: string;
  sizes: string[];
}) => {
  const params = new URLSearchParams();
  params.set("by", "vehicle");
  params.set("make", make);
  params.set("model", model);
  params.set("year", year);
  params.set("sizes", sizes.join(","));
  params.set("availableSizes", sizes.join(","));
  return `/search?${params.toString()}`;
};

/** Pantallas de celular: ahí se usa el buscador en panel inferior. */
export const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;
