import clsx from "clsx";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ACCENT_COLOR = "#ffd34a";

function getTagValue(tags: string[], key: string) {
  const lowerKey = `${key.toLowerCase()}:`;
  const tag = tags.find((item) => item.toLowerCase().startsWith(lowerKey));

  return tag?.split(":").slice(1).join(":").trim();
}

function getBrand(tags: string[], title: string) {
  const taggedBrand = getTagValue(tags, "brand");

  if (taggedBrand) return taggedBrand;

  const [firstWord] = title.trim().split(/\s+/);
  return firstWord || "Marca";
}

function getRating(tags: string[]) {
  const taggedRating = getTagValue(tags, "rating");
  const rating = taggedRating ? Number.parseFloat(taggedRating) : 4.5;

  if (Number.isNaN(rating)) return 4.5;

  return Math.min(5, Math.max(0, rating));
}

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

function Stars({ rating }: { rating: number }) {
  const filledStars = Math.round(rating);
  const emptyStars = Math.max(0, 5 - filledStars);

  return (
    <div
      aria-label={`Calificacion ${rating.toFixed(1)} de 5`}
      className="inline-flex items-center gap-1"
    >
      <span className="text-[11px] tracking-[0.1em] text-[#ffd34a]">
        {"★".repeat(filledStars)}
        <span className="text-[#3f3f3f]">{"★".repeat(emptyStars)}</span>
      </span>
    </div>
  );
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const image = product.featuredImage;
  const tags = product.tags ?? [];
  const brand = getBrand(tags, product.title);
  const displayTag = getTagValue(tags, "tag") ?? tags[0];
  const size = getTagValue(tags, "size");
  const rating = getRating(tags);
  const minAmount = Number.parseFloat(
    product.priceRange.minVariantPrice.amount,
  );
  const maxAmount = Number.parseFloat(
    product.priceRange.maxVariantPrice.amount,
  );
  const hasDiscount = Number.isFinite(maxAmount) && maxAmount > minAmount;
  const discount = hasDiscount
    ? Math.round((1 - minAmount / maxAmount) * 100)
    : 0;
  const currencyCode = product.priceRange.minVariantPrice.currencyCode;

  return (
    <Link
      className={clsx(
        "group relative block h-full w-full transition-transform duration-200 ease-out hover:-translate-y-[3px]",
        className,
      )}
      href={`/product/${product.handle}`}
      prefetch
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#222] bg-[#171717] transition-[border-color,box-shadow] duration-200 group-hover:border-[#ffd34a] group-hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="relative flex min-h-[200px] w-full items-center justify-center overflow-hidden bg-white p-6">
          {displayTag ? (
            <span className="absolute left-3 top-3 rounded-full border border-[#3a3a3a] bg-[#1d1d1d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#e5e5e5]">
              {displayTag}
            </span>
          ) : null}
          {discount > 0 ? (
            <span className="absolute right-3 top-3 rounded bg-[#e53935] px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          ) : null}
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 45vw, 100vw"
              className="object-contain p-2 transition-transform duration-200 ease-out group-hover:scale-105"
            />
          ) : (
            <span className="text-sm font-semibold uppercase tracking-[0.08em] text-[#707070]">
              Sin imagen
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-[18px] pb-[18px] pt-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span
              className="text-[11px] font-bold tracking-[0.08em] uppercase"
              style={{ color: ACCENT_COLOR }}
            >
              {brand.toUpperCase()}
            </span>
            <Stars rating={rating} />
          </div>

          <p className="line-clamp-2 text-[16px] leading-[1.45] font-semibold text-white">
            {size ? `${size} ` : ""}
            {product.title}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3">
            <div>
              {hasDiscount ? (
                <span className="block text-xs text-[#5a5a5a] line-through">
                  {formatCurrency(maxAmount, currencyCode)}
                </span>
              ) : null}
              <div className="flex items-end gap-1.5">
                <span className="text-[22px] font-extrabold text-[#ffd34a]">
                  {formatCurrency(minAmount, currencyCode)}
                </span>
                <span className="pb-1 text-xs text-[#666] uppercase">
                  {currencyCode}
                </span>
              </div>
            </div>

            <span
              aria-hidden
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffd34a] text-xl font-black text-[#0f0f0f] transition-transform duration-200 group-hover:scale-105"
            >
              +
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
