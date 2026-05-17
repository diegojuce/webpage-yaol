import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import {
  ArrowIcon,
  ClockIcon,
  PhoneIcon,
  PinIcon,
  WhatsappIcon,
} from "components/yantissimo/icons";
import { PhotoPlaceholder } from "components/yantissimo/photo-placeholder";
import type { Branch } from "lib/company";
import {
  BRANCHES,
  COMPANY,
  HOURS,
  SERVICES,
  WHATSAPP_DISPLAY,
  telHref,
  whatsappHref,
} from "lib/company";

export const metadata = {
  title: "Sucursales en Colima y Manzanillo | Yantissimo",
  description:
    "Encuentra tu Yantissimo: 6 sucursales en Colima, Villa de Álvarez y Manzanillo. Llantas, alineación, frenos y afinación. Horarios, teléfonos y direcciones reales.",
  alternates: { canonical: "/ubicaciones" },
  openGraph: {
    title: "Sucursales Yantissimo · Colima y Manzanillo",
    description:
      "7 talleres certificados en Colima, Villa de Álvarez y Manzanillo. Mismos horarios, misma garantía. WhatsApp central 312 222 0099.",
    url: "https://yantissimo.com/ubicaciones",
    type: "website",
  },
};

const CITIES: { name: string; ids: Branch["id"][] }[] = [
  {
    name: "Colima",
    ids: ["constitucion", "ninos-heroes", "colinas-del-rey"],
  },
  {
    name: "Villa de Álvarez",
    ids: ["tecnologico", "benito-juarez"],
  },
  {
    name: "Manzanillo",
    ids: ["manzanillo", "manzanillo-tap"],
  },
];

function buildLocalBusinessJsonLd() {
  return BRANCHES.map((b) => ({
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${COMPANY.website}/ubicaciones#${b.id}`,
    name: `Yantissimo ${b.name}`,
    image: `${COMPANY.website}/opengraph-image`,
    url: `${COMPANY.website}/ubicaciones#${b.id}`,
    telephone: `+52${b.phone.replace(/\s/g, "")}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: b.city,
      addressRegion: b.state,
      postalCode: b.zip,
      addressCountry: "MX",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    priceRange: "$$",
    parentOrganization: { "@type": "Organization", name: "Yantissimo" },
  }));
}

export default function UbicacionesPage() {
  const jsonLd = buildLocalBusinessJsonLd();

  return (
    <div className="mt-28 min-h-screen bg-white text-[#0F0F0F]">
      <ScrollToTopOnMount behavior="auto" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="bg-[#0F0F0F] px-6 py-16 text-white md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl items-end gap-10 md:grid-cols-[1.2fr,1fr] md:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD34A] md:text-sm">
              Ubicaciones · Colima y Manzanillo
            </p>
            <h1 className="mt-4 font-staatliches text-5xl font-black uppercase leading-[0.9] tracking-[0.02em] md:text-7xl lg:text-[96px]">
              Siete
              <br />
              <span className="text-[#FFC600]">talleres</span>
              <br />
              cerca de ti.
            </h1>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-base leading-relaxed text-white/75 md:text-lg">
              Operamos en{" "}
              <strong className="text-white">tres ciudades del estado de Colima</strong>.
              Mismos horarios, misma garantía, técnicos certificados en cada
              sucursal. ¿Apuro? Cotiza por WhatsApp en segundos con nuestro
              agente o llama directo al taller.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-green-500">
                  Abierto hoy · 9:00 — 19:00
                </span>
              </div>
              <span className="text-xs text-[#9EA0A3]">Domingo cerrado</span>
            </div>
            <a
              href={whatsappHref("Hola, quiero cotizar llantas")}
              className="mt-2 inline-flex max-w-fit items-center gap-3.5 rounded-2xl border border-green-500/40 bg-green-500/10 p-3.5 text-white transition hover:bg-green-500/20"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] text-[#0F2F1A]">
                <WhatsappIcon className="h-[18px] w-[18px]" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#25D366]">
                  WhatsApp único para las 7 sucursales
                </span>
                <span className="font-staatliches text-2xl leading-none tracking-[0.04em]">
                  {WHATSAPP_DISPLAY}
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* Anchor links */}
        <div className="mx-auto mt-10 grid max-w-7xl gap-0 border-t border-white/10 pt-6 md:grid-cols-3">
          {CITIES.map((c, i) => (
            <a
              key={c.name}
              href={`#${c.name.replace(/\s/g, "-")}`}
              className={`flex items-center gap-4 px-4 py-4 text-white transition hover:bg-white/5 md:px-6 md:py-5 ${
                i < CITIES.length - 1 ? "md:border-r md:border-white/10" : ""
              }`}
            >
              <span className="font-staatliches text-4xl font-black leading-none tracking-[0.02em] text-[#FFC600] md:text-5xl">
                0{i + 1}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-base font-extrabold uppercase tracking-[0.02em] md:text-lg">
                  {c.name}
                </span>
                <span className="text-xs text-[#9EA0A3]">
                  {c.ids.length} {c.ids.length === 1 ? "sucursal" : "sucursales"}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* CITY BLOCKS */}
      {CITIES.map((city) => (
        <CityBlock key={city.name} city={city} />
      ))}

      {/* SERVICES PROMISE */}
      <section className="bg-[#FFC600] px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.2fr,1fr] md:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/70 md:text-sm">
              En cada sucursal
            </p>
            <h2 className="mt-4 font-staatliches text-5xl font-black uppercase leading-[0.95] tracking-[0.04em] text-[#0F0F0F] md:text-6xl lg:text-[64px]">
              El mismo
              <br />
              compromiso.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#0F0F0F] md:text-lg">
              No importa a qué Yantissimo entres. Los mismos procesos, los
              mismos técnicos certificados, las mismas marcas oficiales. Tu
              garantía vale en las seis sucursales.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3.5 rounded-2xl bg-[#0F0F0F] p-4 text-white md:p-[18px]"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFC600] text-[#0F0F0F]">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-extrabold uppercase tracking-[0.04em]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CityBlock({ city }: { city: (typeof CITIES)[number] }) {
  const branches = city.ids
    .map((id) => BRANCHES.find((b) => b.id === id))
    .filter(Boolean) as Branch[];

  return (
    <section
      id={city.name.replace(/\s/g, "-")}
      className="border-b border-neutral-200 px-6 py-16 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-9 flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <h2 className="font-staatliches text-5xl font-black uppercase leading-none tracking-[0.04em] md:text-6xl lg:text-[64px]">
            {city.name}
          </h2>
          <span className="text-sm font-semibold tracking-[0.04em] text-[#9EA0A3]">
            {city.ids.length} {city.ids.length === 1 ? "sucursal" : "sucursales"} · Colima, México
          </span>
          <span className="ml-auto inline-flex items-center gap-2.5 rounded-full bg-[#0F0F0F] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#FFC600]">
            <ClockIcon className="h-3.5 w-3.5" /> L-V 9-19 · Sáb 9-14
          </span>
        </div>
        <div className="flex flex-col gap-3.5">
          {branches.map((b, i) => (
            <BranchRow key={b.id} branch={b} num={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BranchRow({ branch, num }: { branch: Branch; num: number }) {
  return (
    <article className="grid items-stretch gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 md:grid-cols-[220px,1fr,320px,220px]">
      <div className="relative min-h-[200px] md:min-h-[220px]">
        <PhotoPlaceholder hue={branch.photoHue} label={branch.name} />
      </div>

      <div className="flex flex-col gap-3.5 px-6 py-6 md:p-7">
        <div className="flex items-baseline gap-3.5">
          <span className="font-staatliches text-2xl tracking-[0.04em] text-[#9EA0A3]">
            0{num}
          </span>
          <h3 className="font-staatliches text-3xl font-black uppercase leading-none tracking-[0.03em] md:text-[36px]">
            {branch.name}
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-neutral-600 md:text-[15px]">
          {branch.address}, {branch.city}, CP {branch.zip}.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {branch.badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-600"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-y border-neutral-200 px-6 py-6 md:border-x md:border-y-0 md:px-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9EA0A3]">
          Contacto
        </span>
        <a
          href={telHref(branch.phone)}
          className="font-staatliches text-3xl tracking-[0.04em] text-[#0F0F0F] hover:text-[#D19D00]"
        >
          {branch.phone}
        </a>
        <span className="text-[13px] text-neutral-600">
          Atención directa, sin menús.
        </span>
        <div className="mt-auto flex flex-col gap-1 border-t border-dashed border-neutral-300 pt-2">
          {HOURS.map((h) => (
            <span
              key={h.d}
              className={`flex justify-between text-xs ${
                h.closed ? "text-[#9EA0A3]" : "text-neutral-600"
              }`}
            >
              <span>{h.d}</span>
              <span className={`font-bold ${h.closed ? "text-[#9EA0A3]" : "text-[#0F0F0F]"}`}>
                {h.h}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2.5 px-6 py-6 md:p-7 md:pl-0">
        <a
          href={telHref(branch.phone)}
          className="flex items-center justify-center gap-2.5 rounded-xl bg-[#FFC600] px-4 py-3.5 text-sm font-extrabold text-[#0F0F0F] transition hover:bg-[#FFD34A]"
        >
          <PhoneIcon className="h-4 w-4" /> Llamar al taller
        </a>
        <a
          href={branch.maps}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-xl bg-[#0F0F0F] px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-neutral-800"
        >
          <PinIcon className="h-4 w-4" /> Cómo llegar
        </a>
        <a
          href="/agendar"
          className="flex items-center justify-center gap-2.5 rounded-xl border border-neutral-300 bg-transparent px-4 py-3.5 text-sm font-bold text-[#0F0F0F] transition hover:bg-neutral-100"
        >
          Agendar cita <ArrowIcon className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

