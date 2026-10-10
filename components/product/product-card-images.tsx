"use client";

import Image from "components/safe-image";
import { useState, type MouseEvent } from "react";
import type { Image as ProductImage } from "lib/shopify/types";

interface ProductCardImagesProps {
  images: ProductImage[];
  alt: string;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

export default function ProductCardImages({ images, alt }: ProductCardImagesProps) {
  const [index, setIndex] = useState(0);
  const total = images.length;
  const hasMultiple = total > 1;
  const current = images[Math.min(index, Math.max(total - 1, 0))];

  const step = (delta: number) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((prev) => (prev + delta + total) % total);
  };

  const jumpTo = (target: number) => (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex(target);
  };

  if (!current?.url) {
    return (
      <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[#707070]">
        Sin imagen
      </span>
    );
  }

  return (
    <>
      <Image
        key={current.url}
        src={current.url}
        alt={current.altText ?? alt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 45vw, 100vw"
        className="object-contain p-2 transition-transform duration-200 ease-out group-hover:scale-105"
      />

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={step(-1)}
            aria-label="Imagen anterior"
            className="pointer-events-auto absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-150 ease-out hover:bg-black/75 focus:opacity-100 focus:outline-none group-hover:opacity-100"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={step(1)}
            aria-label="Imagen siguiente"
            className="pointer-events-auto absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-150 ease-out hover:bg-black/75 focus:opacity-100 focus:outline-none group-hover:opacity-100"
          >
            <ChevronIcon direction="right" />
          </button>

          <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            {images.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={jumpTo(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-[#0f0f0f]" : "bg-[#0f0f0f]/30 hover:bg-[#0f0f0f]/60"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
