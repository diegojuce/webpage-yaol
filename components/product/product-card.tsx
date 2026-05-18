import clsx from "clsx";
import type { Image as ProductImage, Product } from "lib/shopify/types";
import Link from "next/link";
import ProductCardImages from "./product-card-images";

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

function buildImageList(product: Product): ProductImage[] {
  const seen = new Set<string>();
  const out: ProductImage[] = [];
  const candidates: ProductImage[] = [];
  if (product.featuredImage?.url) candidates.push(product.featuredImage);
  for (const img of product.images ?? []) {
    if (img?.url) candidates.push(img);
  }
  for (const img of candidates) {
    if (seen.has(img.url)) continue;
    seen.add(img.url);
    out.push(img);
  }
  return out;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const images = buildImageList(product);
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
    <article
      className={clsx(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#222] bg-[#171717] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:border-[#ffd34a] hover:shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <Link
        href={`/product/${product.handle}`}
        prefetch
        aria-label={product.title}
        className="absolute inset-0 z-10"
      />
      <div className="relative flex min-h-[200px] w-full items-center justify-center overflow-hidden bg-white p-6">
        {displayTag ? (
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-[#3a3a3a] bg-[#1d1d1d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#e5e5e5]">
            {displayTag}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="pointer-events-none absolute right-3 top-3 z-20 rounded bg-[#e53935] px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        ) : null}
        <ProductCardImages images={images} alt={product.title} />
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
  );
}
