"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldIcon } from "components/yantissimo/icons";
import { ArrowRightIcon, CartIcon, StarIcon, WrenchIcon } from "./icons";
import { PhotoSlot } from "./photo-slot";

type Product = {
  brand: string;
  name: string;
  size: string;
  size2?: string;
  price: string;
  was: string | null;
  tag: string | null;
  rating: number;
  scene: "tire" | "tread";
  hue: number;
  // To use a real photo, drop the file at /images/home/featured/tire-N.jpg
  // and set src to that path.
  src?: string;
};

const PRODUCTS: Product[] = [
  { brand: "MICHELIN", name: "Primacy 4 ST", size: "205/55 R16 91V", price: "$2,499", was: "$2,799", tag: "Más vendida", rating: 4.8, scene: "tire", hue: 24 },
  { brand: "GOODYEAR", name: "Eagle Sport", size: "195/65 R15 91H", price: "$1,890", was: null, tag: null, rating: 4.6, scene: "tread", hue: 20 },
  { brand: "BRIDGESTONE", name: "Turanza T005", size: "225/45 R17 91Y", price: "$3,199", was: null, tag: "Premium", rating: 4.9, scene: "tire", hue: 14 },
  { brand: "BFGOODRICH", name: "All-Terrain T/A", size: "265/70 R17 121S", size2: "10 ply", price: "$4,750", was: "$5,250", tag: "Off-road", rating: 4.9, scene: "tread", hue: 36 },
  { brand: "PIRELLI", name: "P7 Cinturato", size: "225/50 R17 94W", price: "$2,990", was: null, tag: null, rating: 4.7, scene: "tire", hue: 30 },
  { brand: "YOKOHAMA", name: "BluEarth ES32", size: "185/65 R15 88H", price: "$1,690", was: "$1,890", tag: "Económica", rating: 4.5, scene: "tread", hue: 18 },
];

const TABS = [
  { id: "vendidas", label: "Más vendidas" },
  { id: "ofertas", label: "Con descuento" },
  { id: "premium", label: "Premium" },
  { id: "offroad", label: "Off-road" },
];

export function FeaturedTires() {
  const [tab, setTab] = useState("vendidas");
  return (
    <section
      id="llantas"
      className="bg-[#FAFAFA] px-6 pb-24 pt-20 text-[#0F0F0F] md:px-14"
    >
      <header className="mb-8 flex flex-wrap items-end gap-6">
        <div>
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em] text-[#D19D00]">
            Vitrina Yantissimo
          </p>
          <h2
            className="m-0 mt-2.5 font-black uppercase leading-[0.95] tracking-[0.04em]"
            style={{
              fontFamily: "'Staatliches','Fjalla One',sans-serif",
              fontSize: "clamp(40px,5vw,72px)",
            }}
          >
            Llantas
            <br />
            destacadas.
          </h2>
        </div>
        <div className="ml-auto flex gap-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className="cursor-pointer rounded-full px-4.5 py-2.5 text-[13px] transition"
                style={{
                  background: active ? "#0F0F0F" : "transparent",
                  color: active ? "#FFC600" : "#525252",
                  border: active ? "1px solid #0F0F0F" : "1px solid #E5E5E5",
                  fontWeight: active ? 800 : 600,
                  padding: "10px 18px",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <Link
          href="/search"
          prefetch={false}
          className="inline-flex items-center gap-2 pb-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#0F0F0F]"
        >
          Ver catálogo completo
          <ArrowRightIcon width={14} height={14} />
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <ProductCard key={i} p={p} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ p }: { p: Product }) {
  const [h, setH] = useState(false);
  const tagBg = p.tag?.includes("Off")
    ? "#0F0F0F"
    : p.tag?.includes("Económ")
      ? "#fff"
      : "#FFC600";
  const tagFg = p.tag?.includes("Off") ? "#FFC600" : "#0F0F0F";
  return (
    <article
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="flex flex-col overflow-hidden rounded-[18px] bg-white transition-all duration-300"
      style={{
        border: `1px solid ${h ? "#FFC600" : "#ECECEC"}`,
        transform: h ? "translateY(-3px)" : "translateY(0)",
        boxShadow: h ? "0 18px 36px rgba(0,0,0,0.1)" : "0 0 0 transparent",
      }}
    >
      <div className="relative h-[200px] overflow-hidden border-b border-[#ECECEC] bg-white">
        <div
          className="absolute inset-0 transition-transform duration-500"
          style={{ transform: h ? "scale(1.05)" : "scale(1)" }}
        >
          <PhotoSlot
            src={p.src}
            alt={`${p.brand} ${p.name}`}
            hue={p.hue}
            scene={p.scene}
            dark={false}
            dense
          />
        </div>
        {p.tag && (
          <span
            className="absolute left-3.5 top-3.5 rounded-full border border-black/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ background: tagBg, color: tagFg }}
          >
            {p.tag}
          </span>
        )}
        {p.was && (
          <span className="absolute right-3.5 top-3.5 rounded-full bg-[#E53935] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white">
            OFERTA
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 px-5 pb-5 pt-5">
        <div className="flex items-center gap-2">
          <span
            className="tracking-[0.18em] text-[#0F0F0F]"
            style={{ fontFamily: "'Staatliches','Fjalla One',sans-serif", fontSize: 14 }}
          >
            {p.brand}
          </span>
          <span className="ml-auto inline-flex items-center gap-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                width={11}
                height={11}
                style={{ color: i < Math.round(p.rating) ? "#FFC600" : "#E5E5E5" }}
              />
            ))}
            <span className="ml-1 text-[11px] text-[#525252]">{p.rating}</span>
          </span>
        </div>
        <h3 className="m-0 text-[18px] font-extrabold leading-[1.2] tracking-[0.01em]">
          {p.name}
        </h3>
        <p className="m-0 -mt-0.5 mb-1.5 text-[13px] text-[#525252]">
          {p.size}
          {p.size2 ? ` · ${p.size2}` : ""}
        </p>
        <div className="flex items-center justify-between border-t border-[#ECECEC] pt-2">
          <div>
            <span
              className="tracking-[0.02em] text-[#0F0F0F]"
              style={{ fontFamily: "'Staatliches','Fjalla One',sans-serif", fontSize: 30 }}
            >
              {p.price}
            </span>
            <span className="ml-1 text-[10px] font-bold tracking-[0.16em] text-[#9EA0A3]">
              MXN
            </span>
            {p.was && (
              <span className="ml-2 text-[12px] text-[#9EA0A3] line-through">
                {p.was}
              </span>
            )}
          </div>
          <Link
            href="/search"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[12px] font-extrabold transition"
            style={{
              background: h ? "#0F0F0F" : "#FFC600",
              color: h ? "#FFC600" : "#0F0F0F",
            }}
          >
            <CartIcon width={14} height={14} /> Agregar
          </Link>
        </div>
        <div className="mt-1 flex items-center gap-2.5 text-[11px] font-semibold text-[#525252]">
          <span className="inline-flex items-center gap-1">
            <ShieldIcon className="h-3 w-3" /> Garantía
          </span>
          <span className="block h-2.5 w-px bg-[#ECECEC]" />
          <span className="inline-flex items-center gap-1">
            <WrenchIcon width={12} height={12} /> Montaje incluido
          </span>
        </div>
      </div>
    </article>
  );
}
