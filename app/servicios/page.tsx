import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import { WhatsappIcon } from "components/yantissimo/icons";
import { whatsappHref, WHATSAPP_DISPLAY } from "lib/company";
import fs from "node:fs";
import Image from "components/safe-image";
import path from "node:path";
import type { CSSProperties } from "react";

export const metadata = {
  title: "Servicios · Llantera y taller automotriz | Yantissimo",
  description:
    "Afinación, alineación 3D, montaje, suspensión, frenos, balanceo y nitrógeno. Más de 80 servicios automotrices en Colima, Villa de Álvarez y Manzanillo.",
  alternates: { canonical: "/servicios" },
  openGraph: {
    title: "Servicios · Yantissimo",
    description:
      "7 líneas de servicio · 80+ trabajos · técnicos certificados.",
    url: "https://yantissimo.com/servicios",
    type: "website",
  },
};

// ────────────────────────────────────────────────────────────────────────────
// PHOTO RESOLUTION
// Drop images in /public/images/servicios/fotos/ with these basenames
// (.jpg / .jpeg / .webp / .png). If a file is found, it renders automatically;
// otherwise a stylized placeholder is shown. See README in that folder.
// ────────────────────────────────────────────────────────────────────────────
const PUBLIC_DIR = path.join(process.cwd(), "public");
const PHOTO_EXTS = [".jpg", ".jpeg", ".webp", ".png"];

function resolvePhoto(basename: string): string | null {
  for (const ext of PHOTO_EXTS) {
    const rel = `/images/servicios/fotos/${basename}${ext}`;
    try {
      if (fs.existsSync(path.join(PUBLIC_DIR, rel))) return rel;
    } catch {
      // ignore (e.g. read-only edge runtime)
    }
  }
  return null;
}

// Brand palette
const YELLOW = "#FFC600";
const YELLOW_DEEP = "#D19D00";
const INK = "#0F0F0F";
const PAPER = "#FAFAFA";
const RULE = "#E5E5E5";
const MUTED = "#3B3B3B";
const SUB = "#9EA0A3";

// Diagonal stripe pattern for "brown" bento cards
const STRIPE_BROWN_BG = "#2A1F18";
const STRIPE_BROWN_URL = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'><line x1='-2' y1='14' x2='14' y2='-2' stroke='rgba(255,255,255,0.06)' stroke-width='1.5'/><line x1='0' y1='16' x2='16' y2='0' stroke='rgba(255,255,255,0.06)' stroke-width='1.5'/></svg>")`;

// ────────────────────────────────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────────────────────────────────

type PillarVariant = "y" | "b" | "w" | "d";
type DeepDiveVariant = "yellow" | "brown" | "black" | "outline";

const pillars: {
  n: string;
  t: string;
  s: string;
  icon: string;
  href: string;
  count: string;
  v: PillarVariant;
}[] = [
  { n: "01", t: "AFINACIÓN", s: "Mayor y menor", icon: "service-afinacion.svg", href: "#afinacion", count: "10+ servicios", v: "y" },
  { n: "02", t: "ALINEACIÓN 3D", s: "Y escantillón", icon: "service-alineacion.svg", href: "#alineacion", count: "8 modalidades", v: "d" },
  { n: "03", t: "VENTA Y MONTAJE", s: "De llantas", icon: "service-llantas.svg", href: "#montaje", count: "Todas las medidas", v: "b" },
  { n: "04", t: "SUSPENSIÓN", s: "Y amortiguadores", icon: "service-suspension.svg", href: "#suspension", count: "12+ piezas", v: "w" },
  { n: "05", t: "FRENOS", s: "Y balatas", icon: "service-frenos.svg", href: "#frenos", count: "12+ servicios", v: "b" },
  { n: "06", t: "BALANCEO PRO", s: "Profesional", icon: "service-balanceo.svg", href: "#balanceo", count: "Acero · deportivo · off-road", v: "d" },
  { n: "07", t: "NITRÓGENO", s: "Recarga & rotación", icon: "service-nitrogeno.svg", href: "#balanceo", count: "Incluido en paquetes", v: "y" },
];

const paquetes: {
  tier: string;
  name: string;
  tagline: string;
  desc: string;
  includes: string[];
  variant: "outline" | "yellow" | "black";
  featured?: boolean;
}[] = [
  {
    tier: "01",
    name: "PAQUETE 1",
    tagline: "Mantenimiento esencial",
    desc: "Lo básico para mantener tu llanta sana entre temporadas.",
    includes: ["Revisión vehicular Yantissimo", "Rotación de las 4 llantas", "Recarga de nitrógeno"],
    variant: "outline",
  },
  {
    tier: "02",
    name: "PAQUETE 2",
    tagline: "Mantenimiento + balanceo",
    desc: "Suma balanceo profesional para eliminar vibraciones y desgaste irregular.",
    includes: ["Revisión vehicular Yantissimo", "Rotación de las 4 llantas", "Balanceo de las 4 llantas", "Recarga de nitrógeno"],
    variant: "yellow",
    featured: true,
  },
  {
    tier: "03",
    name: "PAQUETE 3",
    tagline: "Cuidado integral",
    desc: "Todo lo del paquete 2 más alineación 3D. El más completo para viajes largos.",
    includes: [
      "Revisión vehicular Yantissimo",
      "Rotación de las 4 llantas",
      "Balanceo de las 4 llantas",
      "Recarga de nitrógeno",
      "Alineación 3D",
    ],
    variant: "black",
  },
];

const sections: {
  id: string;
  n: string;
  icon: string;
  photoBase: string;
  photoVariant: DeepDiveVariant;
  eyebrow: string;
  title: React.ReactNode;
  titleText: string;
  intro: string;
  photoLabel: string;
  accentNote: string;
  items: { t: string; s: string }[];
}[] = [
  {
    id: "afinacion",
    n: "01",
    icon: "service-afinacion.svg",
    photoBase: "afinacion",
    photoVariant: "brown",
    eyebrow: "LÍNEA 01 · MOTOR",
    title: (
      <>
        AFINACIÓN
        <br />
        <span className="bg-[#FFC600] px-1 leading-[0.92] text-[#0F0F0F]">MAYOR</span> Y MENOR.
      </>
    ),
    titleText: "AFINACIÓN MAYOR Y MENOR",
    intro:
      "Mantenimiento programado del motor para extender su vida útil y mejorar el rendimiento. Trabajamos con refacciones originales y aceites de marcas líderes.",
    photoLabel: "Técnico cambiando aceite · taller AFINACIÓN",
    accentNote:
      "Incluye lavado de inyectores en laboratorio, limpieza de cuerpo de aceleración y revisión de niveles antes de entregar.",
    items: [
      { t: "Afinación menor", s: "Cambio de filtros y aceite" },
      { t: "Afinación mayor", s: "Carbuclean, boya, aflojatodo · 4, 6 u 8 cilindros" },
      { t: "Cambio de aceite motor", s: "Sintético, semi-sintético, mineral o diesel" },
      { t: "Aceite de transmisión", s: "ATF III, CVT o estándar" },
      { t: "Cambio de bujías", s: "Estándar, platino, doble platino o iridium" },
      { t: "Filtros completos", s: "Aceite, aire, cabina A/C, combustible y diesel" },
      { t: "Cambio de anticongelante", s: "Garrafa o litro · revisión de depósito" },
      { t: "Bandas y poleas", s: "Cambio y ajuste de accesorios" },
      { t: "Lavado de inyectores", s: "Servicio en laboratorio" },
      { t: "Empaques", s: "Múltiple de admisión, tapa de puntería" },
    ],
  },
  {
    id: "alineacion",
    n: "02",
    icon: "service-alineacion.svg",
    photoBase: "alineacion",
    photoVariant: "black",
    eyebrow: "LÍNEA 02 · GEOMETRÍA",
    title: (
      <>
        ALINEACIÓN <span className="bg-[#FFC600] px-1 leading-[0.92] text-[#0F0F0F]">3D</span>
        <br />
        DE PRECISIÓN.
      </>
    ),
    titleText: "ALINEACIÓN 3D DE PRECISIÓN",
    intro:
      "Alineación computarizada en 3D para corregir la geometría de tu auto, reducir el desgaste de llantas y darle estabilidad en carretera. Equipo de última generación.",
    photoLabel: "Equipo de alineación 3D en bahía",
    accentNote:
      "Hacemos alineación con caída de amortiguador y reprogramación del ángulo de giro cuando lo requiera el modelo.",
    items: [
      { t: "Alineación 3D", s: "Estándar para todos los autos" },
      { t: "Alineación 3D 2 ejes", s: "Eje delantero y trasero alineados" },
      { t: "Alineación con caída", s: "Incluye caída de amortiguador" },
      { t: "Reprogramación ángulo de giro", s: "Para sistemas electrónicos modernos" },
      { t: "Alineación escantillón", s: "Método tradicional, con o sin caída" },
      { t: "Alineación 2 llantas", s: "Servicio puntual delantero o trasero" },
      { t: "Alineación 4 llantas", s: "Cobertura completa" },
      { t: "Diagnóstico previo", s: "Revisión gratuita antes de ejecutar" },
    ],
  },
  {
    id: "montaje",
    n: "03",
    icon: "service-llantas.svg",
    photoBase: "montaje",
    photoVariant: "brown",
    eyebrow: "LÍNEA 03 · LLANTAS",
    title: (
      <>
        <span className="bg-[#FFC600] px-1 leading-[0.92] text-[#0F0F0F]">MONTAJE,</span> BALANCEO,
        <br />
        VÁLVULA Y NITRÓGENO.
      </>
    ),
    titleText: "MONTAJE, BALANCEO, VÁLVULA Y NITRÓGENO",
    intro:
      "El servicio completo cuando cambias llantas. Montamos, balanceamos, reemplazamos la válvula y cargamos nitrógeno. Disponible para todas las medidas y tipos de perfil.",
    photoLabel: "Llanta nueva sobre la balanceadora",
    accentNote:
      "Servicio especial para rin con aro de blindaje y modelos all-terrain o mud sin costo adicional.",
    items: [
      { t: 'MBVN pasajero 13" a 18"', s: "Auto compacto y sedán" },
      { t: 'MBVN pasajero 19" a 22"', s: "SUV y deportivos" },
      { t: "MBVN All-Terrain", s: "AT para camionetas" },
      { t: "MBVN Mud", s: "MT para off-road" },
      { t: "MBVN perfil bajo", s: "Llantas deportivas" },
      { t: "Aro de blindaje", s: "Instalación especializada" },
      { t: "Parche de reparación", s: "Pinchaduras estándar" },
      { t: "Servicio de paquetería", s: "Llantas que llegan de envío" },
    ],
  },
  {
    id: "suspension",
    n: "04",
    icon: "service-suspension.svg",
    photoBase: "suspension",
    photoVariant: "yellow",
    eyebrow: "LÍNEA 04 · SUSPENSIÓN",
    title: (
      <>
        <span className="bg-[#FFC600] px-1 leading-[0.92] text-[#0F0F0F]">SUSPENSIÓN</span> Y
        <br />
        AMORTIGUADORES.
      </>
    ),
    titleText: "SUSPENSIÓN Y AMORTIGUADORES",
    intro:
      "Reemplazo y ajuste de todo el tren de suspensión: amortiguadores, resortes, bujes, rótulas, terminales, baleros y soportes. Más de 90 piezas trabajadas a diario.",
    photoLabel: "Suspensión expuesta en el elevador",
    accentNote:
      "Incluye revisión vehicular Yantissimo de 30 minutos antes de cotizar, para diagnosticar exactamente qué necesita tu auto.",
    items: [
      { t: "Amortiguadores delanteros", s: "Macpherson o convencional" },
      { t: "Amortiguadores traseros", s: "Con o sin bástago" },
      { t: "Resortes", s: "Delanteros y traseros" },
      { t: "Bases de amortiguador", s: "Delantera y trasera" },
      { t: "Rótulas", s: "Superior e inferior" },
      { t: "Terminales", s: "Exterior e interior" },
      { t: "Baleros", s: "Maza, cardán, doble delantero / trasero" },
      { t: "Bujes", s: "Horquilla, cremallera, muelle, barra" },
      { t: "Junta homocinética", s: "Lado caja o lado rueda · 4×4" },
      { t: "Soportes de motor", s: "Frontal derecho, izquierdo y transmisión" },
      { t: "Cremallera", s: "Y gomas de cremallera" },
      { t: "Revisión vehicular", s: "Diagnóstico Yantissimo · 30 min" },
    ],
  },
  {
    id: "frenos",
    n: "05",
    icon: "service-frenos.svg",
    photoBase: "frenos",
    photoVariant: "brown",
    eyebrow: "LÍNEA 05 · SEGURIDAD",
    title: (
      <>
        <span className="bg-[#FFC600] px-1 leading-[0.92] text-[#0F0F0F]">FRENOS</span>
        <br />
        Y BALATAS.
      </>
    ),
    titleText: "FRENOS Y BALATAS",
    intro:
      "El sistema más importante de tu auto. Revisamos, ajustamos, rectificamos y cambiamos cada componente. Servicio compatible con sensores electrónicos y ABS.",
    photoLabel: "Disco de freno y balata nueva",
    accentNote:
      "Servicio de torno y rectificado de disco o tambor disponible en sitio, sin enviar la pieza fuera del taller.",
    items: [
      { t: "Balatas delanteras", s: "Cerámicas, semi-metálicas u orgánicas" },
      { t: "Balatas traseras", s: "Disco o tambor" },
      { t: "Balata de freno de mano", s: "Cambio y ajuste" },
      { t: "Discos de freno", s: "Cambio o rectificado" },
      { t: "Tambores", s: "Cambio o servicio de torno" },
      { t: "Caliper", s: "Cambio, buje y pernos" },
      { t: "Líquido de frenos", s: "Cambio y purgado" },
      { t: "Sensor ABS", s: "Y sensor de balata" },
      { t: "Cilindro / pistón", s: "Bomba y booster de frenos" },
      { t: "Kit de herrajes", s: "Reemplazo completo" },
      { t: "Chicote de frenos", s: "Cambio y ajuste" },
      { t: "Limpieza y ajuste", s: "Mantenimiento preventivo" },
    ],
  },
  {
    id: "balanceo",
    n: "06",
    icon: "service-balanceo.svg",
    photoBase: "balanceo",
    photoVariant: "black",
    eyebrow: "LÍNEA 06 · BALANCEO",
    title: (
      <>
        BALANCEO <span className="bg-[#FFC600] px-1 leading-[0.92] text-[#0F0F0F]">PRO</span>
        <br />
        Y NITRÓGENO.
      </>
    ),
    titleText: "BALANCEO PRO Y NITRÓGENO",
    intro:
      "Balanceo profesional para cualquier tipo de rin y recarga de nitrógeno para presión más estable, menor temperatura y mayor vida útil de tus llantas.",
    photoLabel: "Recarga de nitrógeno en estación",
    accentNote:
      "Si eres miembro del Club Yantissimo, la recarga de nitrógeno y la rotación van sin costo de por vida.",
    items: [
      { t: "Balanceo rin acero", s: "Rines convencionales" },
      { t: "Balanceo rin deportivo", s: "Aluminio y aleación" },
      { t: "Balanceo rin off-road", s: "Camionetas y SUV" },
      { t: "Recarga de nitrógeno", s: "Por llanta o set completo" },
      { t: "Rotación de llantas", s: "Patrón recomendado por fabricante" },
      { t: "Servicio de instalación", s: "Balanceo, válvula y nitrógeno" },
      { t: "Club Yantissimo", s: "Membresía con servicios gratis" },
      { t: "Revisión de presión", s: "Sin costo en cualquier sucursal" },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// JSON-LD
// ────────────────────────────────────────────────────────────────────────────
function buildServicesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: "Yantissimo",
    url: "https://yantissimo.com/servicios",
    telephone: "+5213122220099",
    areaServed: ["Colima", "Villa de Álvarez", "Manzanillo"],
    makesOffer: sections.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.titleText,
        description: s.intro,
      },
    })),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────────────────────

export default function ServiciosPage() {
  return (
    <div className="mt-28 min-h-screen bg-[#FAFAFA] text-[#0F0F0F]">
      <ScrollToTopOnMount behavior="auto" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildServicesJsonLd()) }}
      />

      <PillarsGrid />
      <Paquetes />
      {sections.map((s, i) => (
        <DeepDive key={s.id} {...s} flip={i % 2 === 1} />
      ))}
      <ClubBand />
      <Especiales />
      <CtaBand />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION: PILLARS
// ────────────────────────────────────────────────────────────────────────────

function PillarsGrid() {
  return (
    <section
      id="pilares"
      style={{ background: PAPER, padding: "80px 40px" }}
      className="px-6! py-16 md:px-10! md:py-20"
    >
      <header className="mx-auto mb-12 grid max-w-[1280px] items-end gap-8 md:grid-cols-[1.5fr_1fr] md:gap-12">
        <div>
          <p
            className="mb-3 text-xs font-bold uppercase"
            style={{ color: YELLOW_DEEP, letterSpacing: "0.22em" }}
          >
            Nuestros servicios · 07 líneas
          </p>
          <h2
            className="m-0 font-staatliches uppercase"
            style={{
              fontSize: "clamp(46px, 6.4vw, 96px)",
              lineHeight: 0.92,
              letterSpacing: "0.01em",
              fontWeight: 400,
              color: INK,
            }}
          >
            LO QUE{" "}
            <span
              className="inline-block"
              style={{
                background: YELLOW,
                color: INK,
                padding: "0 0.18em 0.04em",
                lineHeight: 0.92,
              }}
            >
              HACEMOS
            </span>
            <br />
            POR TU AUTO.
          </h2>
        </div>
        <p className="m-0 max-w-[420px] pb-3.5 text-[15px] leading-relaxed" style={{ color: MUTED }}>
          Siete líneas de servicio que cubren lo esencial del mantenimiento automotriz. Cada visita
          se diagnostica, se cotiza y se ejecuta por técnicos certificados.
        </p>
      </header>

      <div className="mx-auto mb-4 grid max-w-[1280px] gap-4 sm:grid-cols-2 md:grid-cols-4">
        {pillars.slice(0, 4).map((p) => (
          <Pillar key={p.n} {...p} />
        ))}
      </div>
      <div className="mx-auto grid max-w-[1280px] gap-4 sm:grid-cols-2 md:grid-cols-3">
        {pillars.slice(4).map((p) => (
          <Pillar key={p.n} {...p} />
        ))}
      </div>
    </section>
  );
}

function Pillar({
  n,
  t,
  s,
  icon,
  href,
  count,
  v,
}: {
  n: string;
  t: string;
  s: string;
  icon: string;
  href: string;
  count: string;
  v: PillarVariant;
}) {
  const variants = {
    y: {
      bg: YELLOW,
      bgImg: "none",
      fg: INK,
      mute: "rgba(15,15,15,0.65)",
      border: "none",
      iconFilter: "brightness(0)",
      accent: "rgba(15,15,15,0.15)",
      numColor: "rgba(15,15,15,0.55)",
    },
    b: {
      bg: INK,
      bgImg: "none",
      fg: "#fff",
      mute: SUB,
      border: "none",
      iconFilter: "brightness(0) invert(1)",
      accent: "rgba(255,255,255,0.1)",
      numColor: YELLOW,
    },
    w: {
      bg: "#FFFFFF",
      bgImg: "none",
      fg: INK,
      mute: SUB,
      border: `1px solid ${RULE}`,
      iconFilter: "brightness(0)",
      accent: RULE,
      numColor: SUB,
    },
    d: {
      bg: STRIPE_BROWN_BG,
      bgImg: STRIPE_BROWN_URL,
      fg: "#fff",
      mute: "#B7B9BC",
      border: "none",
      iconFilter: "brightness(0) invert(1)",
      accent: "rgba(255,255,255,0.1)",
      numColor: YELLOW,
    },
  }[v];

  return (
    <a
      href={href}
      style={{
        background: variants.bg,
        backgroundImage: variants.bgImg,
        color: variants.fg,
        border: variants.border,
        minHeight: 260,
      }}
      className="group relative flex flex-col overflow-hidden rounded-[22px] p-[26px_26px_24px] no-underline transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <span
          className="font-staatliches"
          style={{ fontSize: 14, letterSpacing: "0.14em", color: variants.numColor }}
        >
          {n}
        </span>
        <div className="inline-flex h-[60px] w-[60px] items-center justify-center">
          <img
            src={`/images/servicios/icons/${icon}`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "contain", filter: variants.iconFilter }}
          />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-1.5">
        <h3
          className="m-0 font-staatliches uppercase"
          style={{ fontSize: 30, letterSpacing: "0.03em", lineHeight: 1 }}
        >
          {t}
        </h3>
        <p className="m-0 text-[13px] font-semibold" style={{ color: variants.mute }}>
          {s}
        </p>

        <div
          className="mt-3.5 flex items-center justify-between border-t pt-3.5 text-[11px] font-bold uppercase"
          style={{ borderColor: variants.accent, letterSpacing: "0.14em", color: variants.mute }}
        >
          <span>{count}</span>
          <span style={{ fontSize: 16 }}>→</span>
        </div>
      </div>
    </a>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION: PAQUETES
// ────────────────────────────────────────────────────────────────────────────

function Paquetes() {
  return (
    <section
      id="paquetes"
      style={{ background: "#fff", color: INK, padding: "90px 40px 96px", borderTop: "1px solid #EDEDED", borderBottom: "1px solid #EDEDED" }}
      className="px-6! md:px-10!"
    >
      <header className="mx-auto mb-12 max-w-[880px]">
        <p
          className="mb-3.5 text-xs font-bold uppercase"
          style={{ color: YELLOW_DEEP, letterSpacing: "0.22em" }}
        >
          Nuestros paquetes · 03 niveles
        </p>
        <h2
          className="m-0 font-staatliches uppercase"
          style={{
            fontSize: "clamp(46px, 6vw, 88px)",
            lineHeight: 0.92,
            letterSpacing: "0.01em",
            fontWeight: 400,
          }}
        >
          3 PAQUETES{" "}
          <span
            className="inline-block"
            style={{ background: YELLOW, color: INK, padding: "0 0.18em 0.04em", lineHeight: 0.92 }}
          >
            PENSADOS
          </span>
          <br />
          PARA TU AUTO.
        </h2>
        <p className="mt-5 max-w-[620px] text-base leading-relaxed" style={{ color: MUTED }}>
          Combinamos los servicios más comunes en paquetes con precio claro. Llega, los aplicamos en
          la misma cita y te vas con todo listo.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1280px] items-stretch gap-[22px] md:grid-cols-3">
        {paquetes.map((p) => (
          <PaqueteCard key={p.tier} {...p} />
        ))}
      </div>

      <div
        className="mx-auto mt-13 flex max-w-[1280px] flex-wrap items-center justify-between gap-4 pt-8 text-[13px]"
        style={{ color: MUTED, borderTop: "1px solid #EDEDED" }}
      >
        <span>¿Tienes flotilla o 2+ autos? Pregunta por nuestros paquetes para 2 o 4 montajes.</span>
        <a
          href={whatsappHref("Hola, quiero cotizar un paquete para flotilla o varios autos.")}
          target="_blank"
          rel="noopener"
          className="font-bold no-underline"
          style={{ color: INK, fontSize: 13.5, letterSpacing: "0.02em", borderBottom: `2px solid ${YELLOW}`, paddingBottom: 2 }}
        >
          Cotizar a la medida por WhatsApp →
        </a>
      </div>
    </section>
  );
}

function PaqueteCard({
  tier,
  name,
  tagline,
  desc,
  includes,
  variant,
  featured,
}: {
  tier: string;
  name: string;
  tagline: string;
  desc: string;
  includes: string[];
  variant: "outline" | "yellow" | "black";
  featured?: boolean;
}) {
  const variants = {
    yellow: {
      bg: YELLOW,
      fg: INK,
      mute: "rgba(15,15,15,0.72)",
      border: "none",
      tierColor: "rgba(15,15,15,0.5)",
      tagColor: "rgba(15,15,15,0.6)",
      checkBg: INK,
      checkFg: YELLOW,
      ctaBg: INK,
      ctaFg: YELLOW,
    },
    outline: {
      bg: "#FFFFFF",
      fg: INK,
      mute: MUTED,
      border: `1px solid ${RULE}`,
      tierColor: SUB,
      tagColor: YELLOW_DEEP,
      checkBg: "rgba(255,198,0,0.18)",
      checkFg: INK,
      ctaBg: INK,
      ctaFg: YELLOW,
    },
    black: {
      bg: INK,
      fg: "#fff",
      mute: "#B7B9BC",
      border: "none",
      tierColor: YELLOW,
      tagColor: YELLOW,
      checkBg: "rgba(255,198,0,0.18)",
      checkFg: YELLOW,
      ctaBg: YELLOW,
      ctaFg: INK,
    },
  }[variant];

  return (
    <article
      style={{
        background: variants.bg,
        color: variants.fg,
        border: variants.border,
        borderRadius: 26,
        padding: "34px 30px",
        minHeight: 480,
        transform: featured ? "translateY(-10px)" : undefined,
      }}
      className="relative flex flex-col gap-[22px]"
    >
      {featured && (
        <span
          className="absolute -top-3.5 left-7 font-staatliches uppercase"
          style={{
            background: INK,
            color: YELLOW,
            fontSize: 13,
            letterSpacing: "0.14em",
            padding: "7px 14px",
            borderRadius: 9999,
          }}
        >
          ★ Más popular
        </span>
      )}

      <div className="flex items-baseline justify-between">
        <span className="font-staatliches" style={{ fontSize: 14, letterSpacing: "0.14em", color: variants.tierColor }}>
          {tier}
        </span>
        <span
          className="text-[11px] font-bold uppercase"
          style={{ letterSpacing: "0.18em", color: variants.tagColor }}
        >
          · {tagline}
        </span>
      </div>

      <div>
        <h3 className="m-0 font-staatliches" style={{ fontSize: 46, letterSpacing: "0.03em", lineHeight: 0.95 }}>
          {name}
        </h3>
        <p className="mt-3.5 text-[14.5px] leading-relaxed" style={{ color: variants.mute }}>
          {desc}
        </p>
      </div>

      <ul className="m-0 flex flex-1 list-none flex-col gap-3 p-0">
        {includes.map((it) => (
          <li key={it} className="flex items-start gap-3 text-sm leading-snug" style={{ color: variants.fg }}>
            <span
              className="-mt-px inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
              style={{ background: variants.checkBg, color: variants.checkFg }}
            >
              ✓
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>

      <a
        href={whatsappHref(`Hola, quiero agendar el ${name}.`)}
        target="_blank"
        rel="noopener"
        className="mt-auto inline-flex items-center justify-center gap-2.5 rounded-full px-[22px] py-3.5 text-sm font-bold no-underline"
        style={{ background: variants.ctaBg, color: variants.ctaFg }}
      >
        Agendar {name.toLowerCase()} <span>→</span>
      </a>
    </article>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION: DEEP DIVE (one per service category)
// ────────────────────────────────────────────────────────────────────────────

function DeepDive({
  id,
  n,
  eyebrow,
  title,
  titleText,
  intro,
  icon,
  items,
  photoBase,
  photoLabel,
  photoVariant,
  accentNote,
  flip,
}: {
  id: string;
  n: string;
  eyebrow: string;
  title: React.ReactNode;
  titleText: string;
  intro: string;
  icon: string;
  items: { t: string; s: string }[];
  photoBase: string;
  photoLabel: string;
  photoVariant: DeepDiveVariant;
  accentNote: string;
  flip: boolean;
}) {
  const photoSrc = resolvePhoto(photoBase);

  return (
    <section
      id={id}
      style={{ background: PAPER, color: INK, padding: "96px 40px", borderBottom: "1px solid #EDEDED", scrollMarginTop: 120 }}
      className="px-6! md:px-10!"
    >
      <div
        className={`mx-auto flex max-w-[1280px] items-stretch gap-12 lg:gap-[72px] ${flip ? "flex-col lg:flex-row-reverse" : "flex-col lg:flex-row"}`}
      >
        {/* PHOTO */}
        <div className="relative min-w-0 flex-1 pb-8">
          <PhotoBlock src={photoSrc} label={photoLabel} variant={photoVariant} />
          <div
            className="absolute flex max-w-[280px] items-center gap-3.5"
            style={{
              background: YELLOW,
              color: INK,
              padding: "16px 20px",
              borderRadius: 18,
              bottom: -22,
              left: flip ? "auto" : 24,
              right: flip ? 24 : "auto",
            }}
          >
            <img
              src={`/images/servicios/icons/${icon}`}
              alt=""
              style={{ width: 46, height: 46, filter: "brightness(0)" }}
            />
            <div className="flex flex-col gap-0.5 leading-tight">
              <span className="text-[10px] font-bold" style={{ letterSpacing: "0.2em", color: "rgba(15,15,15,0.7)" }}>
                LÍNEA {n}
              </span>
              <span className="font-staatliches" style={{ fontSize: 20, letterSpacing: "0.04em" }}>
                {titleText}
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-[1.15] flex-col gap-6">
          <div className="flex items-center gap-3.5">
            <span className="font-staatliches" style={{ fontSize: 38, letterSpacing: "0.06em", color: INK }}>
              {n}
            </span>
            <span className="block h-px flex-1" style={{ background: RULE }} />
            <span
              className="text-[11px] font-bold uppercase"
              style={{ letterSpacing: "0.22em", color: YELLOW_DEEP }}
            >
              {eyebrow}
            </span>
          </div>

          <h2
            className="m-0 font-staatliches uppercase"
            style={{
              fontSize: "clamp(44px, 5.5vw, 84px)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              fontWeight: 400,
              color: INK,
            }}
          >
            {title}
          </h2>

          <p className="m-0 max-w-[560px] text-base leading-[1.7]" style={{ color: MUTED }}>
            {intro}
          </p>

          {accentNote && (
            <div
              className="flex max-w-[600px] items-start gap-3 text-[13.5px] leading-relaxed"
              style={{ background: "#fff", border: `1px solid ${RULE}`, borderLeft: `4px solid ${YELLOW}`, borderRadius: 14, padding: "14px 18px", color: INK }}
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: YELLOW }} />
              <span>{accentNote}</span>
            </div>
          )}

          <div>
            <div
              className="mb-3.5 flex items-center justify-between border-b pb-3.5 text-[11px] font-bold uppercase"
              style={{ borderColor: RULE, letterSpacing: "0.18em", color: INK }}
            >
              <span>Servicios incluidos</span>
              <span style={{ color: SUB, letterSpacing: "0.16em" }}>{items.length} principales</span>
            </div>
            <ul className="m-0 grid list-none gap-x-7 gap-y-3.5 p-0 md:grid-cols-2">
              {items.map((it) => (
                <li key={it.t} className="flex items-start gap-3 py-1">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: YELLOW }} />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold leading-snug" style={{ color: INK }}>
                      {it.t}
                    </span>
                    {it.s && (
                      <span className="text-xs leading-snug" style={{ color: "#6B6B6B" }}>
                        {it.s}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3.5">
            <a
              href={whatsappHref(`Hola, quiero agendar ${titleText.toLowerCase()}.`)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2.5 rounded-full px-[22px] py-3 text-sm font-bold no-underline"
              style={{ background: INK, color: YELLOW }}
            >
              Agendar por WhatsApp <span>→</span>
            </a>
            <a
              href="#paquetes"
              className="px-1 py-3 text-sm font-bold no-underline"
              style={{ color: INK, borderBottom: `2px solid ${YELLOW}` }}
            >
              Ver paquetes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// PHOTO BLOCK (real image OR styled placeholder)
// ────────────────────────────────────────────────────────────────────────────

function PhotoBlock({
  src,
  label,
  variant,
  ratio = "5 / 6",
  radius = 24,
}: {
  src: string | null;
  label: string;
  variant: DeepDiveVariant;
  ratio?: string;
  radius?: number;
}) {
  const isLight = variant === "yellow";
  const isOutline = variant === "outline";
  const bgs: Record<DeepDiveVariant, CSSProperties> = {
    yellow: { background: YELLOW, color: INK },
    brown: { backgroundColor: STRIPE_BROWN_BG, backgroundImage: STRIPE_BROWN_URL, color: "#fff" },
    black: { background: INK, color: "#fff" },
    outline: { background: "#fff", color: INK, border: `1px solid ${RULE}` },
  };

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: ratio,
        width: "100%",
        borderRadius: radius,
        overflow: "hidden",
        ...bgs[variant],
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority={false}
        />
      ) : (
        <>
          <div
            className="absolute inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase"
            style={{
              top: 18,
              left: 22,
              background: isLight ? INK : "rgba(255,255,255,0.08)",
              border: isOutline ? `1px solid ${RULE}` : isLight ? "none" : "1px solid rgba(255,255,255,0.12)",
              letterSpacing: "0.18em",
              color: isLight ? YELLOW : isOutline ? SUB : YELLOW,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: YELLOW }} />
            Foto
          </div>

          <div
            className="absolute font-staatliches uppercase"
            style={{
              left: 22,
              right: 22,
              bottom: 22,
              fontSize: 20,
              letterSpacing: "0.04em",
              lineHeight: 1.05,
              color: isLight ? INK : isOutline ? INK : "#fff",
            }}
          >
            {label}
          </div>

          <svg
            style={{ position: "absolute", right: 18, top: 18, opacity: isLight ? 0.5 : 0.4 }}
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <path
              d="M0 6V0H6M22 6V0H16M0 16V22H6M22 16V22H16"
              stroke={isLight ? INK : isOutline ? INK : YELLOW}
              strokeWidth="1.5"
            />
          </svg>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION: CLUB BAND
// ────────────────────────────────────────────────────────────────────────────

function ClubBand() {
  const benefits: [string, string][] = [
    ["ROTACIÓN", "Cada vez que la necesites"],
    ["RECARGA DE NITRÓGENO", "Sin costo adicional"],
    ["REVISIÓN VEHICULAR", "Cada visita a la sucursal"],
    ["PRIORIDAD EN CITAS", "Llega y entra"],
  ];

  return (
    <section style={{ background: YELLOW, color: INK, padding: "88px 40px" }} className="px-6! md:px-10!">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_1.4fr_auto]">
        <div className="flex flex-col gap-4.5">
          <div
            className="inline-flex items-center gap-3 self-start rounded-full"
            style={{ background: "rgba(15,15,15,0.08)", border: "1px solid rgba(15,15,15,0.15)", padding: "10px 16px 10px 12px" }}
          >
            <img src="/llanta_icon.svg" alt="" style={{ width: 32, height: 32 }} />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold" style={{ letterSpacing: "0.2em", color: "rgba(15,15,15,0.7)" }}>
                EXCLUSIVO
              </span>
              <span className="font-staatliches" style={{ fontSize: 18, letterSpacing: "0.06em" }}>
                MEMBRESÍA
              </span>
            </div>
          </div>
          <h2
            className="m-0 font-staatliches uppercase"
            style={{
              fontSize: "clamp(56px, 7vw, 110px)",
              lineHeight: 0.9,
              letterSpacing: "0.01em",
              fontWeight: 400,
            }}
          >
            CLUB
            <br />
            YANTISSIMO.
          </h2>
          <p className="m-0 max-w-[420px] text-base leading-[1.65]" style={{ color: "rgba(15,15,15,0.85)" }}>
            Únete al club y disfruta rotación, recarga de nitrógeno y revisión de tus llantas{" "}
            <strong>gratis durante toda la vida útil del juego</strong>. Un solo costo al comprar y te
            olvidas del mantenimiento básico.
          </p>
        </div>

        <ul
          className="m-0 grid list-none gap-x-7 gap-y-5 p-7 md:grid-cols-2"
          style={{ background: INK, color: "#fff", borderRadius: 22 }}
        >
          {benefits.map(([t, s]) => (
            <li key={t} className="flex items-start gap-3 text-white">
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
                style={{ background: YELLOW, color: INK }}
              >
                ✓
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-staatliches" style={{ fontSize: 18, letterSpacing: "0.04em" }}>
                  {t}
                </span>
                <span className="text-[12.5px]" style={{ color: "#B7B9BC" }}>
                  {s}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <a
          href={whatsappHref("Hola, quiero información sobre el Club Yantissimo.")}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full px-[26px] py-[18px] text-[14.5px] font-bold no-underline"
          style={{ background: INK, color: YELLOW }}
        >
          Conocer el club <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION: ESPECIALES
// ────────────────────────────────────────────────────────────────────────────

function Especiales() {
  const items: { t: string; s: string; ico: React.ReactNode }[] = [
    {
      t: "REVISIÓN VEHICULAR",
      s: "30 minutos. Diagnóstico antes y después del servicio.",
      ico: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l2 2 4-4" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
    {
      t: "SERVICIO DE SCANNER",
      s: "Lectura y borrado de códigos de falla de tu computadora.",
      ico: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M7 19v2M17 19v2M3 12h18" />
        </svg>
      ),
    },
    {
      t: "CONTISAFE",
      s: "Protección Continental contra daños accidentales en tus llantas.",
      ico: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
        </svg>
      ),
    },
    {
      t: "GARANTÍA",
      s: "Respaldo completo en cada montaje y servicio realizado.",
      ico: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3 5 6 1-4.5 4 1 6L12 15l-5.5 3 1-6L3 8l6-1z" />
        </svg>
      ),
    },
    {
      t: "SERVICIO DE LOGÍSTICA",
      s: "Entrega y recolección en flotillas y clientes corporativos.",
      ico: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="7" width="14" height="10" rx="1" />
          <path d="M15 10h4l2 3v4h-6" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="19" r="2" />
        </svg>
      ),
    },
    {
      t: "TRABAJOS ESPECIALES",
      s: "Cotización por hora para casos fuera de catálogo.",
      ico: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a4 4 0 015.7 5.7l-1 1-5.7-5.7zM3 21l3.5-1L18 8.5 15.5 6 4 17.5 3 21z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="especiales"
      style={{ background: "#fff", color: INK, padding: "92px 40px", borderTop: "1px solid #EDEDED" }}
      className="px-6! md:px-10!"
    >
      <header className="mx-auto mb-12 grid max-w-[1280px] items-end gap-12 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p
            className="mb-3 text-xs font-bold uppercase"
            style={{ color: YELLOW_DEEP, letterSpacing: "0.22em" }}
          >
            Más servicios · 06 adicionales
          </p>
          <h2
            className="m-0 font-staatliches uppercase"
            style={{
              fontSize: "clamp(42px, 5.5vw, 76px)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              fontWeight: 400,
            }}
          >
            SERVICIOS{" "}
            <span
              className="inline-block"
              style={{ background: YELLOW, color: INK, padding: "0 0.18em 0.04em", lineHeight: 0.92 }}
            >
              ESPECIALES.
            </span>
          </h2>
        </div>
        <p className="m-0 max-w-[420px] pb-3 text-[15px] leading-[1.65]" style={{ color: MUTED }}>
          Diagnóstico, protección y respaldo. Servicios complementarios que se suman a tu cita
          cuando los necesitas.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((it) => (
          <article
            key={it.t}
            className="flex items-start gap-4 rounded-[20px] p-[26px_24px]"
            style={{ background: "#fff", border: `1px solid ${RULE}` }}
          >
            <div
              className="inline-flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[14px]"
              style={{ background: YELLOW, color: INK }}
            >
              {it.ico}
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="m-0 font-staatliches" style={{ fontSize: 20, letterSpacing: "0.04em", color: INK }}>
                {it.t}
              </h3>
              <p className="m-0 text-[13.5px] leading-relaxed" style={{ color: "#6B6B6B" }}>
                {it.s}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// SECTION: FINAL CTA
// ────────────────────────────────────────────────────────────────────────────

function CtaBand() {
  return (
    <section style={{ background: INK, color: "#fff", padding: "96px 40px 100px" }} className="px-6! md:px-10!">
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-5">
          <p className="m-0 text-xs font-bold" style={{ color: YELLOW, letterSpacing: "0.22em" }}>
            ¿LISTO PARA TU CITA?
          </p>
          <h2
            className="m-0 font-staatliches uppercase"
            style={{
              fontSize: "clamp(46px, 6vw, 88px)",
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              fontWeight: 400,
            }}
          >
            ESCRÍBENOS HOY.
            <br />
            <span
              className="inline-block"
              style={{ background: YELLOW, color: INK, padding: "0 0.18em 0.04em", lineHeight: 0.92 }}
            >
              TE
            </span>{" "}
            RESPONDEMOS
            <br />
            EN MINUTOS.
          </h2>
          <p className="m-0 max-w-[480px] text-base leading-[1.65]" style={{ color: "#B7B9BC" }}>
            6 sucursales en Colima, Villa de Álvarez y Manzanillo. Atención profesional de lunes a
            sábado.
          </p>
        </div>

        <div className="flex flex-col gap-4.5">
          <a
            href={whatsappHref("Hola, quiero agendar una cita.")}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-between rounded-[18px] px-[22px] py-[18px] text-[15px] font-bold no-underline"
            style={{ background: YELLOW, color: INK }}
          >
            <span className="flex items-center gap-3.5">
              <WhatsappIcon width={24} height={24} fill={INK} />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[11px] font-bold" style={{ letterSpacing: "0.18em", color: "rgba(15,15,15,0.7)" }}>
                  AGENDAR POR WHATSAPP
                </span>
                <span className="font-staatliches" style={{ fontSize: 24, letterSpacing: "0.04em" }}>
                  {WHATSAPP_DISPLAY}
                </span>
              </span>
            </span>
            <span style={{ fontSize: 18 }}>→</span>
          </a>

          <div
            className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13px] leading-[1.55]"
            style={{ color: "#B7B9BC", background: "#16161A", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: YELLOW }} />
            <span>
              <strong style={{ color: "#fff" }}>Solo mensajes de WhatsApp</strong> — no recibimos
              llamadas en este número.
            </span>
          </div>

          <div
            className="flex flex-col gap-2 rounded-2xl px-[22px] py-[18px]"
            style={{ background: "#16161A", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="mb-1.5 text-[11px] font-bold" style={{ letterSpacing: "0.2em", color: SUB }}>
              HORARIO
            </span>
            {[
              ["Lun — Vie", "9:00 a 19:00", false],
              ["Sábado", "9:00 a 14:00", false],
              ["Domingo", "Cerrado", true],
            ].map(([d, h, closed]) => (
              <div
                key={d as string}
                className="flex justify-between pb-2 text-sm text-white"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span>{d}</span>
                <span
                  className="font-staatliches"
                  style={{
                    fontSize: 18,
                    letterSpacing: "0.04em",
                    color: closed ? SUB : YELLOW,
                  }}
                >
                  {h}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
