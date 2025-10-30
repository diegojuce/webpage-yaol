"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useState } from "react";

export type PromoBanner = {
  highlight: string;
  message: string;
};

type PromoBannerCarouselProps = {
  banners: readonly PromoBanner[];
};

export default function PromoBannerCarousel({
  banners,
}: PromoBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!banners?.length) {
    return null;
  }

  const total = banners.length;
  const currentBanner = banners[currentIndex] ?? banners[0];
  if (!currentBanner) {
    return null;
  }

  const showPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  return (
    <div className="relative flex w-full items-center justify-center px-6 py-3 md:px-10">
      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Ver anuncio anterior"
            onClick={showPrevious}
            className="group absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-yellow-500/40 bg-neutral-900/80 text-yellow-400 transition hover:border-yellow-400 hover:text-yellow-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          >
            <ChevronLeftIcon className="h-5 w-5 transition group-hover:-translate-x-0.5" />
          </button>

          <button
            type="button"
            aria-label="Ver siguiente anuncio"
            onClick={showNext}
            className="group absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-yellow-500/40 bg-neutral-900/80 text-yellow-400 transition hover:border-yellow-400 hover:text-yellow-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          >
            <ChevronRightIcon className="h-5 w-5 transition group-hover:translate-x-0.5" />
          </button>
        </>
      ) : null}

      <div className="flex min-h-[88px] w-full flex-row items-center justify-center gap-10 text-center uppercase tracking-[0.35em] text-neutral-100 md:min-h-[96px] md:text-left md:tracking-[0.45em]">
        <span className="rounded-full bg-yellow-500 px-4 py-1 text-sm font-extrabold text-black">
          {currentBanner.highlight}
        </span>

        <span className="text-sm font-semibold text-neutral-200">
          {currentBanner.message}
        </span>
      </div>

      {total > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <span
              key={`promo-indicator-${index}`}
              className={clsx(
                "h-2 w-2 rounded-full transition",
                index === currentIndex ? "bg-yellow-500" : "bg-neutral-700",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
