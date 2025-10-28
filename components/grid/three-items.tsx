import AdCarousel from "components/home/ad-carousel";
import Search, { SearchSkeleton } from "components/layout/navbar/search";
import Price from "components/price";
import { getCollectionProducts } from "lib/shopify";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const HERO_CTA_CLASSES =
  "relative flex-1 rounded-full bg-yellow-500 px-6 py-3 text-center text-base font-semibold uppercase tracking-[0.25em] text-black transition-transform duration-150 ease-out shadow-[0_0_25px_rgba(250,204,21,0.45)] hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black dark:focus-visible:ring-yellow-400";

export async function ThreeItemGrid() {
  // Collections that start with `hidden-*` are hidden from the search page.
  const homepageItems = await getCollectionProducts({
    collection: "michelin",
  });

  const productTiles = homepageItems.filter(Boolean).slice(0, 2) as Product[];

  return (
    <section className="mx-auto max-w-(--breakpoint-2xl) px-4 pb-10 pt-4">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/90 px-6 py-10 shadow-[0_35px_120px_rgba(15,15,15,0.55)] sm:px-10 md:px-14 md:py-16">
        <div
          className="absolute -top-40 left-1/3 h-72 w-72 rounded-full bg-yellow-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-48 -left-32 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-10 md:grid-cols-12 md:items-center">
          <div className="flex flex-col gap-6 md:col-span-7">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-[0.35em] text-white sm:text-5xl lg:text-6xl">
                LA MEJOR
              </h1>
              <h2 className="mt-2 text-4xl font-black uppercase tracking-[0.35em] text-yellow-400 sm:text-5xl lg:text-6xl">
                EXPERIENCIA
              </h2>
              <p className="mt-4 text-lg italic text-neutral-300 sm:text-xl">
                EN LLANTAS Y SERVICIO AUTOMOTRÍZ
              </p>
            </div>

            <div className="max-w-xl">
              <Suspense fallback={<SearchSkeleton />}>
                <Search />
              </Suspense>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/search" prefetch={true} className={HERO_CTA_CLASSES}>
                BUSCAR LLANTAS
              </Link>
              <Link
                href="/citas"
                prefetch={true}
                className="relative flex-1 rounded-full border border-yellow-400/70 px-6 py-3 text-center text-base font-semibold uppercase tracking-[0.25em] text-yellow-400 transition duration-150 hover:-translate-y-0.5 hover:border-yellow-300 hover:text-yellow-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black dark:focus-visible:ring-yellow-400"
              >
                AGENDAR CITA
              </Link>
            </div>

            {productTiles.length ? (
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                {productTiles.map((product, index) => (
                  <Link
                    key={product.handle}
                    href={`/product/${product.handle}`}
                    prefetch={true}
                    className="mt-2 group inline-flex min-w-[240px] items-center gap-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/70 px-4 py-3 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-yellow-500/60 hover:bg-neutral-900/90"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-neutral-950">
                      {product.featuredImage?.url ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.title}
                          fill
                          sizes="64px"
                          className="object-contain transition-transform duration-200 group-hover:scale-105"
                          priority={index === 0}
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col ">
                      <span className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Destacado
                      </span>
                      <span className="line-clamp-1 text-sm font-semibold text-white">
                        {product.title}
                      </span>
                      <Price
                        className="text-sm font-semibold text-yellow-400"
                        amount={product.priceRange.maxVariantPrice.amount}
                        currencyCode={
                          product.priceRange.maxVariantPrice.currencyCode
                        }
                        currencyCodeClassName="text-xs text-yellow-500"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative md:col-span-5">
            <div
              className="pointer-events-none absolute -inset-8 rounded-full bg-yellow-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-[0_20px_65px_rgba(10,10,10,0.55)]">
              <AdCarousel />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-[0_25px_80px_rgba(10,10,10,0.45)]">
        <div className="flex min-w-full gap-6 px-6 py-4 md:px-10">
          {[0, 1, 2].map((item) => (
            <div
              key={`promo-banner-${item}`}
              className="flex w-full flex-col items-center justify-center gap-2 text-center uppercase tracking-[0.35em] text-neutral-100 md:flex-row md:text-left md:tracking-[0.45em]"
            >
              <span className="rounded-full bg-yellow-500 px-4 py-1 text-sm font-extrabold text-black">
                20% DE DESCUENTO
              </span>
              <span className="text-sm font-semibold text-neutral-200">
                EN MANO DE OBRA
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
