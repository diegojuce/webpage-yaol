"use client";

import clsx from "clsx";
import { useProduct, useUpdateURL } from "components/product/product-context";
import { ProductOption, ProductVariant } from "lib/shopify/types";
import { normalizeVariantId } from "lib/shopify/variant-utils";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

export function VariantSelector({
  options,
  variants,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
}) {
  const { state, updateOption } = useProduct();
  const updateURL = useUpdateURL();
  const segmentedControlClass =
    "inline-flex flex-wrap items-center gap-1 rounded-full bg-gradient-to-r from-[#FFC600] to-[#8B6220] p-1";
  const segmentedButtonBaseClass =
    "flex min-w-[132px] items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ease-in-out";
  // Special mode: If there are exactly two variants and no meaningful options,
  // show a simple toggle between those two variants (Pickup vs Recoger).
  const isTrivialOptions =
    !options?.length ||
    (options.length === 1 && (options[0]?.values?.length ?? 0) <= 1);
  const useTwoVariantToggle = isTrivialOptions && variants.length === 2;

  if (useTwoVariantToggle) {
    const [first, second] = variants as [ProductVariant, ProductVariant];
    const firstId = normalizeVariantId(first.id);
    const secondId = normalizeVariantId(second.id);
    const selectedId =
      normalizeVariantId(state["variantId"]) ?? firstId ?? undefined;

    const choices = [
      firstId ? { id: firstId, label: "Recoger en sucursal" } : null,
      secondId ? { id: secondId, label: "Envío a domicilio" } : null,
    ].filter((choice): choice is { id: string; label: string } =>
      Boolean(choice),
    );

    return (
      <form>
        <dl className="mb-8">
          {/* <dt className="mb-3 text-sm uppercase tracking-wide">
            Tipo de entrega
          </dt> */}
          <dd className={segmentedControlClass}>
            {choices.map((c) => {
              const isActive = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    const newState = updateOption("variantId", c.id);
                    updateURL(newState);
                  }}
                  className={clsx(segmentedButtonBaseClass, {
                    "cursor-default bg-white text-[#8B6220] shadow-sm":
                      isActive,
                    "cursor-pointer bg-transparent text-white hover:bg-white/15":
                      !isActive,
                  })}
                >
                  {c.label}
                </button>
              );
            })}
          </dd>
        </dl>
      </form>
    );
  }

  // Default behavior: render option chips derived from product options or from
  // variants' selectedOptions when options are present.
  const computedOptions: ProductOption[] =
    options && options.length > 0 ? options : [];

  const hasNoOptionsOrJustOneOption =
    !computedOptions.length ||
    (computedOptions.length === 1 && computedOptions[0]?.values.length === 1);

  if (hasNoOptionsOrJustOneOption) {
    return null;
  }

  const combinations: Combination[] = variants.map((variant) => ({
    id: variant.id,
    availableForSale: variant.availableForSale,
    ...variant.selectedOptions.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.name.toLowerCase()]: option.value,
      }),
      {},
    ),
  }));

  return computedOptions.map((option) => (
    <form key={option.id ?? `${option.name}-${option.values.join("|")}`}>
      <dl className="mb-8">
        <dt className="mb-3 text-sm uppercase tracking-wide">{option.name}</dt>
        <dd className={segmentedControlClass}>
          {option.values.map((value) => {
            const optionNameLowerCase = option.name.toLowerCase();

            // Base option params on current selectedOptions so we can preserve any other param state.
            const optionParams = { ...state, [optionNameLowerCase]: value };

            // Filter out invalid options and check if the option combination is available for sale.
            const filtered = Object.entries(optionParams).filter(
              ([key, value]) =>
                options.find(
                  (option) =>
                    option.name.toLowerCase() === key &&
                    option.values.includes(value),
                ),
            );
            const isAvailableForSale = combinations.find((combination) =>
              filtered.every(
                ([key, value]) =>
                  combination[key] === value && combination.availableForSale,
              ),
            );

            // The option is active if it's in the selected options.
            const isActive = state[optionNameLowerCase] === value;

            return (
              <button
                type="button"
                onClick={() => {
                  const newState = updateOption(optionNameLowerCase, value);
                  updateURL(newState);
                }}
                key={value}
                aria-disabled={!isAvailableForSale}
                disabled={!isAvailableForSale}
                title={`${option.name} ${value}${!isAvailableForSale ? " (Agotado)" : ""}`}
                className={clsx(segmentedButtonBaseClass, {
                  "cursor-default bg-white text-black shadow-sm": isActive,
                  "cursor-pointer bg-transparent text-white hover:bg-white/15":
                    !isActive && isAvailableForSale,
                  "cursor-not-allowed bg-white/30 text-white/70 ring-1 ring-white/40":
                    !isAvailableForSale,
                })}
              >
                {value}
              </button>
            );
          })}
        </dd>
      </dl>
    </form>
  ));
}
