// Landing + alta pública al Club Yantissimo (sin app móvil).
//
// Los beneficios se traen en el servidor para que la landing pinte completa al
// primer render; el resto del flujo (código, vehículo, tarjeta) es del cliente.
import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import { ShieldIcon, WhatsappIcon } from "components/yantissimo/icons";
import { fetchBeneficios } from "lib/api/club";
import { BRANCHES, COMPANY, WHATSAPP_DISPLAY, whatsappHref } from "lib/company";
import type { ReactNode } from "react";
import ClubSignupCard from "./club-signup-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Club Yantissimo · Beneficios gratis para tu auto | Yantissimo",
  description:
    "Únete gratis al Club Yantissimo y llévate tu tarjeta digital en el celular. Rotación, balanceo, revisión de presión y más beneficios en las 6 sucursales de Colima, Villa de Álvarez y Manzanillo.",
  alternates: { canonical: "/club" },
  openGraph: {
    title: "Club Yantissimo · Beneficios gratis para tu auto",
    description:
      "Sin descargar ninguna app. Regístrate con tu celular y llévate tu tarjeta digital.",
    url: "https://yantissimo.com/club",
    type: "website",
  },
};

const DISPLAY_FONT =
  "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif";

const PASOS = [
  {
    n: "01",
    titulo: "Escribe tu celular",
    texto:
      "Solo tu número a 10 dígitos. El nombre es opcional y no pedimos correo ni contraseña.",
  },
  {
    n: "02",
    titulo: "Confirma por WhatsApp",
    texto:
      "Te mandamos un código de 6 dígitos que vence en 10 minutos. Así nadie más puede darte de alta.",
  },
  {
    n: "03",
    titulo: "Elige tu vehículo",
    texto:
      "La membresía va ligada a un auto. Si aún no lo tienes a la mano, lo registramos en tu próxima visita.",
  },
  {
    n: "04",
    titulo: "Guarda tu tarjeta",
    texto:
      "Agrégala a Apple Wallet o preséntala en sucursal. Ahí activamos tu membresía y empiezas a usarla.",
  },
];

const FAQ = [
  {
    p: "¿Cuánto cuesta entrar al Club?",
    r: "El alta en línea es gratuita. Los beneficios se activan cuando presentas tu tarjeta en cualquier sucursal Yantissimo.",
  },
  {
    p: "¿Necesito descargar una app?",
    r: "No. Todo el alta es desde esta página y tu tarjeta vive en Apple Wallet o en el número de membresía que te damos al terminar.",
  },
  {
    p: "¿Por qué me piden un código si ya soy cliente?",
    r: "Porque el teléfono no es un secreto. No leemos ni escribimos nada de tu cuenta hasta comprobar que el número es tuyo, seas cliente nuevo o de toda la vida.",
  },
  {
    p: "Tengo varios autos, ¿me alcanza una membresía?",
    r: "La membresía es por vehículo. Puedes repetir el alta con el mismo celular para inscribir cada uno de tus autos.",
  },
  {
    p: "¿Y si tengo Android?",
    r: "Guarda tu número de membresía o pásate a cualquier sucursal: ahí te entregamos tu tarjeta y la dejamos activa.",
  },
];

export default async function ClubPage() {
  const beneficios = await fetchBeneficios();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.p,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  };

  return (
    <div className="mt-28 min-h-screen bg-[#0F0F0F] text-white">
      <ScrollToTopOnMount />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero + tarjeta de alta */}
      <section className="relative overflow-hidden px-6 py-16 md:px-14 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#FFC600]/10 blur-[120px]"
        />
        <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-14 lg:grid-cols-[1.1fr_minmax(420px,1fr)]">
          <div className="flex flex-col gap-6">
            <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
              Club Yantissimo
            </p>
            <h1
              className="m-0 font-black uppercase leading-[0.9] tracking-[0.04em]"
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: "clamp(52px,6.5vw,104px)",
              }}
            >
              Tu auto merece
              <br />
              <span className="text-[#FFC600]">estar en el club</span>
            </h1>
            <p className="m-0 max-w-[520px] text-[17px] leading-[1.6] text-white/70">
              Beneficios reales en las {BRANCHES.length} sucursales de{" "}
              {COMPANY.brandName}. Sin descargar nada, sin mensualidad y sin
              letras chiquitas: te registras con tu celular y te llevas tu
              tarjeta digital.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#alta"
                className="inline-flex items-center gap-2 rounded-full bg-[#FFC600] px-7 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFD34A] hover:shadow-[0_18px_50px_rgba(255,211,74,0.35)] lg:hidden"
              >
                Darme de alta
                <span aria-hidden="true">→</span>
              </a>
              <a
                href={whatsappHref("Hola, quiero información del Club Yantissimo")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-[#25D366] hover:text-[#25D366]"
              >
                <WhatsappIcon className="h-4 w-4" />
                {WHATSAPP_DISPLAY}
              </a>
            </div>

            <ul className="m-0 mt-2 flex flex-wrap gap-x-8 gap-y-3 p-0">
              {[
                "Alta gratis en 2 minutos",
                "Sin app que descargar",
                `Válido en las ${BRANCHES.length} sucursales`,
              ].map((t) => (
                <li
                  key={t}
                  className="flex list-none items-center gap-2 text-[14px] text-white/60"
                >
                  <span className="text-[#FFC600]" aria-hidden="true">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <ClubSignupCard />
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-t border-white/10 bg-[#121212] px-6 py-20 md:px-14">
        <div className="mx-auto max-w-[1280px]">
          <Kicker>Lo que te llevas</Kicker>
          <h2
            className="m-0 mt-3 font-black uppercase leading-[0.95] tracking-[0.04em]"
            style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(38px,4.5vw,68px)" }}
          >
            Beneficios del Club
          </h2>

          {beneficios.length ? (
            <ul className="m-0 mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {beneficios.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#FFC600]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="m-0 text-[17px] font-bold leading-snug text-white">
                      {String(b.name || "").trim()}
                    </h3>
                    {b.yearly_quota ? (
                      <span className="shrink-0 rounded-full border border-[#FFC600]/40 bg-[#FFC600]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FFD34A]">
                        {b.yearly_quota} al año
                      </span>
                    ) : null}
                  </div>
                  {b.description ? (
                    <p className="m-0 text-[14px] leading-relaxed text-white/55">
                      {b.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 max-w-[560px] text-[16px] leading-relaxed text-white/55">
              Estamos actualizando la lista de beneficios. Regístrate ahora y
              pregunta por ellos en tu sucursal: tu membresía queda lista de
              todos modos.
            </p>
          )}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-t border-white/10 px-6 py-20 md:px-14">
        <div className="mx-auto max-w-[1280px]">
          <Kicker>Cómo funciona</Kicker>
          <h2
            className="m-0 mt-3 font-black uppercase leading-[0.95] tracking-[0.04em]"
            style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(38px,4.5vw,68px)" }}
          >
            Cuatro pasos
          </h2>
          <ol className="m-0 mt-10 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p) => (
              <li
                key={p.n}
                className="flex flex-col gap-3 border-t-2 border-[#FFC600] pt-5"
              >
                <span
                  className="text-[40px] font-black leading-none text-[#FFC600]"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  {p.n}
                </span>
                <h3 className="m-0 text-[18px] font-bold text-white">
                  {p.titulo}
                </h3>
                <p className="m-0 text-[14px] leading-relaxed text-white/55">
                  {p.texto}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <ShieldIcon className="mt-0.5 h-6 w-6 shrink-0 text-[#FFC600]" />
            <p className="m-0 max-w-[720px] text-[14px] leading-relaxed text-white/60">
              <strong className="font-semibold text-white">
                Tu número está protegido.
              </strong>{" "}
              No consultamos ni modificamos tu cuenta antes de que confirmes el
              código de WhatsApp, así que nadie puede darte de alta ni averiguar
              si eres cliente usando tu teléfono.
            </p>
          </div>
        </div>
      </section>

      {/* Preguntas */}
      <section className="border-t border-white/10 bg-[#121212] px-6 py-20 md:px-14">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Kicker>Dudas</Kicker>
            <h2
              className="m-0 mt-3 font-black uppercase leading-[0.95] tracking-[0.04em]"
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: "clamp(38px,4.5vw,68px)",
              }}
            >
              Preguntas
              <br />
              <span className="text-[#FFC600]">frecuentes</span>
            </h2>
          </div>
          <div className="flex flex-col">
            {FAQ.map((f) => (
              <details
                key={f.p}
                className="group border-b border-white/10 py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold text-white transition-colors hover:text-[#FFC600]">
                  {f.p}
                  <span
                    className="text-[#FFC600] transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="m-0 mt-3 max-w-[640px] text-[14px] leading-relaxed text-white/55">
                  {f.r}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section className="border-t border-white/10 px-6 py-20 text-center md:px-14">
        <h2
          className="m-0 font-black uppercase leading-[0.9] tracking-[0.04em]"
          style={{ fontFamily: DISPLAY_FONT, fontSize: "clamp(40px,5vw,80px)" }}
        >
          ¿Listo para <span className="text-[#FFC600]">entrar?</span>
        </h2>
        <p className="mx-auto m-0 mt-4 max-w-[460px] text-[16px] leading-relaxed text-white/60">
          Dos minutos y tu tarjeta queda en tu celular.
        </p>
        <a
          href="#alta"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FFC600] px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFD34A] hover:shadow-[0_18px_50px_rgba(255,211,74,0.35)]"
        >
          Unirme al Club
          <span aria-hidden="true">→</span>
        </a>
      </section>
    </div>
  );
}

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
      {children}
    </p>
  );
}
