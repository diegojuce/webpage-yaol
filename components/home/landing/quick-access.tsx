"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon, CarIcon, TireIcon, TruckIcon } from "./icons";
import { PhotoSlot } from "./photo-slot";

type Cat = {
  id: string;
  label: string;
  sub: string;
  count: string;
  icon: "car" | "truck" | "tire";
  hue: number;
  href: string;
  // To use a real photo, drop the file at the path shown in slot
  // and set src to that path (e.g. "/images/home/quick-access/auto.jpg").
  src?: string;
  scene: "car" | "tire" | "tread";
};

const CATEGORIES: Cat[] = [
  {
    id: "auto",
    label: "AUTO",
    sub: "Sedán y compacto",
    count: "+ 380 modelos",
    icon: "car",
    hue: 24,
    href: "/search?kind=vehiculo&value=sedan",
    scene: "car",
    // slot: /images/home/quick-access/auto.jpg
  },
  {
    id: "suv",
    label: "SUV",
    sub: "Camionetas",
    count: "+ 240 modelos",
    icon: "truck",
    hue: 32,
    href: "/search?kind=vehiculo&value=suv",
    scene: "tire",
    // slot: /images/home/quick-access/suv.jpg
  },
  {
    id: "camion",
    label: "CAMIÓN",
    sub: "Pickup y carga",
    count: "+ 120 modelos",
    icon: "truck",
    hue: 18,
    href: "/search?kind=vehiculo&value=pickup",
    scene: "tire",
    // slot: /images/home/quick-access/camion.jpg
  },
  {
    id: "offroad",
    label: "OFF-ROAD",
    sub: "AT y Mud",
    count: "+ 90 modelos",
    icon: "tire",
    hue: 38,
    href: "/search?kind=tipo&value=off-road",
    scene: "tread",
    // slot: /images/home/quick-access/offroad.jpg
  },
];

export function QuickAccess() {
  return (
    <section className="bg-[#0F0F0F] px-6 pb-10 pt-16 text-white md:px-14 md:pt-[72px]">
      <header className="mb-7 flex items-end gap-4">
        <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
          Explora por uso
        </p>
        <h2
          className="m-0 pl-3.5 font-black uppercase leading-none tracking-[0.04em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: "clamp(40px, 4vw, 56px)",
          }}
        >
          ¿Qué mueves?
        </h2>
        <span className="flex-1" />
        <Link
          href="/search"
          prefetch={false}
          className="hidden items-center gap-2 pb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white md:inline-flex"
        >
          Ver catálogo completo
          <ArrowRightIcon width={14} height={14} />
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <QACard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}

function QACard({ c }: { c: Cat }) {
  const [h, setH] = useState(false);
  const Icon = c.icon === "car" ? CarIcon : c.icon === "truck" ? TruckIcon : TireIcon;
  return (
    <Link
      href={c.href}
      prefetch={false}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="group relative h-[230px] overflow-hidden rounded-[18px] border transition-all duration-300"
      style={{
        background: h ? "#FFC600" : "#141414",
        color: h ? "#0F0F0F" : "#fff",
        borderColor: h ? "#FFC600" : "#1F1F1F",
        transform: h ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: h ? 0 : 0.6 }}
      >
        <PhotoSlot src={c.src} alt={c.label} hue={c.hue} scene={c.scene} dense />
      </div>
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{ background: h ? "transparent" : "rgba(10,10,10,0.55)" }}
      />
      <div className="relative flex h-full flex-col gap-1.5 px-5 py-5">
        <span
          className="inline-flex h-12 w-12 items-center justify-center rounded-[12px] transition-colors"
          style={{
            background: h ? "#0F0F0F" : "rgba(255,255,255,0.08)",
            color: "#FFC600",
            border: h ? "none" : "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Icon width={22} height={22} />
        </span>
        <div className="flex-1" />
        <span
          className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
          style={{ opacity: 0.7 }}
        >
          {c.count}
        </span>
        <h3
          className="m-0 font-black uppercase leading-none tracking-[0.04em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: 36,
            color: h ? "#0F0F0F" : "#fff",
          }}
        >
          {c.label}
        </h3>
        <p
          className="m-0 text-[13px] leading-[1.4]"
          style={{ color: h ? "rgba(15,15,15,0.7)" : "rgba(255,255,255,0.6)" }}
        >
          {c.sub}
        </p>
        <div
          className="mt-2 flex items-center justify-between border-t pt-3.5"
          style={{ borderColor: "currentColor", opacity: 0.95 }}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em]">
            Ver llantas
          </span>
          <span
            className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full transition-transform"
            style={{
              background: h ? "#0F0F0F" : "#FFC600",
              color: h ? "#FFC600" : "#0F0F0F",
              transform: h ? "translateX(4px)" : "translateX(0)",
            }}
          >
            <ArrowRightIcon width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
