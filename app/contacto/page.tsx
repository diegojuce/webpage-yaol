import { ScrollToTopOnMount } from "components/scroll-to-top-on-mount";
import {
  ArrowIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  ShieldIcon,
  TiktokIcon,
  WhatsappIcon,
} from "components/yantissimo/icons";
import {
  BRANCHES,
  COMPANY,
  HOURS,
  SOCIALS,
  WHATSAPP_DISPLAY,
  telHref,
  whatsappHref,
} from "lib/company";
import type { ComponentType, SVGProps } from "react";

export const metadata = {
  title: "Contacto · WhatsApp y teléfonos por sucursal | Yantissimo",
  description:
    "Cotiza llantas en segundos por WhatsApp con nuestro agente, agenda servicios o llama directo a cualquiera de nuestras 6 sucursales en Colima y Manzanillo.",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto Yantissimo · Cotiza en segundos",
    description:
      "WhatsApp central 312 222 0099, teléfonos directos por sucursal, formulario y horarios. L-V 9-19, Sáb 9-14.",
    url: "https://yantissimo.com/contacto",
    type: "website",
  },
};

type IntentCardProps = {
  tag: string;
  title: string;
  body: string;
  cta: { label: string; href: string; icon: ComponentType<SVGProps<SVGSVGElement>> };
  secondary: string;
  accent?: boolean;
};

const INTENTS: IntentCardProps[] = [
  {
    tag: "01 · Inmediato",
    title: "Cotizar llantas",
    body: "Mándanos foto del costado, marca y modelo de auto.",
    cta: {
      label: "WhatsApp ahora",
      href: whatsappHref("Hola, quiero cotizar llantas"),
      icon: WhatsappIcon,
    },
    secondary: "Cotización al instante con nuestro agente",
    accent: true,
  },
  {
    tag: "02 · Cita",
    title: "Agendar servicio",
    body: "Alineación, frenos, afinación o balanceo. Te confirmamos hora.",
    cta: { label: "Agendar en línea", href: "/agendar", icon: ArrowIcon },
    secondary: "Confirmación por SMS y WhatsApp",
  },
  {
    tag: "03 · B2B",
    title: "Flotillas",
    body: "Mantenimiento programado para empresas y rentadoras.",
    cta: {
      label: "Hablar con ventas",
      href: `mailto:${COMPANY.fleetEmail}?subject=Flotillas`,
      icon: MailIcon,
    },
    secondary: COMPANY.fleetEmail,
  },
  {
    tag: "04 · Seguimiento",
    title: "Garantía o post-venta",
    body: "¿Algo no quedó bien? Lo resolvemos en la misma sucursal.",
    cta: {
      label: "Reportar caso",
      href: whatsappHref("Hola, tengo un caso de garantía / post-venta"),
      icon: ShieldIcon,
    },
    secondary: "Cobertura escrita en cada nota",
  },
];

const SOCIAL_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  fb: FacebookIcon,
  ig: InstagramIcon,
  tk: TiktokIcon,
};

function buildContactJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
    url: COMPANY.website,
    email: COMPANY.email,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["es-MX"],
        telephone: `+52${WHATSAPP_DISPLAY.replace(/\s/g, "")}`,
        contactOption: "WhatsApp",
        areaServed: "MX",
      },
      ...BRANCHES.map((b) => ({
        "@type": "ContactPoint",
        contactType: "branch",
        name: `Yantissimo ${b.name}`,
        telephone: `+52${b.phone.replace(/\s/g, "")}`,
        areaServed: b.city,
      })),
    ],
  };
}

export default function ContactoPage() {
  return (
    <div className="mt-28 min-h-screen bg-white text-[#0F0F0F]">
      <ScrollToTopOnMount behavior="auto" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildContactJsonLd()) }}
      />

      {/* HERO */}
      <section className="px-6 pt-16 pb-8 md:px-12 md:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D19D00] md:text-sm">
            Hablemos
          </p>
          <h1 className="mt-4 mb-6 font-staatliches text-5xl font-black uppercase leading-[0.95] tracking-[0.03em] md:text-7xl lg:text-[88px]">
            ¿Cómo te
            <br />
            ayudamos hoy?
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg">
            Elige el canal y te llevamos directo con quien resuelve. Cotizamos
            llantas en segundos por WhatsApp; en el taller te atiende una persona.
          </p>
        </div>
      </section>

      {/* INTENT GRID */}
      <section className="px-6 py-8 md:px-12 md:py-12">
        <div className="mx-auto grid max-w-7xl gap-3.5 md:grid-cols-2 lg:grid-cols-4">
          {INTENTS.map((it) => (
            <IntentCard key={it.tag} {...it} />
          ))}
        </div>
      </section>

      {/* PHONE DIRECTORY BAND */}
      <section className="bg-[#0F0F0F] px-6 py-14 text-white md:px-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[320px,1fr] md:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD34A]">
              O llama directo
            </p>
            <h2 className="mt-3 mb-4 font-staatliches text-4xl font-black uppercase leading-none tracking-[0.04em] md:text-5xl">
              Contesta
              <br />
              una persona.
            </h2>
            <p className="text-sm leading-relaxed text-[#9EA0A3] md:text-[15px]">
              Llama a la sucursal que más te quede; te atiende el equipo del taller.
            </p>
            <p className="mt-3.5 inline-flex items-start gap-2 text-xs leading-relaxed text-[#9EA0A3]">
              <PhoneIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFD34A]" />
              <span>
                Las líneas de sucursal son{" "}
                <strong className="text-white">solo para llamadas</strong>.
                <br />
                WhatsApp se atiende desde el número central{" "}
                <strong className="text-[#FFC600]">{WHATSAPP_DISPLAY}</strong>.
              </span>
            </p>
          </div>
          <div className="grid gap-0 md:grid-cols-3">
            {BRANCHES.map((b, i) => (
              <a
                key={b.id}
                href={telHref(b.phone)}
                className={`flex flex-col gap-1.5 px-5 py-5 text-white transition hover:bg-white/5 ${
                  (i + 1) % 3 === 0 ? "" : "md:border-r md:border-white/10"
                } ${i < 3 ? "md:border-b md:border-white/10" : ""}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9EA0A3]">
                  {b.city}
                </span>
                <span className="font-staatliches text-lg font-extrabold uppercase tracking-[0.02em]">
                  {b.name}
                </span>
                <span className="font-staatliches text-2xl tracking-[0.04em] text-[#FFC600] md:text-[26px]">
                  {b.phone}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HORARIOS · OFICINAS · SOCIAL */}
      <section className="px-6 pt-16 pb-8 md:px-12 md:pt-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <div className="border-t-2 border-[#FFC600] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9EA0A3]">
              Horario general
            </p>
            <h3 className="mt-3.5 mb-4 font-staatliches text-2xl font-black uppercase tracking-[0.02em]">
              De lunes a sábado
            </h3>
            <ul className="flex flex-col gap-2">
              {HOURS.map((h) => (
                <li
                  key={h.d}
                  className={`flex justify-between text-sm ${
                    h.closed ? "text-[#9EA0A3]" : "text-[#0F0F0F]"
                  }`}
                >
                  <span className="font-medium">{h.d}</span>
                  <span className="font-bold">{h.h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t-2 border-[#FFC600] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9EA0A3]">
              Oficinas centrales
            </p>
            <h3 className="mt-3.5 mb-4 font-staatliches text-2xl font-black uppercase tracking-[0.02em]">
              Villa de Álvarez
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600">
              {COMPANY.hqAddress.street}
              <br />
              {COMPANY.hqAddress.postalCode} {COMPANY.hqAddress.city},{" "}
              {COMPANY.hqAddress.state}
              <br />
              <a
                href={`mailto:${COMPANY.email}`}
                className="font-bold text-[#0F0F0F] hover:text-[#D19D00]"
              >
                {COMPANY.email}
              </a>
            </p>
          </div>

          <div className="border-t-2 border-[#FFC600] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9EA0A3]">
              Redes sociales
            </p>
            <h3 className="mt-3.5 mb-4 font-staatliches text-2xl font-black uppercase tracking-[0.02em]">
              Síguenos
            </h3>
            <div className="flex flex-col gap-2.5">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.id]!;
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-sm font-semibold text-[#0F0F0F] transition hover:text-[#D19D00]"
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {s.name}{" "}
                    <span className="font-medium text-[#9EA0A3]">· {s.handle}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pt-12 pb-24 md:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-3xl bg-[#FFC600] p-8 text-[#0F0F0F] md:grid-cols-[1.4fr,1fr] md:gap-10 md:p-12">
          <div>
            <h3 className="font-staatliches text-4xl font-black uppercase leading-none tracking-[0.04em] md:text-5xl">
              ¿Llanta ponchada
              <br />
              ahora mismo?
            </h3>
            <p className="mt-3.5 max-w-lg text-base text-black/75">
              Llámanos a la sucursal más cercana; si está abierta te recibimos
              sin cita. Sábados atendemos hasta las 14:00.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <a
              href={whatsappHref("Hola, necesito ayuda urgente")}
              className="flex items-center justify-between rounded-2xl bg-[#25D366] px-5 py-4 text-base font-extrabold text-[#0a2e15] transition hover:bg-[#22c55e]"
            >
              <span className="inline-flex items-center gap-2">
                <WhatsappIcon className="h-4 w-4" /> WhatsApp · {WHATSAPP_DISPLAY}
              </span>
              <ArrowIcon className="h-4 w-4" />
            </a>
            <a
              href="#contacto-directorio"
              className="flex items-center justify-between rounded-2xl bg-[#0F0F0F] px-5 py-4 text-base font-extrabold text-white transition hover:bg-neutral-800"
            >
              <span className="inline-flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" /> Llamar a tu sucursal
              </span>
              <ArrowIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function IntentCard({ tag, title, body, cta, secondary, accent }: IntentCardProps) {
  const Icon = cta.icon;
  return (
    <article
      className={`flex min-h-[280px] flex-col gap-3.5 rounded-2xl border p-7 ${
        accent
          ? "border-[#0F0F0F] bg-[#0F0F0F] text-white"
          : "border-neutral-200 bg-white text-[#0F0F0F]"
      }`}
    >
      <span
        className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
          accent ? "text-[#FFD34A]" : "text-[#9EA0A3]"
        }`}
      >
        {tag}
      </span>
      <h3 className="font-staatliches text-2xl font-black uppercase leading-none tracking-[0.03em] md:text-[28px]">
        {title}
      </h3>
      <p
        className={`text-sm leading-relaxed ${
          accent ? "text-white/70" : "text-neutral-600"
        }`}
      >
        {body}
      </p>
      <div className="mt-auto flex flex-col gap-2.5">
        <a
          href={cta.href}
          target={cta.href.startsWith("http") ? "_blank" : undefined}
          rel={cta.href.startsWith("http") ? "noreferrer" : undefined}
          className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-3 text-[13px] font-extrabold tracking-[0.04em] transition ${
            accent
              ? "bg-[#FFC600] text-[#0F0F0F] hover:bg-[#FFD34A]"
              : "bg-[#0F0F0F] text-white hover:bg-neutral-800"
          }`}
        >
          <Icon className="h-3.5 w-3.5" /> {cta.label}
        </a>
        <span
          className={`text-[11px] tracking-[0.04em] ${
            accent ? "text-white/50" : "text-[#9EA0A3]"
          }`}
        >
          {secondary}
        </span>
      </div>
    </article>
  );
}
