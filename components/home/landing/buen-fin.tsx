import ProductCard from "components/product/product-card";
import { getDiscountPercent } from "components/product/discount-badge";
import { getCategoryProducts } from "lib/commerce";
import { hasRealImage } from "lib/commerce/placeholder-image";
import { Suspense } from "react";
import { BuenFinTabs } from "./buen-fin-tabs";

const PER_CATEGORY = 10;

const CATEGORIES = [
  { value: "suv", label: "SUV", seeMore: "Ver todas las SUV" },
  { value: "sedan", label: "Sedán", seeMore: "Ver todas las de sedán" },
  { value: "jeep", label: "Jeep", seeMore: "Ver todas las de Jeep" },
  { value: "pickup", label: "Pick-up", seeMore: "Ver todas las de pick-up" },
];

// Portada: "Aprovecha los mejores descuentos del Buen Fin". Una pestaña por
// tipo de vehículo, cada una con un carrusel de sus 10 mayores descuentos.
export function BuenFin() {
  return (
    <section
      id="buen-fin"
      className="border-y border-[#222] bg-[#0F0F0F] px-4 pb-20 pt-20 text-white md:px-14"
    >
      <header className="mx-auto mb-10 max-w-[1080px] text-center">
        <p className="m-0 mb-4 text-[13px] font-bold uppercase tracking-[0.22em] text-[#ffd34a]">
          Buen Fin · Ofertas por tipo de vehículo
        </p>
        <h2
          className="m-0 font-black uppercase leading-[0.92] tracking-[0.02em]"
          style={{
            fontFamily: "'Staatliches','Fjalla One',sans-serif",
            fontSize: "clamp(44px, 6vw, 92px)",
          }}
        >
          Aprovecha los{" "}
          <span
            className="inline-block bg-[#FFC600] px-[0.14em] pb-[0.02em] leading-[0.92] text-[#0F0F0F]"
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            mejores descuentos
          </span>
          <br />
          del Buen Fin.
        </h2>
      </header>

      <div className="mx-auto max-w-[1400px]">
        <Suspense fallback={<DealsSkeleton />}>
          <BuenFinDeals />
        </Suspense>
      </div>
    </section>
  );
}

async function BuenFinDeals() {
  const groups = await Promise.all(
    CATEGORIES.map(async (category) => {
      const products = await getCategoryProducts({
        kind: "vehiculo",
        value: category.value,
      });
      const best = products
        // Solo con foto propia: el placeholder se ve mal en portada.
        .filter((p) => p.availableForSale && hasRealImage(p))
        .map((p) => ({ p, discount: getDiscountPercent(p) }))
        .sort((a, b) => b.discount - a.discount)
        .slice(0, PER_CATEGORY)
        .map(({ p }) => p);
      return { ...category, products: best };
    }),
  );

  // Una categoría sin productos no se muestra como pestaña.
  const withProducts = groups.filter((g) => g.products.length > 0);
  if (!withProducts.length) return null;

  return (
    <BuenFinTabs
      tabs={withProducts.map(({ value, label, seeMore }) => ({
        value,
        label,
        seeMore,
        href: `/search?kind=vehiculo&value=${value}`,
      }))}
      panels={withProducts.map((g) => (
        <ul
          key={g.value}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 pt-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {g.products.map((product) => (
            <li
              key={product.handle}
              className="w-[78%] max-w-[300px] flex-none snap-start min-[475px]:w-[46%] sm:w-[260px] md:w-[280px]"
            >
              <ProductCard product={product} className="h-full" />
            </li>
          ))}
        </ul>
      ))}
    />
  );
}

function DealsSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 flex gap-2">
        {CATEGORIES.map((c) => (
          <span
            key={c.value}
            className="h-10 w-20 animate-pulse rounded-full bg-[#1d1d1d]"
          />
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[360px] w-[78%] max-w-[300px] flex-none animate-pulse rounded-2xl bg-[#171717] min-[475px]:w-[46%] sm:w-[260px] md:w-[280px]"
          />
        ))}
      </div>
    </div>
  );
}
