// Plantillas del carrusel de la portada (Hero).
//
// Cada objeto de HERO_SLIDES es una "slide": rota cada HERO_SLIDE_SECONDS
// segundos. La imagen de fondo, el botón de búsqueda y las medidas populares
// NO cambian; solo cambia el contenido de aquí.
//
// Para agregar o quitar slides, agrega o borra objetos del arreglo; el
// contador ("01 / 03") y los puntos se ajustan solos.
//
// Colores: cualquier color CSS ("#FFC600", "white", "rgba(255,255,255,.75)").
// Si omites `color`, se usa el color por defecto indicado en cada campo.

export const HERO_SLIDE_SECONDS = 7;

export type HeroTitleLine = {
  /** Texto de la línea del título. */
  text: string;
  /** Color de la línea. Por defecto: blanco. */
  color?: string;
};

export type HeroSlide = {
  /** Etiqueta que aparece junto al contador arriba a la derecha ("01 / 03 · …"). */
  label: string;
  /** Texto pequeño en mayúsculas arriba del título. */
  eyebrow: string;
  /** Color del texto pequeño. Por defecto: amarillo claro (#FFD34A). */
  eyebrowColor?: string;
  /** Líneas del título grande; cada elemento es un renglón. */
  title: HeroTitleLine[];
  /** Párrafo debajo del título. */
  description: string;
  /** Color del párrafo. Por defecto: blanco al 75%. */
  descriptionColor?: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    label: "Hero · taller",
    eyebrow: "Yantissimo · Nueva tienda online",
    eyebrowColor: "#FFD34A",
    title: [
      { text: "Encuentra tu llanta" },
      { text: "en segundos.", color: "#FFC600" },
    ],
    description:
      "Cotiza y agenda en línea. Montaje + balanceo incluidos en las 7 sucursales.",
  },
  {
    label: "Meses",
    eyebrow: "Promo Especial - Nueva Tienda Online",
    eyebrowColor: "#FFD34A",
    title: [
      { text: "Promo por Tiempo limitado" },
      { text: "3 MSI.", color: "#FFC600" },
    ],
    description:
      "Aplica para compras en linea de minimo 2 llantas. ¡Aprovecha!",
  },
  {
    label: "Servicios incluidos",
    eyebrow: "Montaje, balanceo y nitrogeno",
    eyebrowColor: "#FFD34A",
    title: [
      { text: "Envio y Montaje" },
      { text: "Gratis", color: "#FFC600" },
    ],
    description:
      "La nueva experiencia de comprar llantas en línea. Compra tus llantas y nosotros nos encargamos del resto. ",
  },
  {
    label: "Club Yantissimo",
    eyebrow: "Promo por tiempo limitado",
    eyebrowColor: "#FFD34A",
    title: [
      { text: "Compra ya y te Regalamos:" },
      { text: "Club Yantissimo", color: "#FFC600" },
    ],
    description:
      "Nitrogeno ilimitado, Rotacion de llantas, 5% en mano de obra y Recordatorios de servicio.",
  },
];
