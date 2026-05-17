"use client";

import { useState } from "react";
import { ArrowRightIcon, StarIcon } from "./icons";

type PkVariant = "outline" | "yellow" | "black";

type Paquete = {
  tier: string;
  name: string;
  tagline: string;
  desc: string;
  includes: string[];
  variant: PkVariant;
  featured?: boolean;
};

const PAQUETES: Paquete[] = [
  {
    tier: "01",
    name: "PAQUETE 1",
    tagline: "MANTENIMIENTO ESENCIAL",
    desc: "Lo básico para mantener tu llanta sana entre temporadas.",
    includes: [
      "Revisión vehicular Yantissimo",
      "Rotación de las 4 llantas",
      "Recarga de nitrógeno",
    ],
    variant: "outline",
  },
  {
    tier: "02",
    name: "PAQUETE 2",
    tagline: "MANTENIMIENTO + BALANCEO",
    desc: "Suma balanceo profesional para eliminar vibraciones y desgaste irregular.",
    includes: [
      "Revisión vehicular Yantissimo",
      "Rotación de las 4 llantas",
      "Balanceo de las 4 llantas",
      "Recarga de nitrógeno",
    ],
    variant: "yellow",
    featured: true,
  },
  {
    tier: "03",
    name: "PAQUETE 3",
    tagline: "CUIDADO INTEGRAL",
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

const PK_VARIANTS: Record<PkVariant, {
  bg: string;
  fg: string;
  mute: string;
  border: string;
  tierColor: string;
  taglineColor: string;
  checkBg: string;
  checkFg: string;
  divider: string;
  cta: { bg: string; fg: string };
}> = {
  outline: {
    bg: "#FFFFFF",
    fg: "#0F0F0F",
    mute: "#525252",
    border: "1px solid #E5E5E5",
    tierColor: "#9EA0A3",
    taglineColor: "#D19D00",
    checkBg: "#FFF6CC",
    checkFg: "#0F0F0F",
    divider: "#ECECEC",
    cta: { bg: "#0F0F0F", fg: "#FFC600" },
  },
  yellow: {
    bg: "#FFC600",
    fg: "#0F0F0F",
    mute: "rgba(15,15,15,0.72)",
    border: "none",
    tierColor: "rgba(15,15,15,0.5)",
    taglineColor: "rgba(15,15,15,0.6)",
    checkBg: "#0F0F0F",
    checkFg: "#FFC600",
    divider: "rgba(15,15,15,0.2)",
    cta: { bg: "#0F0F0F", fg: "#FFC600" },
  },
  black: {
    bg: "#0F0F0F",
    fg: "#fff",
    mute: "rgba(255,255,255,0.7)",
    border: "none",
    tierColor: "#FFC600",
    taglineColor: "#FFC600",
    checkBg: "rgba(255,198,0,0.16)",
    checkFg: "#FFC600",
    divider: "rgba(255,255,255,0.1)",
    cta: { bg: "#FFC600", fg: "#0F0F0F" },
  },
};

export function Paquetes() {
  return (
    <section
      id="paquetes"
      className="border-y border-[#EDEDED] bg-white px-6 pb-24 pt-24 text-[#0F0F0F] md:px-14"
    >
      <header className="mx-auto mb-16 max-w-[1080px] text-center">
        <p className="m-0 mb-4 text-[13px] font-bold uppercase tracking-[0.22em] text-[#D19D00]">
          Nuestros paquetes · 03 niveles
        </p>
        <h2
          className="m-0 font-black uppercase leading-[0.92] tracking-[0.02em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: "clamp(52px, 6.5vw, 100px)",
          }}
        >
          3 paquetes{" "}
          <span
            className="inline-block bg-[#FFC600] px-[0.14em] pb-[0.02em] leading-[0.92]"
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            pensados
          </span>
          <br />
          para tu auto.
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-[16px] leading-[1.6] text-[#525252]">
          Combinamos los servicios más comunes en paquetes con precio claro.
          Llega, los aplicamos en la misma cita y te vas con todo listo.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-stretch gap-5 pt-3.5 md:grid-cols-3">
        {PAQUETES.map((p) => (
          <PaqueteCard key={p.tier} p={p} />
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-[#EDEDED] pt-8 text-[13px] text-[#525252]">
        <span>
          ¿Tienes flotilla o 2+ autos? Pregunta por nuestros paquetes para 2 o 4
          montajes.
        </span>
        <a
          href="https://wa.me/523122220099"
          target="_blank"
          rel="noopener noreferrer"
          className="border-b-2 border-[#FFC600] pb-0.5 text-[14px] font-bold tracking-[0.02em] text-[#0F0F0F]"
        >
          Cotizar a la medida por WhatsApp →
        </a>
      </div>
    </section>
  );
}

function PaqueteCard({ p }: { p: Paquete }) {
  const [h, setH] = useState(false);
  const v = PK_VARIANTS[p.variant];
  const featured = !!p.featured;
  const featuredOffset = featured ? -10 : 0;
  return (
    <article
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="relative flex min-h-[520px] flex-col gap-5 rounded-[24px] px-8 pb-8 pt-9 transition-transform duration-300"
      style={{
        background: v.bg,
        color: v.fg,
        border: v.border,
        transform: `translateY(${h ? featuredOffset - 4 : featuredOffset}px)`,
      }}
    >
      {featured && (
        <span
          className="absolute left-1/2 top-[-14px] inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-[#0F0F0F] px-4 py-1.5 text-[13px] tracking-[0.16em] text-[#FFC600]"
          style={{ fontFamily: "'Staatliches','Fjalla One',sans-serif" }}
        >
          <StarIcon width={11} height={11} /> MÁS POPULAR
        </span>
      )}

      <div className="flex items-center justify-between">
        <span
          className="tracking-[0.16em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: 14,
            color: v.tierColor,
          }}
        >
          {p.tier}
        </span>
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.2em]"
          style={{ color: v.taglineColor }}
        >
          · {p.tagline}
        </span>
      </div>

      <div>
        <h3
          className="m-0 font-black uppercase leading-[0.95] tracking-[0.03em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: 46,
          }}
        >
          {p.name}
        </h3>
        <p
          className="m-0 mt-3.5 text-[14.5px] leading-[1.55]"
          style={{ color: v.mute }}
        >
          {p.desc}
        </p>
      </div>

      <ul className="m-0 flex flex-1 list-none flex-col gap-3 p-0">
        {p.includes.map((it) => (
          <li
            key={it}
            className="flex items-start gap-3 text-[14px] leading-[1.45]"
            style={{ color: v.fg }}
          >
            <span
              className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold"
              style={{ background: v.checkBg, color: v.checkFg }}
            >
              ✓
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>

      <a
        href="https://wa.me/523122220099"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3.5 text-[14px] font-extrabold no-underline transition-transform"
        style={{
          background: v.cta.bg,
          color: v.cta.fg,
          transform: h ? "scale(1.015)" : "scale(1)",
        }}
      >
        Agendar {p.name.toLowerCase()}
        <ArrowRightIcon width={14} height={14} />
      </a>
    </article>
  );
}
