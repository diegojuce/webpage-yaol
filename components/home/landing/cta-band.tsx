"use client";

import Link from "next/link";
import { PinIcon, WhatsappIcon } from "components/yantissimo/icons";
import { ReactNode, useState } from "react";
import { ArrowRightIcon, CalendarIcon } from "./icons";

export function CtaBand() {
  return (
    <section
      id="contacto"
      className="bg-[#0F0F0F] px-6 py-24 text-white md:px-14"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col gap-3.5">
          <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
            Hablemos
          </p>
          <h2
            className="m-0 font-black uppercase leading-[0.9] tracking-[0.04em]"
            style={{
              fontFamily: "'Staatliches','Fjalla One',sans-serif",
              fontSize: "clamp(56px,6.5vw,108px)",
            }}
          >
            ¿Listo para
            <br />
            <span className="text-[#FFC600]">rodar?</span>
          </h2>
          <p className="m-0 mt-2 max-w-[380px] text-[17px] leading-[1.55] text-white/70">
            Cotiza llantas, agenda un servicio o consulta una medida. Te
            respondemos en menos de 5 minutos en horario hábil.
          </p>
        </div>
        <div className="flex flex-col gap-3.5">
          <CtaTile
            kicker="01 · ESCRÍBENOS"
            title="WhatsApp directo"
            sub="Un solo número para las 6 sucursales · 312 222 0099"
            cta="Abrir WhatsApp"
            icon={<WhatsappIcon className="h-6.5 w-6.5" />}
            accent="#25D366"
            href="https://wa.me/523122220099"
            external
          />
          <CtaTile
            kicker="02 · VISÍTANOS"
            title="Encuentra tu sucursal"
            sub="6 talleres en Colima, Villa de Álvarez y Manzanillo"
            cta="Ver mapa"
            icon={<PinIcon className="h-6.5 w-6.5" />}
            accent="#FFC600"
            href="/ubicaciones"
          />
          <CtaTile
            kicker="03 · AGENDA"
            title="Reserva cita en línea"
            sub="Llantas, alineación, frenos · entrega misma hora"
            cta="Agendar cita"
            icon={<CalendarIcon width={26} height={26} />}
            accent="#FFC600"
            href="/agendar-cita"
          />
        </div>
      </div>
    </section>
  );
}

type CtaTileProps = {
  kicker: string;
  title: string;
  sub: string;
  cta: string;
  icon: ReactNode;
  accent: string;
  href: string;
  external?: boolean;
};

function CtaTile({
  kicker,
  title,
  sub,
  cta,
  icon,
  accent,
  href,
  external,
}: CtaTileProps) {
  const [h, setH] = useState(false);
  const content = (
    <span
      className="flex items-center gap-5 rounded-2xl border px-5 py-5 transition-colors duration-300"
      style={{
        borderColor: h ? accent : "#232323",
        background: h ? "#1B1B1D" : "#141414",
      }}
    >
      <span
        className="inline-flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[14px]"
        style={{
          background:
            accent === "#25D366"
              ? "rgba(37,211,102,0.12)"
              : "rgba(255,198,0,0.12)",
          color: accent,
        }}
      >
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-1.5">
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {kicker}
        </span>
        <span className="text-[20px] font-extrabold tracking-[0.01em] text-white">
          {title}
        </span>
        <span className="text-[13px] leading-[1.45] text-white/60">{sub}</span>
        <span
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color: accent }}
        >
          {cta}
          <ArrowRightIcon
            width={12}
            height={12}
            style={{
              transition: "transform .25s ease",
              transform: h ? "translateX(4px)" : "translateX(0)",
            }}
          />
        </span>
      </span>
    </span>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        className="no-underline"
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="no-underline"
    >
      {content}
    </Link>
  );
}
