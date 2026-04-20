"use client";

import { CheckIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "components/cart/actions";
import { AvailabilityTemperatureBar } from "components/product/availability-temperature-bar";
import { useProduct } from "components/product/product-context";
import { Product, ProductVariant } from "lib/shopify/types";
import { normalizeVariantId } from "lib/shopify/variant-utils";
import { useActionState, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useCart } from "./cart-context";

const CART_ICON_BUMP_EVENT = "cart:icon-bump";

type SubmitButtonProps = {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
  buttonRef: RefObject<HTMLButtonElement | null>;
  plusRef: RefObject<HTMLSpanElement | null>;
  textRef: RefObject<HTMLSpanElement | null>;
  fillRef: RefObject<HTMLSpanElement | null>;
  successRef: RefObject<HTMLSpanElement | null>;
  tireRef: RefObject<HTMLSpanElement | null>;
};

function TireIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={clsx("block", className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="50" cy="50" r="48" fill="#0F0F10" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#2a2a2a" strokeWidth="1" />
      <circle cx="50" cy="50" r="28" fill="#3a3a3a" />
      <g stroke="#9a9a9a" strokeWidth="5" strokeLinecap="round">
        <line x1="50" y1="28" x2="50" y2="40" />
        <line x1="68.8" y1="39.1" x2="58.5" y2="45.2" />
        <line x1="64.4" y1="61.3" x2="54.1" y2="55.2" />
        <line x1="35.6" y1="61.3" x2="45.9" y2="55.2" />
        <line x1="31.2" y1="39.1" x2="41.5" y2="45.2" />
      </g>
      <circle cx="50" cy="50" r="6" fill="#0F0F10" />
    </svg>
  );
}

function SubmitButton({
  availableForSale,
  selectedVariantId,
  buttonRef,
  plusRef,
  textRef,
  fillRef,
  successRef,
  tireRef,
}: SubmitButtonProps) {
  const buttonClasses =
    "relative flex w-full items-center justify-center overflow-hidden rounded-full bg-yellow-500 p-4 text-black";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button type="button" disabled className={clsx(buttonClasses, disabledClasses)}>
        Agotado
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        type="button"
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
      ref={buttonRef}
      type="submit"
      aria-label="Agregar al carrito"
      className={clsx(buttonClasses, "font-medium tracking-wide transition hover:opacity-90")}
    >
      <span
        ref={fillRef}
        className="pointer-events-none absolute inset-0 z-[1] origin-left scale-x-0 bg-black"
      />

      <span
        ref={plusRef}
        className="absolute left-3 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-lg leading-none"
      >
        +
      </span>

      <span ref={textRef} className="relative z-20">
        Agregar al carrito
      </span>

      <span
        ref={successRef}
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center gap-2 text-sm font-semibold text-white opacity-0"
      >
        <CheckIcon className="h-4 w-4" />
        ¡Agregado al carrito!
      </span>

      <span
        ref={tireRef}
        className="pointer-events-none absolute left-[-64px] top-1/2 z-20 grid h-11 w-11 place-items-center opacity-0"
      >
        <TireIcon className="h-9 w-9" />
      </span>
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state, quantity, setQuantity } = useProduct();
  const [message, formAction] = useActionState(addItem, null);

  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const ctaPlusRef = useRef<HTMLSpanElement>(null);
  const ctaTextRef = useRef<HTMLSpanElement>(null);
  const ctaFillRef = useRef<HTMLSpanElement>(null);
  const ctaSuccessRef = useRef<HTMLSpanElement>(null);
  const ctaTireRef = useRef<HTMLSpanElement>(null);
  const flyingTireRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const animationTimeoutsRef = useRef<number[]>([]);

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

  const queueAnimationStep = (callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      animationTimeoutsRef.current = animationTimeoutsRef.current.filter(
        (id) => id !== timeoutId
      );
      callback();
    }, delay);
    animationTimeoutsRef.current.push(timeoutId);
  };

  const clearAnimationTimeouts = () => {
    animationTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    animationTimeoutsRef.current = [];
  };

  const cancelAnimations = (element: Element | null) => {
    if (!element) {
      return;
    }

    element.getAnimations().forEach((animation) => animation.cancel());
  };

  const findVisibleCartTrigger = () => {
    const triggers = Array.from(
      document.querySelectorAll<HTMLElement>("[data-cart-trigger='true']")
    );

    return (
      triggers.find((trigger) => {
        const styles = window.getComputedStyle(trigger);
        return (
          styles.display !== "none" &&
          styles.visibility !== "hidden" &&
          trigger.getClientRects().length > 0
        );
      }) || null
    );
  };

  const resetAddToCartAnimation = () => {
    clearAnimationTimeouts();
    cancelAnimations(ctaPlusRef.current);
    cancelAnimations(ctaTextRef.current);
    cancelAnimations(ctaFillRef.current);
    cancelAnimations(ctaSuccessRef.current);
    cancelAnimations(ctaTireRef.current);
    cancelAnimations(flyingTireRef.current);

    if (flyingTireRef.current) {
      flyingTireRef.current.style.opacity = "0";
    }

    isAnimatingRef.current = false;
  };

  const launchFlyingTire = (buttonRect: DOMRect) => {
    const flyTire = flyingTireRef.current;
    if (!flyTire) {
      window.dispatchEvent(new CustomEvent(CART_ICON_BUMP_EVENT));
      return;
    }

    const cartTrigger = findVisibleCartTrigger();
    if (!cartTrigger) {
      window.dispatchEvent(new CustomEvent(CART_ICON_BUMP_EVENT));
      return;
    }

    const targetRect = cartTrigger.getBoundingClientRect();
    const fromX = buttonRect.right - 28;
    const fromY = buttonRect.top + buttonRect.height / 2;
    const toX = targetRect.left + targetRect.width / 2;
    const toY = targetRect.top + targetRect.height / 2;

    flyTire.style.left = `${fromX}px`;
    flyTire.style.top = `${fromY}px`;
    flyTire.style.opacity = "1";

    const dx = toX - fromX;
    const dy = toY - fromY;

    const animation = flyTire.animate(
      [
        {
          transform: "translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1)",
          offset: 0,
        },
        {
          transform: `translate(-50%, -50%) translate(${dx * 0.5}px, ${dy * 0.2}px) rotate(900deg) scale(0.9)`,
          offset: 0.5,
        },
        {
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(1800deg) scale(0.2)`,
          offset: 1,
        },
      ],
      {
        duration: 500,
        easing: "cubic-bezier(.5,.1,.5,1)",
        fill: "forwards",
      }
    );

    animation.onfinish = () => {
      flyTire.style.opacity = "0";
      window.dispatchEvent(new CustomEvent(CART_ICON_BUMP_EVENT));
    };
  };

  const playAddToCartAnimation = () => {
    if (isAnimatingRef.current || !submitButtonRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    clearAnimationTimeouts();
    cancelAnimations(ctaPlusRef.current);
    cancelAnimations(ctaTextRef.current);
    cancelAnimations(ctaFillRef.current);
    cancelAnimations(ctaSuccessRef.current);
    cancelAnimations(ctaTireRef.current);

    const buttonRect = submitButtonRef.current.getBoundingClientRect();
    const buttonWidth = buttonRect.width;
    const tireWidth = ctaTireRef.current?.getBoundingClientRect().width ?? 44;

    ctaPlusRef.current?.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 180, fill: "forwards" }
    );
    ctaTextRef.current?.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-4px)" },
      ],
      { duration: 180, fill: "forwards" }
    );

    ctaTireRef.current?.animate(
      [
        {
          left: `${-tireWidth - 20}px`,
          opacity: 0,
          transform: "translateY(-50%) rotate(0deg)",
        },
        {
          left: "16px",
          opacity: 1,
          offset: 0.15,
          transform: "translateY(-50%) rotate(180deg)",
        },
        {
          left: `${Math.max(16, buttonWidth - tireWidth - 16)}px`,
          opacity: 1,
          offset: 0.85,
          transform: "translateY(-50%) rotate(1080deg)",
        },
        {
          left: `${buttonWidth + tireWidth / 2}px`,
          opacity: 0,
          transform: "translateY(-50%) rotate(1260deg)",
        },
      ],
      {
        duration: 900,
        easing: "cubic-bezier(.4,.1,.3,1)",
        fill: "forwards",
      }
    );

    queueAnimationStep(() => launchFlyingTire(buttonRect), 720);

    queueAnimationStep(() => {
      ctaFillRef.current?.animate(
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        {
          duration: 260,
          easing: "cubic-bezier(.4,0,.2,1)",
          fill: "forwards",
        }
      );
      ctaSuccessRef.current?.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 260, delay: 120, fill: "forwards" }
      );
    }, 900);

    queueAnimationStep(() => {
      ctaSuccessRef.current?.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: 220, fill: "forwards" }
      );
      ctaFillRef.current?.animate(
        [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
        {
          duration: 300,
          easing: "cubic-bezier(.4,0,.2,1)",
          fill: "forwards",
        }
      );
      ctaPlusRef.current?.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 220, delay: 180, fill: "forwards" }
      );
      ctaTextRef.current?.animate(
        [
          { opacity: 0, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 220, delay: 180, fill: "forwards" }
      );
    }, 1900);

    queueAnimationStep(() => {
      resetAddToCartAnimation();
    }, 2250);
  };

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

  useEffect(() => {
    return () => {
      resetAddToCartAnimation();
    };
  }, []);

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
  const isAtMaxQuantity =
    typeof availableQuantity === "number" &&
    availableQuantity > 0 &&
    quantity >= availableQuantity;

  return (
    <form
      action={async () => {
        if (!selectedVariantId || !finalVariant || quantity <= 0) {
          return;
        }

        playAddToCartAnimation();

        // Normalize variant price if missing; fallback to product-level price
        const amountNum = Number(finalVariant?.price?.amount);
        const normalizedVariant = {
          ...finalVariant,
          price:
            Number.isFinite(amountNum) && amountNum > 0
              ? finalVariant.price
              : product.priceRange.minVariantPrice,
        } as ProductVariant;

        addCartItem(normalizedVariant, product, quantity);
        window.dispatchEvent(
          new CustomEvent("cart:item-added", {
            detail: {
              merchandiseId: selectedVariantId,
              quantity,
            },
          })
        );
        formAction({ selectedVariantId, quantity });
      }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-0 text-sm font-medium text-black">
        <div className="flex items-center gap-2">
          <span>Cantidad</span>
          <div className="relative">
            <div className="flex items-center rounded-full border border-neutral-200 bg-white text-black">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                onClick={handleDecrement}
                className="flex h-10 w-10 items-center justify-center rounded-l-full transition hover:bg-neutral-100"
              >
                <MinusIcon className="h-4" />
              </button>
              <span
                className={clsx(
                  "w-10 text-center text-base font-semibold",
                  isAtMaxQuantity && "text-red-600"
                )}
              >
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
            {isAtMaxQuantity ? (
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-xs text-red-600">
                unicas pzs
              </span>
            ) : null}
          </div>
        </div>
        {/* <span className="text-xs font-normal text-neutral-600">
          Disponibilidad: {availabilityLabel}
        </span> */}
        <AvailabilityTemperatureBar product={product} />
      </div>
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
        buttonRef={submitButtonRef}
        plusRef={ctaPlusRef}
        textRef={ctaTextRef}
        fillRef={ctaFillRef}
        successRef={ctaSuccessRef}
        tireRef={ctaTireRef}
      />
      <div
        ref={flyingTireRef}
        className="pointer-events-none fixed left-0 top-0 z-[240] grid h-14 w-14 place-items-center overflow-visible opacity-0"
        aria-hidden="true"
      >
        <TireIcon className="h-full w-full" />
      </div>
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
      <span className="sr-only">Disponibilidad: {availabilityLabel}</span>
    </form>
  );
}
