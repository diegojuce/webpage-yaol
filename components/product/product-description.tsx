"use client";

import clsx from "clsx";
import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import { Product } from "lib/shopify/types";
import { useState } from "react";
import { PaymentOptions } from "./payment-options";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({
  product,
  descriptions,
}: {
  product: Product;
  descriptions?: string[];
}) {
  const productDescriptions =
    descriptions?.filter((description) => description.trim().length > 0) ?? [];
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <>
      <div className="flex flex-col  pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-md sm:text-3xl md:text-4xl lg:text-2xl font-medium bg-[#E0E0E2] border border-b-10  border-b-neutral-800  rounded-tl-[48] rounded-br-[48] shadow-2xl px-5 lg:px-12 py-2">
          {product.title}
        </h1>
        <div className=" flex">
          {/* <div>
        <h2 className="mb-0 text-md sm:text-3xl md:text-4xl lg:text-2xl font-medium bg-red-600 text-neutral-200  rounded-bl-[48]  px-5 lg:px-12 py-2">25%</h2>
        </div> */}
          <div className="flex text-center px-3 rounded-xl text-2xl items-center shadow-xl font-bold text-yellow-900 bg-[#FFC600]">
            <Price
              amount={product.priceRange.minVariantPrice.amount}
              currencyCode={product.priceRange.minVariantPrice.currencyCode}
            />
          </div>
          <div className="flex px-2 lg:px-4 line-through text-center text-sm lg:text-xl items-center">
            <Price
              amount={product.priceRange.maxVariantPrice.amount}
              currencyCode={product.priceRange.maxVariantPrice.currencyCode}
            />
          </div>
        </div>
      </div>
      {productDescriptions.length > 0 ? (
        <div className="relative mb-6 rounded-sm md:bg-neutral-100 px-5 py-3 md:shadow-sm">
          <div className="relative pr-10">
            <div
              className={clsx(
                "space-y-2 overflow-hidden pr-1 text-md leading-tight text-black transition-all duration-300",
                isDescriptionExpanded ? "max-h-[1200px]" : "max-h-10",
              )}
            >
              {productDescriptions.map((description, index) => (
                <p key={`${description}-${index}`}>{description}</p>
              ))}
            </div>
            {!isDescriptionExpanded ? (
              <div className="hidden md:flex pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-neutral-100 to-transparent" />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setIsDescriptionExpanded((prev) => !prev)}
            aria-label={
              isDescriptionExpanded
                ? "Ocultar descripción completa"
                : "Mostrar descripción completa"
            }
            className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-neutral-700 shadow-sm transition hover:bg-white"
          >
            <span
              className={clsx(
                "transition-transform duration-200",
                isDescriptionExpanded && "rotate-180",
              )}
            >
              ↓
            </span>
          </button>
        </div>
      ) : null}

      <div className="flex lg:flex-row ">
        <VariantSelector
          options={product.options}
          variants={product.variants}
        />
      </div>

      <AddToCart product={product} />
      <PaymentOptions product={product} />
    </>
  );
}
