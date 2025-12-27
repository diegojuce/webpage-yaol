import clsx from "clsx";
import Price from "components/price";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const image = product.featuredImage;

  return (
    <Link
      className={clsx(
        "group relative block h-full w-full transition-transform duration-150 ease-out hover:-translate-y-1",
        className
      )}
      href={`/product/${product.handle}`}
      prefetch
    >
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950/90 p-5 shadow-[0_25px_80px_rgba(10,10,15,0.45)] transition-colors duration-150 group-hover:border-yellow-500/60 group-hover:bg-neutral-950">
        <div className="relative aspect-[4/3] bg-white w-full overflow-hidden rounded-2xl">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 45vw, 100vw"
              className="object-contain transition-transform duration-200 ease-out group-hover:scale-105"
            />
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="max-w-[65%] flex-1 truncate rounded-full bg-neutral-800/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-200">
            {product.title}
          </span>
          <Price
            amount={product.priceRange.minVariantPrice.amount}
            currencyCode={product.priceRange.minVariantPrice.currencyCode}
            className="flex-none rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black"
            currencyCodeClassName="text-[10px] font-semibold uppercase text-black/70"
          />
        </div>
      </article>
    </Link>
  );
}
