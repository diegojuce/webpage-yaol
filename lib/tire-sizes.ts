// Medidas de llanta (métricas, auto/SUV/camioneta) que sí se fabrican.
// Sirve para filtrar Ancho/Alto/Rin en el buscador y no ofrecer combinaciones
// imposibles. Formato: rin → ancho → altos (perfil) disponibles.
const TIRE_SIZES_BY_RIM: Record<number, Record<number, number[]>> = {
  13: {
    145: [70, 80],
    155: [65, 70, 80],
    165: [65, 70, 80],
    175: [60, 65, 70, 80],
    185: [60, 70, 80],
  },
  14: {
    155: [65],
    165: [60, 65, 70],
    175: [65, 70, 80],
    185: [55, 60, 65, 70, 80],
    195: [60, 65, 70, 80],
    205: [60, 70],
    215: [70],
  },
  15: {
    135: [80],
    145: [65],
    165: [60, 65],
    175: [55, 60, 65],
    185: [55, 60, 65],
    195: [45, 50, 55, 60, 65, 70],
    205: [50, 55, 60, 65, 70],
    215: [60, 65, 70, 75],
    225: [50, 60, 70, 75],
    235: [75],
    255: [70],
    265: [70, 75],
  },
  16: {
    185: [55],
    195: [45, 50, 55, 60],
    205: [45, 50, 55, 60, 65, 75],
    215: [45, 55, 60, 65, 70, 75, 85],
    225: [50, 55, 60, 65, 70, 75],
    235: [60, 65, 70, 75, 85],
    245: [70, 75],
    255: [65, 70],
    265: [70, 75],
    275: [70],
    285: [75],
    305: [70],
    315: [75],
  },
  17: {
    205: [40, 45, 50, 55],
    215: [40, 45, 50, 55, 60, 65],
    225: [45, 50, 55, 60, 65],
    235: [45, 55, 60, 65, 75, 80],
    245: [40, 45, 65, 70, 75],
    255: [40, 45, 60, 65, 70, 75],
    265: [65, 70],
    275: [65, 70],
    285: [70, 75],
    315: [70],
  },
  18: {
    215: [45, 55],
    225: [40, 45, 50, 55, 60],
    235: [40, 45, 50, 55, 60, 65],
    245: [40, 45, 50, 60],
    255: [35, 40, 45, 55, 60, 65, 70],
    265: [35, 60, 65, 70],
    275: [35, 40, 65, 70],
    285: [60, 65],
  },
  19: {
    225: [35, 40, 45, 55],
    235: [35, 40, 45, 50, 55],
    245: [35, 40, 45, 55],
    255: [35, 40, 45, 50, 55],
    265: [35, 50],
    275: [30, 35, 40, 45],
    285: [30, 45],
    295: [30],
  },
  20: {
    225: [35],
    235: [55],
    245: [30, 35, 40, 45, 50],
    255: [30, 35, 40, 45, 50, 55],
    265: [45, 50],
    275: [30, 35, 40, 45, 55, 60, 65],
    285: [30, 45, 50],
    295: [30, 35],
    305: [25],
    315: [35],
  },
  21: {
    245: [35],
    255: [40],
    265: [40, 45],
    275: [35, 40, 45],
    285: [45],
    295: [35],
  },
  22: {
    265: [40],
    275: [40],
    285: [35, 45],
    295: [30],
  },
};

export type TireSize = { width: number; height: number; rim: number };

export const TIRE_SIZES: TireSize[] = Object.entries(TIRE_SIZES_BY_RIM).flatMap(
  ([rim, byWidth]) =>
    Object.entries(byWidth).flatMap(([width, heights]) =>
      heights.map((height) => ({
        width: Number(width),
        height: Number(height),
        rim: Number(rim),
      }))
    )
);

const uniqueSorted = (values: number[]) =>
  Array.from(new Set(values)).sort((a, b) => a - b);

/** Anchos existentes (todos). */
export const tireWidths = () => uniqueSorted(TIRE_SIZES.map((s) => s.width));

/** Altos que existen para el ancho dado (o todos si no hay ancho). */
export const tireHeights = (width?: number) =>
  uniqueSorted(
    TIRE_SIZES.filter((s) => !width || s.width === width).map((s) => s.height)
  );

/** Rines que existen para el ancho y alto dados. */
export const tireRims = (width?: number, height?: number) =>
  uniqueSorted(
    TIRE_SIZES.filter(
      (s) => (!width || s.width === width) && (!height || s.height === height)
    ).map((s) => s.rim)
  );

/** El valor de `options` más cercano a `value` (para no dejar combinaciones inválidas). */
export const closestValue = (options: number[], value: number) =>
  options.reduce(
    (best, option) =>
      Math.abs(option - value) < Math.abs(best - value) ? option : best,
    options[0] ?? value
  );
