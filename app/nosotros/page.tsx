import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import { ArrowIcon, WhatsappIcon } from "components/yantissimo/icons";
import { PhotoPlaceholder } from "components/yantissimo/photo-placeholder";
import {
  BRANCHES,
  BRANDS,
  COMPANY,
  HOURS,
  WHATSAPP_DISPLAY,
  whatsappHref,
} from "lib/company";
import type { ReactNode } from "react";

export const metadata = {
  title: "Nosotros · Llantera colimense desde 2016 | Yantissimo",
  description:
    "Yantissimo nace en octubre 2016 en Villa de Álvarez, Colima. Hoy 7 sucursales, 40 técnicos certificados y 25,000+ servicios al año. Distribuidores oficiales Michelin, Bridgestone, Continental y más.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros · Yantissimo, llantera colimense desde 2016",
    description:
      "9 años en Colima · 6 sucursales · 40 técnicos certificados · 14 marcas oficiales.",
    url: "https://yantissimo.com/nosotros",
    type: "website",
  },
};

function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
    alternateName: COMPANY.brandName,
    url: COMPANY.website,
    foundingDate: COMPANY.foundedDate,
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Villa de Álvarez",
        addressRegion: "Colima",
        addressCountry: "MX",
      },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.hqAddress.street,
      addressLocality: COMPANY.hqAddress.city,
      addressRegion: COMPANY.hqAddress.state,
      postalCode: COMPANY.hqAddress.postalCode,
      addressCountry: COMPANY.hqAddress.country,
    },
    email: COMPANY.email,
    sameAs: [
      "https://facebook.com/yantissimollantas",
      "https://instagram.com/yantissimo",
      "https://tiktok.com/@yantissimo",
    ],
    department: BRANCHES.map((b) => ({
      "@type": "AutoRepair",
      name: `Yantissimo ${b.name}`,
      telephone: `+52${b.phone.replace(/\s/g, "")}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: b.address,
        addressLocality: b.city,
        addressRegion: b.state,
        postalCode: b.zip,
        addressCountry: "MX",
      },
    })),
  };
}

export default function NosotrosPage() {
  return (
    <div className="mt-28 min-h-screen bg-white text-[#0F0F0F]">
      <ScrollToTopOnMount behavior="auto" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildOrganizationJsonLd()),
        }}
      />

      {/* HERO */}
      <section className="px-6 pt-16 pb-6 md:px-12 md:pt-20">
        <div className="mx-auto grid max-w-7xl items-end gap-10 md:grid-cols-[1.1fr,1fr] md:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D19D00] md:text-sm">
              Nosotros · Yantissimo + Yaol
            </p>
            <h1 className="mt-4 font-staatliches text-5xl font-black uppercase leading-[0.92] tracking-[0.03em] md:text-7xl lg:text-[96px]">
              No vendemos
              <br />
              llantas.
              <br />
              <span className="bg-[#FFC600] px-3">Te</span> cuidamos
              <br />
              el coche.
            </h1>
          </div>
          <div>
            <p className="text-base leading-relaxed text-neutral-600 md:text-lg">
              Empezamos el primer taller en{" "}
              <strong className="text-[#0F0F0F]">octubre de 2016</strong> en
              Villa de Álvarez, con un compresor y muchas ganas. Hoy somos siete
              sucursales y un equipo de cuarenta personas que{" "}
              <strong className="text-[#0F0F0F]">
                conoce a cada cliente por nombre
              </strong>
              . Esto es lo que nos define.
            </p>
            <div className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#0F0F0F] px-4 py-2 text-[#FFC600]">
              <span className="h-2 w-2 rounded-full bg-[#FFC600]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
                Atendiendo desde el 27 de octubre de 2016
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO */}
      <section className="px-6 py-12 md:px-12 md:py-16">
        <div className="mx-auto grid max-w-7xl auto-rows-[180px] grid-cols-2 gap-3.5 md:grid-cols-6">
          {/* Big stat */}
          <BentoTile span={[2, 2]} bg="#FFC600" color="#0F0F0F">
            <div className="flex h-full flex-col justify-between">
              <span className="font-staatliches text-[120px] font-black leading-[0.85] tracking-[0.02em] md:text-[140px]">
                9
              </span>
              <h3 className="font-staatliches text-lg font-black uppercase tracking-[0.03em] md:text-[22px]">
                Años cuidando
                <br />
                el parque vehicular
                <br />
                de Colima.
              </h3>
            </div>
          </BentoTile>

          {/* Photo: equipo */}
          <BentoTile
            span={[2, 1]}
            bg="#0F0F0F"
            photo={28}
            label="Equipo Yantissimo"
          >
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFD34A]">
                El equipo
              </p>
              <h3 className="mt-1.5 font-staatliches text-xl font-black uppercase tracking-[0.02em] text-white md:text-[22px]">
                40 técnicos certificados
              </h3>
            </div>
          </BentoTile>

          {/* History blurb */}
          <BentoTile span={[2, 1]} bg="#fff" border>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9EA0A3]">
              Nuestro origen
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
              <strong className="text-[#0F0F0F]">
                Yantissimo nace en octubre de 2016
              </strong>{" "}
              en Villa de Álvarez, fundada por un equipo local con experiencia
              en talleres de la región. Nuestra misión: que comprar llantas en
              Colima no sea una caja negra.
            </p>
          </BentoTile>

          {/* Stat 6 */}
          <BentoTile span={[1, 1]} bg="#0F0F0F" color="#fff">
            <span className="font-staatliches text-5xl leading-none tracking-[0.02em] text-[#FFC600] md:text-6xl">
              7
            </span>
            <span className="mt-1.5 block text-[11px] font-bold uppercase tracking-[0.12em]">
              Sucursales en operación
            </span>
          </BentoTile>

          {/* Stat 25k */}
          <BentoTile span={[1, 1]} bg="#0F0F0F" color="#fff">
            <span className="font-staatliches text-5xl leading-none tracking-[0.02em] text-[#FFC600] md:text-6xl">
              25K+
            </span>
            <span className="mt-1.5 block text-[11px] font-bold uppercase tracking-[0.12em]">
              Servicios al año
            </span>
          </BentoTile>

          {/* Photo: Manzanillo */}
          <BentoTile
            span={[2, 1]}
            bg="#1B1B1D"
            photo={14}
            label="Manzanillo · Salagua"
          >
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFD34A]">
                desde 2022
              </p>
              <h3 className="mt-1.5 font-staatliches text-xl font-black uppercase tracking-[0.02em] text-white md:text-[22px]">
                Sucursal Manzanillo Blvd
              </h3>
            </div>
          </BentoTile>

          {/* Horarios uniformes */}
          <BentoTile span={[3, 1]} bg="#fff" border>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9EA0A3]">
              Mismos horarios en las 7 sucursales
            </p>
            <div className="mt-3.5 grid grid-cols-3 gap-3.5">
              {HOURS.map((h, idx) => (
                <div
                  key={h.d}
                  className={`flex flex-col gap-1 pr-3.5 ${
                    idx < HOURS.length - 1 ? "border-r border-neutral-200" : ""
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9EA0A3]">
                    {h.d}
                  </span>
                  <span
                    className={`font-staatliches text-xl leading-none tracking-[0.04em] md:text-2xl ${
                      h.closed ? "text-[#9EA0A3]" : "text-[#0F0F0F]"
                    }`}
                  >
                    {h.h}
                  </span>
                </div>
              ))}
            </div>
          </BentoTile>

          {/* Marca grande */}
          <BentoTile span={[3, 1]} bg="#FFC600" color="#0F0F0F">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black/70">
              Alianza oficial
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-staatliches text-3xl font-black uppercase leading-none tracking-[0.04em] md:text-[42px]">
                Distribuidor
                <br />
                autorizado
              </span>
              <div className="flex flex-col items-end gap-1 font-staatliches text-xs tracking-[0.12em] text-[#0F0F0F] md:text-sm">
                {BRANDS.slice(0, 3).map((b) => (
                  <span key={b}>{b}</span>
                ))}
                <span>+ {BRANDS.length - 3} más</span>
              </div>
            </div>
          </BentoTile>
        </div>
      </section>

      {/* MARCAS LIST (extra trust) */}
      <section className="px-6 py-8 md:px-12 md:py-12">
        <div className="mx-auto max-w-7xl rounded-2xl border border-neutral-200 bg-neutral-50 p-8 md:p-10">
          <div className="mb-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <h3 className="font-staatliches text-2xl font-black uppercase tracking-[0.04em]">
              Marcas que distribuimos
            </h3>
            <span className="text-sm text-neutral-600">
              Stock oficial · garantía directa de fábrica
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
            {BRANDS.map((m) => (
              <div
                key={m}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-4 text-center font-staatliches text-base tracking-[0.12em] text-neutral-700"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-3xl bg-[#0F0F0F] p-10 text-white md:grid-cols-[1.3fr,1fr] md:p-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD34A] md:text-sm">
              Ven a conocernos
            </p>
            <h3 className="mt-3.5 mb-3 font-staatliches text-4xl font-black uppercase leading-none tracking-[0.03em] md:text-5xl">
              Pasa al taller
              <br />
              cuando puedas.
            </h3>
            <p className="max-w-lg text-base leading-relaxed text-white/70">
              Café cortesía, sala de espera con WiFi y tu auto listo cuando
              regresas. Te invitamos a recorrer cualquiera de nuestras seis
              sucursales.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <a
              href="/ubicaciones"
              className="flex items-center justify-between rounded-2xl bg-[#FFC600] px-5 py-4 text-[15px] font-extrabold text-[#0F0F0F] transition hover:bg-[#FFD34A]"
            >
              <span>Ver las 7 sucursales</span>
              <ArrowIcon className="h-4 w-4" />
            </a>
            <a
              href={whatsappHref()}
              className="flex items-center justify-between rounded-2xl border border-white/20 bg-transparent px-5 py-4 text-[15px] font-bold text-white transition hover:border-white/40"
            >
              <span>Escribir por WhatsApp · {WHATSAPP_DISPLAY}</span>
              <WhatsappIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function BentoTile({
  span = [1, 1],
  bg = "#fff",
  color = "#0F0F0F",
  border = false,
  photo,
  label,
  children,
}: {
  span?: [number, number];
  bg?: string;
  color?: string;
  border?: boolean;
  photo?: number;
  label?: string;
  children: ReactNode;
}) {
  const colSpan: Record<number, string> = {
    1: "col-span-1 md:col-span-1",
    2: "col-span-2 md:col-span-2",
    3: "col-span-2 md:col-span-3",
    4: "col-span-2 md:col-span-4",
    6: "col-span-2 md:col-span-6",
  };
  const rowSpan: Record<number, string> = {
    1: "row-span-1",
    2: "row-span-2",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 ${colSpan[span[0]] ?? "col-span-1"} ${rowSpan[span[1]] ?? "row-span-1"} ${border ? "border border-neutral-200" : ""}`}
      style={{ background: bg, color }}
    >
      {photo != null && (
        <div className="absolute inset-0">
          <PhotoPlaceholder hue={photo} label={label || ""} dense />
        </div>
      )}
      <div className={`relative ${photo != null ? "h-full" : ""}`}>
        {children}
      </div>
    </div>
  );
}
