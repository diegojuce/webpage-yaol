import clsx from "clsx";
import type { Product } from "lib/commerce/types";

// La fórmula de precios ya da 20% sobre el precio de lista a todas las
// llantas; solo se anuncia el descuento cuando es mayor a eso.
const MIN_REAL_DISCOUNT = 20;

const STARBURST =
  "polygon(50% 0%,61% 12%,75% 6%,79% 21%,94% 25%,88% 39%,100% 50%,88% 61%,94% 75%,79% 79%,75% 94%,61% 88%,50% 100%,39% 88%,25% 94%,21% 79%,6% 75%,12% 61%,0% 50%,12% 39%,6% 25%,21% 21%,25% 6%,39% 12%)";

// % de descuento redondeado (precio de lista vs. precio de venta); 0 si no hay.
export function getDiscountPercent(product: Product): number {
  const min = Number.parseFloat(product.priceRange.minVariantPrice.amount);
  const max = Number.parseFloat(product.priceRange.maxVariantPrice.amount);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0;
  return Math.round((1 - min / max) * 100);
}

// Sello de estrella "-25% OFERTA". No pinta nada si el descuento no es real.
export function DiscountBadge({
  discount,
  className,
}: {
  discount: number;
  className?: string;
}) {
  if (discount <= MIN_REAL_DISCOUNT) return null;

  return (
    <span
      className={clsx(
        "pointer-events-none absolute right-2 top-2 z-20 grid h-[74px] w-[74px] -rotate-12 place-items-center text-white",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-[#e53935] drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
        style={{ clipPath: STARBURST }}
      />
      <span className="relative text-center leading-[0.9] font-black">
        <span className="block text-[22px] tracking-[-0.02em]">-{discount}%</span>
        <span className="mt-0.5 block text-[9px] tracking-[0.14em]">OFERTA</span>
      </span>
    </span>
  );
}
