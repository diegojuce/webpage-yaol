"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

// Opcional: adapta los types a tu modelo
type Product = {
  handle: string;
  title: string;
  vendor?: string;
  featuredImage?: { url: string };
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  // Si tienes compareAt a nivel producto o variante:
  compareAtPrice?: { amount: string };
};

export default function FeaturedProducts({ productTiles }: { productTiles: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.9, 900);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!productTiles?.length) return null;

  return (
    <section className="relative py-10 bg-neutral-900/90">
      {/* Encabezado estilo mock */}

      {/* <header className="servicios__head">
        <p>Conoce los</p>
        <h2 id="services-heading">MÁS VENDIDOS</h2>
      </header> */}

      {/* Flecha IZQ (slot para SVG) */}
      <button
        aria-label="Anterior"
        onClick={() => scrollBy("left")}
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-neutral-800/70 hover:bg-neutral-700/90 border border-neutral-700"
      >
        <span className="svg-slot h-5 w-5 block" />
      </button>

      {/* Flecha DER (slot para SVG) */}
      <button
        aria-label="Siguiente"
        onClick={() => scrollBy("right")}
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-neutral-800/70 hover:bg-neutral-700/90 border border-neutral-700"
      >
        <span className="svg-slot h-5 w-5 block" />
      </button>

      {/* Rail */}
      <div className="mt-2 px-2 sm:px-4 md:px-8">
        <div
          ref={scrollerRef}
          className="flex gap-4 md:justify-center overflow-x-auto py-4  snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]"
        >
          {productTiles.map((product, index) => {
            const amount = product.priceRange?.minVariantPrice?.amount;
            const currency = product.priceRange?.minVariantPrice?.currencyCode;
            const compareAt =
              product.compareAtPrice?.amount ?? null;

            return (
              <Link key={product.handle} href={`/product/${product.handle}`} prefetch className="snap-start">
                <article className="relative flex w-[280px] flex-none sm:w-[320px] md:w-[260px] flex-col rounded-2xl border border-yellow-500/30 bg-neutral-900/70 px-5 py-4 transition-all duration-200 hover:-translate-y-1 hover:border-yellow-400/60 hover:bg-neutral-900/90">
                  
                  {/* Badge de oferta */}
                  <div className="absolute left-4 top-4 rounded-md border border-yellow-400/40 bg-yellow-500/10 px-2 py-1">
                    <div className="text-xs font-extrabold text-yellow-300 leading-none">20% DESCUENTO</div>
                    <div className="text-[10px] font-semibold text-yellow-300/90 leading-tight"></div>
                  </div>

                  {/* Íconos flotantes (slots para tus SVGs) */}
                  <div className="absolute right-4 top-4 flex flex-col gap-2">
                    <button
                      aria-label="Agregar al carrito"
                      className="icon-slot-cart rounded-lg border border-yellow-500/40 bg-neutral-900/60 p-2 hover:bg-neutral-800/80"
                    >
                      <span className="svg-slot h-4 w-4 block" />
                    </button>
                    <button
                      aria-label="Favorito"
                      className="icon-slot-heart rounded-lg border border-yellow-500/40 bg-neutral-900/60 p-2 hover:bg-neutral-800/80"
                    >
                      <span className="svg-slot h-4 w-4 block" />
                    </button>
                  </div>

                  {/* Imagen */}
                  <div className="mx-auto mt-6 h-50 w-full overflow-hidden rounded-xl bg-white">
                    {product.featuredImage?.url && (
                      <Image
                        src={product.featuredImage.url}
                        alt={product.title}
                        width={400}
                        height={400}
                        className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        priority={index === 0}
                      />
                    )}
                  </div>

                  {/* Marca */}
                  {product.vendor && (
                    <div className="mt-4 w-fit rounded-sm bg-red-700/90 px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
                      {product.vendor}
                    </div>
                  )}

                  {/* Título */}
                  <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                    {product.title}
                  </h4>

                  {/* Precios */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-yellow-400">
                      {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount))}
                    </span>
                    {compareAt ? (
                      <span className="text-lg font-semibold text-neutral-500 line-through">
                        {new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(compareAt))}
                      </span>
                    ) : null}
                  </div>

                  {/* Nota inferior */}
                  <p className="mt-2 text-[11px] leading-4 text-neutral-300">
                    INCLUYE: Montaje, válvulas, nitrógeno y balanceo
                  </p>
                  
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
