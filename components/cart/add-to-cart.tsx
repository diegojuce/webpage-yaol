"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { useProduct } from "components/product/product-context";
import { normalizeVariantId } from "lib/shopify/variant-utils";
import { Product, ProductVariant } from "lib/shopify/types";
import { useActionState, useEffect } from "react";
import { useCart } from "./cart-context";

function SubmitButton({
  availableForSale,
  selectedVariantId,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-yellow-500 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Agotado
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Por favor selecciona una opción"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Agregar al carrito
      </button>
    );
  }

  return (
    <button
      aria-label="Agregar al carrito"
      className={clsx(buttonClasses, {
        "hover:opacity-90": true,
      })}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Agregar al carrito
      </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state, quantity, setQuantity } = useProduct();
  const [message, formAction] = useActionState(addItem, null);
  console.debug("[add-to-cart] Product:", product);
  console.debug("[add-to-cart] Product:", product.variants[0]?.selectedOptions);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  // If a variantId is explicitly chosen via the two-variant toggle, prefer it.
  const chosenVariantIdFromState = normalizeVariantId(state["variantId"]);
  const defaultVariantId = normalizeVariantId(variants[0]?.id);
  const variantIdFromOptions = variant
    ? normalizeVariantId(variant.id)
    : undefined;
  const selectedVariantId =
    chosenVariantIdFromState || variantIdFromOptions || defaultVariantId;
  const finalVariant = variants.find(
    (variant) => normalizeVariantId(variant.id) === selectedVariantId
  );
  const availableQuantity =
    typeof finalVariant?.quantityAvailable === "number"
      ? finalVariant.quantityAvailable
      : undefined;

  useEffect(() => {
    if (typeof availableQuantity !== "number") {
      return;
    }

    if (availableQuantity <= 0) {
      if (quantity !== 0) {
        setQuantity(0);
      }
      return;
    }

    if (quantity === 0) {
      setQuantity(1);
      return;
    }

    if (quantity > availableQuantity) {
      setQuantity(availableQuantity);
    }
  }, [availableQuantity, quantity, setQuantity, chosenVariantIdFromState]);

  const handleIncrement = () =>
    setQuantity((prev) => {
      if (typeof availableQuantity === "number") {
        if (availableQuantity <= 0) {
          return 0;
        }
        return prev >= availableQuantity ? availableQuantity : prev + 1;
      }
      return prev + 1;
    });

  const handleDecrement = () =>
    setQuantity((prev) => {
      if (prev <= 1) {
        if (typeof availableQuantity === "number" && availableQuantity <= 0) {
          return 0;
        }
        return 1;
      }

      return prev - 1;
    });

  const availabilityLabel =
    typeof availableQuantity === "number" ? availableQuantity : "--";

  return (
    <form
      action={async () => {
        if (!selectedVariantId || !finalVariant || quantity <= 0) {
          return;
        }
        // Normalize variant price if missing; fallback to product-level price
        const amountNum = Number(finalVariant?.price?.amount);
        const normalizedVariant = {
          ...finalVariant,
          price:
            Number.isFinite(amountNum) && amountNum > 0
              ? finalVariant.price
              : product.priceRange.minVariantPrice,
        } as ProductVariant;
        console.debug(
          "[add-to-cart] Adding item:",
          normalizedVariant,
          product,
          quantity
        );
        console.debug(
          "[add-to-cart] Form action:",
          selectedVariantId,
          quantity
        );

        addCartItem(normalizedVariant, product, quantity);
        formAction({ selectedVariantId, quantity });
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-black">
        <div className="flex items-center gap-3">
          <span>Cantidad</span>
          <div className="flex items-center rounded-full border border-neutral-200 bg-white text-black">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={handleDecrement}
              className="flex h-10 w-10 items-center justify-center rounded-l-full transition hover:bg-neutral-100"
            >
              <MinusIcon className="h-4" />
            </button>
            <span className="w-10 text-center text-base font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Incrementar cantidad"
              onClick={handleIncrement}
              className="flex h-10 w-10 items-center justify-center rounded-r-full transition hover:bg-neutral-100"
            >
              <PlusIcon className="h-4" />
            </button>
          </div>
        </div>
        <span className="text-xs font-normal text-neutral-600">
          Disponibilidad: {availabilityLabel}
        </span>
      </div>
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
      />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
