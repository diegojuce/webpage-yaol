"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "./icons";

type Variant = "yellow" | "striped" | "black" | "white";

type Svc = {
  n: string;
  title: string;
  sub: string;
  count: string;
  icon: string;
  variant: Variant;
  href: string;
};

const SERVICES: Svc[] = [
  { n: "01", title: "AFINACIÓN", sub: "Mayor y menor", count: "10+ SERVICIOS", icon: "/Recurso 3.svg", variant: "yellow", href: "/servicios#afinacion" },
  { n: "02", title: "ALINEACIÓN 3D", sub: "Y escantillón", count: "8 MODALIDADES", icon: "/Recurso 5.svg", variant: "striped", href: "/servicios#alineacion" },
  { n: "03", title: "VENTA Y MONTAJE", sub: "De llantas", count: "TODAS LAS MEDIDAS", icon: "/Recurso 4.svg", variant: "black", href: "/servicios#montaje" },
  { n: "04", title: "SUSPENSIÓN", sub: "Y amortiguadores", count: "12+ PIEZAS", icon: "/Recurso 6.svg", variant: "white", href: "/servicios#suspension" },
  { n: "05", title: "FRENOS", sub: "Y balatas", count: "12+ SERVICIOS", icon: "/Recurso 8.svg", variant: "black", href: "/servicios#frenos" },
  { n: "06", title: "BALANCEO PRO", sub: "Profesional", count: "ACERO · DEPORTIVO · OFF-ROAD", icon: "/Recurso 9.svg", variant: "striped", href: "/servicios#balanceo" },
  { n: "07", title: "NITRÓGENO", sub: "Recarga & rotación", count: "INCLUIDO EN PAQUETES", icon: "/Recurso 7.svg", variant: "yellow", href: "/servicios#balanceo" },
];

const STRIPE_PATTERN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'><line x1='-2' y1='14' x2='14' y2='-2' stroke='rgba(255,255,255,0.06)' stroke-width='1.5'/><line x1='0' y1='16' x2='16' y2='0' stroke='rgba(255,255,255,0.06)' stroke-width='1.5'/></svg>\")";

const VARIANTS: Record<Variant, {
  bg: string;
  fg: string;
  sub: string;
  border: string;
  num: string;
  divider: string;
  foot: string;
  iconFilter: string;
}> = {
  yellow: {
    bg: "#FFC600",
    fg: "#0F0F0F",
    sub: "rgba(15,15,15,0.72)",
    border: "none",
    num: "rgba(15,15,15,0.45)",
    divider: "rgba(15,15,15,0.18)",
    foot: "rgba(15,15,15,0.7)",
    iconFilter: "brightness(0)",
  },
  striped: {
    bg: `${STRIPE_PATTERN}, #2A1F18`,
    fg: "#fff",
    sub: "rgba(255,255,255,0.7)",
    border: "none",
    num: "#FFC600",
    divider: "rgba(255,255,255,0.14)",
    foot: "rgba(255,255,255,0.7)",
    iconFilter: "brightness(0) invert(1)",
  },
  black: {
    bg: "#0F0F0F",
    fg: "#fff",
    sub: "rgba(255,255,255,0.7)",
    border: "none",
    num: "#FFC600",
    divider: "rgba(255,255,255,0.14)",
    foot: "rgba(255,255,255,0.7)",
    iconFilter: "brightness(0) invert(1)",
  },
  white: {
    bg: "#FFFFFF",
    fg: "#0F0F0F",
    sub: "rgba(15,15,15,0.62)",
    border: "1px solid #E5E5E5",
    num: "#D19D00",
    divider: "#ECECEC",
    foot: "rgba(15,15,15,0.6)",
    iconFilter: "brightness(0)",
  },
};

export function Services() {
  return (
    <section
      id="servicios"
      className="bg-[#FAFAFA] px-6 pb-28 pt-24 text-[#0F0F0F] md:px-14"
    >
      <header className="mx-auto mb-14 flex max-w-[1280px] flex-wrap items-end justify-between gap-12">
        <div className="min-w-[280px] flex-1">
          <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#D19D00]">
            Nuestros servicios · 07 líneas
          </p>
          <h2
            className="m-0 mt-3.5 font-black uppercase leading-[0.92] tracking-[0.02em]"
            style={{
              fontFamily: "'Staatliches','Fjalla One',sans-serif",
              fontSize: "clamp(52px, 6.5vw, 110px)",
            }}
          >
            Lo que{" "}
            <span
              className="inline-block bg-[#FFC600] px-[0.14em] pb-[0.02em] leading-[0.92]"
              style={{
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
              }}
            >
              hacemos
            </span>
            <br />
            por tu auto.
          </h2>
        </div>
        <p className="m-0 mb-2 max-w-[380px] text-[15px] leading-[1.55] text-[#525252]">
          Siete líneas de servicio que cubren lo esencial del mantenimiento
          automotriz. Cada visita se diagnostica, se cotiza y se ejecuta por
          técnicos certificados.
        </p>
      </header>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => (
          <SvcCard key={s.n} svc={s} />
        ))}
      </div>
    </section>
  );
}

function SvcCard({ svc }: { svc: Svc }) {
  const [h, setH] = useState(false);
  const v = VARIANTS[svc.variant];
  return (
    <Link
      href={svc.href}
      prefetch={false}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="relative flex min-h-[260px] cursor-pointer flex-col rounded-[18px] px-6 pb-5 pt-6 transition-transform duration-300"
      style={{
        background: v.bg,
        color: v.fg,
        border: v.border,
        transform: h ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="tracking-[0.18em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: 14,
            color: v.num,
          }}
        >
          {svc.n}
        </span>
        <span
          className="relative h-[46px] w-[46px] transition-transform duration-500"
          style={{
            transform: h ? "translateY(-2px) rotate(-3deg)" : "translateY(0) rotate(0)",
          }}
        >
          <Image
            src={svc.icon}
            alt=""
            fill
            sizes="46px"
            className="object-contain"
            style={{ filter: v.iconFilter }}
          />
        </span>
      </div>
      <div className="flex-1" />
      <h3
        className="m-0 font-black uppercase leading-none tracking-[0.04em]"
        style={{
          fontFamily: "'Staatliches','Fjalla One',sans-serif",
          fontSize: "clamp(22px, 1.8vw, 28px)",
          color: v.fg,
        }}
      >
        {svc.title}
      </h3>
      <p
        className="m-0 mt-2 text-[13.5px] leading-[1.4]"
        style={{ color: v.sub }}
      >
        {svc.sub}
      </p>
      <div
        className="my-[18px] mb-3.5 mt-[18px] h-px"
        style={{ background: v.divider }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]"
          style={{ color: v.foot }}
        >
          {svc.count}
        </span>
        <span
          className="inline-flex items-center transition-transform"
          style={{
            color: v.fg,
            transform: h ? "translateX(6px)" : "translateX(0)",
          }}
        >
          <ArrowRightIcon width={16} height={16} />
        </span>
      </div>
    </Link>
  );
}
