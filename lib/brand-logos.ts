// Logos de marcas en /public/images/brands (carrusel de portada y tarjetas).
export const BRANDS = [
  { name: "Michelin", file: "michelin.svg" },
  { name: "Goodyear", file: "goodyear.svg" },
  { name: "Bridgestone", file: "bridgestone.svg" },
  { name: "Pirelli", file: "pirelli.svg" },
  { name: "Continental", file: "continental.svg" },
  { name: "Yokohama", file: "yokohama.svg" },
  { name: "Hankook", file: "hankook.svg" },
  { name: "BFGoodrich", file: "bfgoodrich.svg" },
  { name: "Cooper Tires", file: "cooper.svg" },
  { name: "Nexen Tire", file: "nexen.svg" },
  { name: "Toyo Tires", file: "toyo.svg" },
  { name: "Kumho Tire", file: "kumho.svg" },
];

// Variantes mal escritas que llegan del catálogo.
const ALIASES: Record<string, string> = {
  michellin: "michelin.svg",
  conntinental: "continental.svg",
  contiental: "continental.svg",
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

// "BF GOODRICH", "Cooper Tires" o "TOYO" → ruta del logo; null si no hay.
export function getBrandLogo(brand: string | undefined): string | null {
  if (!brand) return null;
  const key = normalize(brand);
  if (!key) return null;
  const alias = ALIASES[key];
  if (alias) return `/images/brands/${alias}`;
  const match = BRANDS.find((b) => {
    const base = b.file.replace(".svg", "");
    return key.startsWith(base) || normalize(b.name) === key;
  });
  return match ? `/images/brands/${match.file}` : null;
}
