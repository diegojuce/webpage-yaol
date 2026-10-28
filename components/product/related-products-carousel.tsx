import clsx from "clsx";
import { GridTileImage } from "components/grid/tile";
import type { Product } from "lib/commerce/types";
import Link from "next/link";

// Carrusel horizontal de "Productos relacionados" (página de producto y
// resultados de búsqueda).
export function RelatedProductsCarousel({
  products,
  title = "Productos relacionados",
  titleClassName,
}: {
  products: Product[];
  title?: string;
  titleClassName?: string;
}) {
  if (!products.length) return null;

  return (
    <div className="py-8">
      <h2 className={clsx("mb-4 px-4 text-2xl font-bold md:px-0", titleClassName)}>
        {title}
      </h2>
      {/* En celular la tarjeta no ocupa todo el ancho: se asoma la siguiente
          para que se lea como carrusel. */}
      <ul className="flex w-full snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 pt-1 md:snap-none md:px-0">
        {products.map((product) => (
          <li
            key={product.handle}
            className="aspect-square w-[72%] flex-none snap-start min-[475px]:w-[45%] sm:w-1/3 md:w-1/4 lg:w-1/5"
          >
            <Link
              className="relative h-full w-full"
              href={`/product/${product.handle}`}
              prefetch={true}
            >
              <GridTileImage
                alt={product.title}
                label={{
                  title: product.title,
                  amount: product.priceRange.maxVariantPrice.amount,
                  currencyCode: product.priceRange.maxVariantPrice.currencyCode,
                }}
                src={product.featuredImage?.url}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 45vw, 72vw"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
