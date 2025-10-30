"use client";

import clsx from "clsx";
import { GridTileImage } from "components/grid/tile";
import type { StaticImageData } from "next/image";
import { useEffect, useMemo, useState } from "react";

import ad1 from "../../publicads/ad-1.jpg";
import ad2 from "../../publicads/ad-2.jpg";
import ad3 from "../../publicads/ad-3.jpg";
import ad4 from "../../publicads/ad-4.jpg";

const STATIC_AD_IMAGES: StaticImageData[] = [ad1, ad2, ad3, ad4];

export default function AdCarousel() {
  const images = useMemo(
    () =>
      STATIC_AD_IMAGES.map((image, index) => ({
        src: image,
        alt: `Anuncio ${index + 1}`,
      })),
    [],
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        Sube imágenes a{" "}
        <code className="mx-1 rounded bg-neutral-100 px-1 dark:bg-neutral-800">
          public/ads
        </code>
        para mostrarlas aquí.
      </div>
    );
  }

  return (
    <div className="relative block h-full w-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700">
      {images.map((image, index) => (
        <div
          key={`ad-slide-${index}`}
          className={clsx(
            "absolute inset-0 h-full w-full transition-opacity duration-700",
            index === currentIndex ? "opacity-100" : "opacity-0",
          )}
        >
          <GridTileImage
            isInteractive={false}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 66vw, 100vw"
            priority={index === 0}
          />
        </div>
      ))}

      {images.length > 1 ? (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={`indicator-${index}`}
              type="button"
              aria-label={`Mostrar anuncio ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              className={clsx(
                "h-2 w-2 rounded-full transition",
                index === currentIndex
                  ? "bg-yellow-500"
                  : "bg-neutral-300 hover:bg-neutral-400",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
