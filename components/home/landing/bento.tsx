"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "./icons";
import { PhotoSlot } from "./photo-slot";

type Span = "1x1" | "2x1" | "2x2";
type Scene = "tire" | "storefront" | "tread" | "tech" | "shop" | "engine";

type Tile = {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  hue: number;
  scene: Scene;
  href: string;
  span: Span;
  feature?: boolean;
  // To use a real photo, drop the file at the slot shown above each entry
  // and set src to e.g. "/images/home/bento/atencion.jpg".
  src?: string;
};

const TILES: Tile[] = [
  // slot: /images/home/bento/compra.jpg
  { eyebrow: "COMPRA", title: "Compra en línea", sub: "Y reserva tu cita en cuestión de segundos", cta: "Cotizar ahora", hue: 30, scene: "tire", href: "/search", span: "1x1" },
  // slot: /images/home/bento/sucursales.jpg
  { eyebrow: "SUCURSALES", title: "Cerca de ti", sub: "6 talleres en Colima, Villa de Álvarez y Manzanillo", cta: "Ver ubicaciones", hue: 20, scene: "storefront", href: "/ubicaciones", span: "1x1" },
  // slot: /images/home/bento/catalogo.jpg
  { eyebrow: "CATÁLOGO", title: "Amplia gama de llantas", sub: "Modelos para sedán, SUV, camión y off-road.", cta: "Explorar catálogo", hue: 14, scene: "tread", href: "/search", span: "2x1" },
  // slot: /images/home/bento/atencion.jpg
  { eyebrow: "ATENCIÓN", title: "Atención profesional", sub: "Contacta a uno de nuestros expertos en llantas.", cta: "Hablar con un experto", hue: 36, scene: "tech", href: "/contacto", span: "2x2", feature: true },
  // slot: /images/home/bento/tecnologia.jpg
  { eyebrow: "TECNOLOGÍA", title: "Tecnología de primera", sub: "Equipo de alineación 3D y balanceo de última generación.", cta: "Conocer equipo", hue: 24, scene: "shop", href: "/servicios", span: "1x1" },
  // slot: /images/home/bento/productos.jpg
  { eyebrow: "PRODUCTOS", title: "Productos y servicios", sub: "Aceite, frenos, afinación — todo el mantenimiento.", cta: "Ver servicios", hue: 18, scene: "engine", href: "/servicios", span: "1x1" },
  // slot: /images/home/bento/nosotros.jpg
  { eyebrow: "NOSOTROS", title: "Sobre Yantissimo", sub: "Familia colimense desde octubre de 2016.", cta: "Conocer la marca", hue: 26, scene: "shop", href: "/nosotros", span: "1x1" },
  // slot: /images/home/bento/guia.jpg
  { eyebrow: "AYUDA", title: "Guía de llantas", sub: "Aprende a escoger las llantas indicadas para ti.", cta: "Leer guía", hue: 34, scene: "tire", href: "/contacto", span: "1x1" },
];

export function Bento() {
  return (
    <section className="bg-[#0F0F0F] px-6 pb-24 pt-20 md:px-14">
      <header className="mb-9 grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
            YANTISSIMO
          </p>
          <h2
            className="m-0 mt-3 font-black uppercase leading-[0.95] tracking-[0.04em] text-white"
            style={{
              fontFamily: "'Staatliches','Fjalla One',sans-serif",
              fontSize: "clamp(48px,5.4vw,82px)",
            }}
          >
            Tu mejor
            <br />
            <span className="text-[#FFC600]">opción</span> en llantas.
          </h2>
        </div>
        <p className="m-0 max-w-[440px] text-[16px] leading-[1.6] text-white/70">
          Compramos solo a fábrica oficial, instalamos en sitio y respondemos
          por cada llanta. Esto es Yantissimo en 8 motivos.
        </p>
      </header>
      <div
        className="grid auto-rows-[260px] grid-cols-2 gap-3.5 md:auto-rows-[310px] md:grid-cols-4"
      >
        {TILES.map((t, i) => (
          <BentoTile key={i} tile={t} idx={i + 1} />
        ))}
      </div>
    </section>
  );
}

function BentoTile({ tile, idx }: { tile: Tile; idx: number }) {
  const [h, setH] = useState(false);
  const colSpan = tile.span === "2x1" || tile.span === "2x2" ? "md:col-span-2" : "";
  const rowSpan = tile.span === "2x2" ? "md:row-span-2" : "";
  const bigType = tile.span === "2x2";
  return (
    <Link
      href={tile.href}
      prefetch={false}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className={`group relative cursor-pointer overflow-hidden rounded-[18px] text-white no-underline ${colSpan} ${rowSpan}`}
      style={{
        border: tile.feature ? "1px solid #FFC600" : "1px solid #1F1F1F",
        background: "#141414",
      }}
    >
      <div
        className="absolute inset-0 transition-transform duration-700"
        style={{ transform: h ? "scale(1.06)" : "scale(1)" }}
      >
        <PhotoSlot
          src={tile.src}
          alt={tile.title}
          hue={tile.hue}
          scene={tile.scene}
          dense
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: tile.feature ? "rgba(10,10,10,0.35)" : "rgba(10,10,10,0.45)",
        }}
      />
      <span
        className="absolute right-5 top-4.5 tracking-[0.16em] text-white/55"
        style={{
          fontFamily: "'Staatliches','Fjalla One',sans-serif",
          fontSize: 14,
          top: 18,
        }}
      >
        {String(idx).padStart(2, "0")}
      </span>
      {tile.feature && (
        <span className="absolute left-5 top-[18px] rounded-full bg-[#FFC600] px-2.5 py-1 text-[10px] font-black tracking-[0.18em] text-[#0F0F0F]">
          ★ DESTACADO
        </span>
      )}
      <div className="absolute bottom-5 left-6 right-6 flex flex-col gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#FFD34A]">
          {tile.eyebrow}
        </span>
        <h3
          className="m-0 italic font-black leading-[1.02] text-white"
          style={{
            fontSize: bigType ? "clamp(40px, 4vw, 56px)" : "clamp(22px, 2vw, 32px)",
            letterSpacing: "-0.005em",
          }}
        >
          {tile.title}
        </h3>
        <p
          className="m-0 leading-[1.45] text-white/80"
          style={{
            fontSize: bigType ? 16 : 13,
            maxWidth: bigType ? 480 : 340,
          }}
        >
          {tile.sub}
        </p>
        <div className="mt-2 inline-flex items-center gap-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
            {tile.cta}
          </span>
          <span
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-[#0F0F0F] transition-transform duration-300"
            style={{ transform: h ? "translateX(8px)" : "translateX(0)" }}
          >
            <ArrowRightIcon width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
