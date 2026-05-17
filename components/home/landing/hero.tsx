"use client";

import { useModal } from "components/hooks/use-modal";
import { WelcomeModalContent } from "components/mainslide/welcome-modal-content";
import { FullscreenModal } from "components/ui/fullscreen-modal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightIcon, BoltIcon, SearchIcon } from "./icons";
import { PhotoSlot } from "./photo-slot";

// To use a real photo, drop the file at public/images/home/hero/hero-bg.jpg
// and set HERO_BG to "/images/home/hero/hero-bg.jpg".
const HERO_BG: string | undefined = undefined;

const POPULAR_SIZES = [
  "185/65 R15",
  "195/55 R16",
  "205/55 R16",
  "225/45 R17",
  "265/70 R17",
];

const CAROUSEL_LABELS = ["Hero · taller", "Promo Michelin", "Servicios destacados"];

export function Hero() {
  const { isOpen, open, close } = useModal();
  const [modalTab, setModalTab] = useState<"measure" | "vehicle">("measure");
  const router = useRouter();

  const openWith = (tab: "measure" | "vehicle") => {
    setModalTab(tab);
    open();
  };

  const searchSize = (size: string) => {
    router.push(`/search?q=${encodeURIComponent(size)}`);
  };

  return (
    <>
      <section className="relative isolate flex w-full flex-col overflow-hidden bg-[#0A0A0A] text-white">
        <div className="absolute inset-0 opacity-40">
          <PhotoSlot
            src={HERO_BG}
            alt="Taller Yantissimo"
            scene="shop"
            hue={28}
            dense
            priority
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-[rgba(10,10,10,0.62)]" aria-hidden="true" />
        <img
          src="/llanta_icon.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 w-[560px] opacity-[0.045] invert"
        />

        <div className="relative flex items-start justify-between gap-6 px-6 pt-7 md:px-12">
          {/* <PromoChip onClick={() => openWith("measure")} /> */}
          <CarouselDots />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center gap-3 px-6 pb-6 pt-10 text-center md:px-12 md:pt-12">
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
            Yantissimo · Tu mejor opción desde 2016
          </p>
          <h1
            className="m-0 font-black uppercase leading-[0.92] tracking-[0.04em]"
            style={{
              fontFamily: "'Staatliches','Fjalla One',sans-serif",
              fontSize: "clamp(48px, 6.5vw, 96px)",
            }}
          >
            Encuentra tu llanta
            <br />
            <span className="text-[#FFC600]">en segundos.</span>
          </h1>
          <p className="m-0 mt-1 max-w-[560px] text-[17px] leading-[1.55] text-white/75">
            Cotiza y agenda en línea. Montaje + balanceo incluidos en las 7 sucursales.
          </p>

          <div className="mt-6 flex w-full justify-center">
            <SearchCapsule onClick={() => openWith("measure")} />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[10px] font-extrabold uppercase tracking-[0.22em] text-white/50">
              Medidas populares
            </span>
            {POPULAR_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => searchSize(s)}
                className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex flex-wrap items-center justify-center gap-8 border-t border-white/10 px-6 py-6 md:px-12">
          <MiniStat n="7" l="Sucursales en Colima" />
          <span className="hidden h-9 w-px bg-white/10 md:block" />
          <MiniStat n="10+" l="Años de experiencia" />
          <span className="hidden h-9 w-px bg-white/10 md:block" />
          <MiniStat n="25k+" l="Servicios al año" />
          <span className="hidden h-9 w-px bg-white/10 md:block" />
          <MiniStat n="4.5" l="★ en Google Maps" />
        </div>
      </section>

      <FullscreenModal open={isOpen} onClose={close}>
        <WelcomeModalContent initialTab={modalTab} />
      </FullscreenModal>
    </>
  );
}

function SearchCapsule({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#FFC600] px-8 py-4 text-[14px] font-extrabold uppercase tracking-[0.12em] text-[#0F0F0F] transition hover:bg-white"
    >
      <SearchIcon width={18} height={18} />
      Buscar por medida / auto
      <ArrowRightIcon
        width={16}
        height={16}
        className="transition-transform group-hover:translate-x-1"
      />
    </button>
  );
}

function PromoChip({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex max-w-[480px] flex-col gap-2">
      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-[#FFC600] px-2.5 py-1 text-[10px] font-black tracking-[0.16em] text-[#0F0F0F]">
        <BoltIcon width={12} height={12} /> PROMOCIÓN ACTIVA
      </span>
      <button
        type="button"
        onClick={onClick}
        className="flex cursor-pointer items-stretch overflow-hidden rounded-[14px] border border-[#232323] bg-[#0F0F0F] text-left text-white"
      >
        <span className="flex min-w-[80px] flex-col items-center justify-center border-r border-[#232323] bg-[#1A1508] px-4 py-3">
          <span
            className="text-[28px] leading-none tracking-[0.02em] text-[#FFC600]"
            style={{ fontFamily: "'Staatliches',sans-serif" }}
          >
            4×3
          </span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">
            Michelin
          </span>
        </span>
        <span className="flex flex-1 flex-col gap-1 px-3.5 py-3">
          <span
            className="text-[14px] leading-tight tracking-[0.04em]"
            style={{ fontFamily: "'Staatliches',sans-serif" }}
          >
            Lleva 4, paga 3 — montaje + nitrógeno incluidos
          </span>
          <span className="text-[11px] leading-[1.4] text-white/60">
            Termina 30 abr · línea Primacy 4 / Latitude
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[#FFC600] px-4 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#0F0F0F]">
          Aprovechar
          <ArrowRightIcon width={12} height={12} />
        </span>
      </button>
    </div>
  );
}

function CarouselDots() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % 3), 6000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hidden flex-col items-end gap-2 md:flex">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
        0{i + 1} / 03 ·{" "}
        <span className="text-white/40">{CAROUSEL_LABELS[i]}</span>
      </span>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setI(n)}
            aria-label={`Mostrar slide ${n + 1}`}
            className="relative h-1 w-11 overflow-hidden rounded-full"
            style={{
              background: n === i ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.2)",
            }}
          >
            {n === i && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-full bg-[#FFC600]"
                style={{ animation: "yt-progress 6s linear" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ n, l }: { n: string; l: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 border-[#FFC600] pl-3.5">
      <span
        className="text-[28px] font-black leading-none tracking-[0.02em] text-white"
        style={{ fontFamily: "'Staatliches','Fjalla One',sans-serif" }}
      >
        {n}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">
        {l}
      </span>
    </div>
  );
}
