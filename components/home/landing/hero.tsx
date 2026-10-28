"use client";

import { useModal } from "components/hooks/use-modal";
import { MobileSearchSheet } from "components/mainslide/mobile-search-sheet";
import { WelcomeModalContent } from "components/mainslide/welcome-modal-content";
import { FullscreenModal } from "components/ui/fullscreen-modal";
import { isMobileViewport } from "lib/search-urls";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HERO_SLIDE_SECONDS, HERO_SLIDES, type HeroSlide } from "./hero-slides";
import { ArrowRightIcon, BoltIcon, SearchIcon } from "./icons";
import { PaymentMethods } from "./payment-methods";
import { PhotoSlot } from "./photo-slot";

const HERO_BG: string | undefined = "/images/home/hero/hero-bg.jpg";

const POPULAR_SIZES = [
  "185/65 R15",
  "195/55 R16",
  "205/55 R16",
  "225/45 R17",
  "265/70 R17",
];

export function Hero() {
  const { isOpen, open, close } = useModal();
  const [modalTab, setModalTab] = useState<"measure" | "vehicle">("measure");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();
  // `prev` es la slide que va saliendo hacia la izquierda.
  const [{ slide, prev }, setSlides] = useState({ slide: 0, prev: -1 });
  const goTo = (n: number) =>
    setSlides((s) => (n === s.slide ? s : { slide: n, prev: s.slide }));

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;
    const t = setInterval(
      () =>
        setSlides((s) => ({
          slide: (s.slide + 1) % HERO_SLIDES.length,
          prev: s.slide,
        })),
      HERO_SLIDE_SECONDS * 1000,
    );
    return () => clearInterval(t);
  }, [slide]);

  const openWith = (tab: "measure" | "vehicle") => {
    setModalTab(tab);
    open();
  };

  // En celular abre el buscador en panel inferior; en computadora el completo.
  const handleSearchClick = () => {
    if (isMobileViewport()) setIsSheetOpen(true);
    else openWith("measure");
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
          <CarouselDots active={slide} onSelect={goTo} />
        </div>

        <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center gap-3 px-6 pb-6 pt-10 text-center md:px-12 md:pt-12">
          {/* Las slides se apilan en la misma celda para que la altura no brinque al rotar. */}
          <div className="grid w-full justify-items-center">
            {HERO_SLIDES.map((sl, n) => (
              <SlideContent
                key={n}
                slide={sl}
                first={n === 0}
                position={n === slide ? "active" : n === prev ? "leaving" : "waiting"}
              />
            ))}
          </div>

          <div className="mt-6 flex w-full justify-center">
            <SearchCapsule onClick={handleSearchClick} />
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

        <div className="relative grid grid-cols-4 gap-2 border-t border-white/10 px-4 py-4 md:flex md:flex-wrap md:items-center md:justify-center md:gap-8 md:px-12 md:py-6">
          <MiniStat n="7" l="Sucursales en Colima" />
          <span className="hidden h-9 w-px bg-white/10 md:block" />
          <MiniStat n="10+" l="Años de experiencia" />
          <span className="hidden h-9 w-px bg-white/10 md:block" />
          <MiniStat n="25k+" l="Servicios al año" />
          <span className="hidden h-9 w-px bg-white/10 md:block" />
          <MiniStat n="4.5" l="★ en Google Maps" />
        </div>

        <PaymentMethods className="relative px-4 pb-5 pt-4 md:px-12 md:pb-6 md:pt-6" />
      </section>

      <FullscreenModal open={isOpen} onClose={close}>
        <WelcomeModalContent initialTab={modalTab} />
      </FullscreenModal>
      <MobileSearchSheet
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
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

// Swipe a la izquierda: la slide activa entra desde la derecha y la anterior
// sale por la izquierda. Las que esperan se quedan a la derecha sin animar.
const SLIDE_POSITION = {
  active: { transform: "translateX(0)", opacity: 1, animate: true },
  leaving: { transform: "translateX(-100%)", opacity: 0, animate: true },
  waiting: { transform: "translateX(100%)", opacity: 0, animate: false },
} as const;

function SlideContent({
  slide,
  first,
  position,
}: {
  slide: HeroSlide;
  first: boolean;
  position: keyof typeof SLIDE_POSITION;
}) {
  const active = position === "active";
  const pos = SLIDE_POSITION[position];
  // Solo la primera slide es el <h1> de la página (SEO); las demás son <p>.
  const Title = first ? "h1" : "p";
  return (
    <div
      aria-hidden={!active}
      className="col-start-1 row-start-1 flex w-full flex-col items-center gap-3 motion-reduce:!transition-none"
      style={{
        transform: pos.transform,
        opacity: pos.opacity,
        transition: pos.animate
          ? "transform 700ms cubic-bezier(.22,.8,.24,1), opacity 700ms ease"
          : "none",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <p
        className="m-0 text-[12px] font-bold uppercase tracking-[0.22em]"
        style={{ color: slide.eyebrowColor ?? "#FFD34A" }}
      >
        {slide.eyebrow}
      </p>
      <Title
        className="m-0 font-black uppercase leading-[0.92] tracking-[0.04em]"
        style={{
          fontFamily: "'Staatliches','Fjalla One',sans-serif",
          fontSize: "clamp(48px, 6.5vw, 96px)",
        }}
      >
        {slide.title.map((line, i) => (
          <span key={i} className="block" style={{ color: line.color ?? "#FFFFFF" }}>
            {line.text}
          </span>
        ))}
      </Title>
      <p
        className="m-0 mt-1 max-w-[560px] text-[17px] leading-[1.55]"
        style={{ color: slide.descriptionColor ?? "rgba(255,255,255,0.75)" }}
      >
        {slide.description}
      </p>
    </div>
  );
}

function CarouselDots({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (n: number) => void;
}) {
  const total = HERO_SLIDES.length;
  if (total <= 1) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="hidden flex-col items-end gap-2 md:flex">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
        {pad(active + 1)} / {pad(total)} ·{" "}
        <span className="text-white/40">{HERO_SLIDES[active]?.label}</span>
      </span>
      <div className="flex gap-1.5">
        {HERO_SLIDES.map((_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            aria-label={`Mostrar slide ${n + 1}`}
            className="relative h-1 w-11 overflow-hidden rounded-full"
            style={{
              background: n === active ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.2)",
            }}
          >
            {n === active && (
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-full bg-[#FFC600]"
                style={{ animation: `yt-progress ${HERO_SLIDE_SECONDS}s linear` }}
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
    <div className="flex min-w-0 flex-col gap-0.5 border-l-2 border-[#FFC600] pl-2 md:pl-3.5">
      <span
        className="text-[20px] font-black leading-none tracking-[0.02em] text-white md:text-[28px]"
        style={{ fontFamily: "'Staatliches','Fjalla One',sans-serif" }}
      >
        {n}
      </span>
      <span className="text-[8.5px] font-semibold uppercase leading-tight tracking-[0.06em] text-white/55 md:text-[11px] md:tracking-[0.12em]">
        {l}
      </span>
    </div>
  );
}
