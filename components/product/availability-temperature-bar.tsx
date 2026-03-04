"use client";

import clsx from "clsx";
import { useProduct } from "components/product/product-context";
import { Product, ProductVariant } from "lib/shopify/types";
import { normalizeVariantId } from "lib/shopify/variant-utils";
import { useMemo } from "react";

const TOTAL_BLOCKS = 5;

const findVariantFromState = (
  variants: ProductVariant[],
  state: Record<string, string | undefined>,
) =>
  variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()],
    ),
  );

const getStockLevelLabel = (stock: number) => {
  if (stock <= 0) return "Sin existencia";
  if (stock <= 4) return "ultimas piezas";
  if (stock <= 8) return "limitada";
  if (stock <= 12) return "media";
  return "Alta";
};

export function AvailabilityTemperatureBar({ product }: { product: Product }) {
  const { state } = useProduct();
  const { variants } = product;

  const selectedVariant = useMemo(
    () => findVariantFromState(variants, state),
    [variants, state],
  );
  const chosenVariantId = normalizeVariantId(state["variantId"]);
  const overrideVariant = useMemo(
    () => variants.find((variant) => normalizeVariantId(variant.id) === chosenVariantId),
    [variants, chosenVariantId],
  );

  const variant = overrideVariant ?? selectedVariant ?? variants[0];

  if (!variant) {
    return null;
  }

  const rawStock = variant.quantityAvailable;
  const hasTrackedStock = typeof rawStock === "number";
  const stock = hasTrackedStock ? Math.max(0, rawStock) : 0;
  const activeBlocks =
    stock > 20 ? 5
    : stock > 12 ? 4
    : stock > 8 ? 3
    : stock > 4 ? 2
    : stock > 0 ? 1
    : 0;
  const activeColorClass =
    activeBlocks >= 5
      ? "bg-green-600"
      : activeBlocks === 4
        ? "bg-lime-400"
        : activeBlocks === 3
          ? "bg-yellow-400"
          : activeBlocks === 2
            ? "bg-orange-500"
            : activeBlocks === 1
              ? "bg-red-500"
              : "bg-neutral-300";

  return (
    <section className="mt-1  p-2 text-black">
      <h3 className="mb-2 text-center text-xs font-semibold">Disponibilidad</h3>

      <div className="flex flex-wrap items-center justify-center gap-3 text-black">

        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_BLOCKS }, (_, index) => (
            <div
              key={`availability-block-${index}`}
              className={clsx(
                "h-2 w-4 md:w-7 rounded-[2px] transition-colors duration-300",
                index < activeBlocks ? activeColorClass : "bg-neutral-300",
              )}
              title={`Nivel ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-medium text-neutral-700">
        {getStockLevelLabel(stock)}
      </p>
    </section>
  );
}
