"use client";

import clsx from "clsx";
import { useProduct, useUpdateURL } from "components/product/product-context";
import { ProductOption, ProductVariant } from "lib/shopify/types";

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
  // Special mode: If there are exactly two variants and no meaningful options,
  // show a simple toggle between those two variants (Pickup vs Recoger).
  const isTrivialOptions =
    !options?.length ||
    (options.length === 1 && (options[0]?.values?.length ?? 0) <= 1);
  const useTwoVariantToggle = isTrivialOptions && variants.length === 2;

  if (useTwoVariantToggle) {
    const [first, second] = variants as [ProductVariant, ProductVariant];
    const selectedId = (state["variantId"] as string | undefined) ?? first.id;

    const choices = [
      { id: first.id, label: "Recoger en sucursal" },
      { id: second.id, label: "Envío a domicilio" },
    ];

    return (
      <form>
        <dl className="mb-8">
          <dt className="mb-4 text-sm uppercase tracking-wide">
            Tipo de entrega
          </dt>
          <dd className="flex flex-wrap gap-3">
            {choices.map((c) => {
              const isActive = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  formAction={() => {
                    const newState = updateOption("variantId", c.id);
                    updateURL(newState);
                  }}
                  className={clsx(
                    "flex min-w-[48px] items-center justify-center rounded-full px-3 py-1 text-sm font-medium transition duration-200 ease-in-out",
                    "bg-neutral-100 text-black hover:bg-neutral-200 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-700",
                    {
                      "cursor-default bg-yellow-400 text-black dark:bg-yellow-500":
                        isActive,
                      "cursor-pointer": !isActive,
                    }
                  )}
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
      {}
    ),
  }));

  return computedOptions.map((option) => (
    <form key={option.id ?? `${option.name}-${option.values.join("|")}`}>
      <dl className="mb-8">
        <dt className="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
        <dd className="flex flex-wrap gap-3">
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
                    option.values.includes(value)
                )
            );
            const isAvailableForSale = combinations.find((combination) =>
              filtered.every(
                ([key, value]) =>
                  combination[key] === value && combination.availableForSale
              )
            );

            // The option is active if it's in the selected options.
            const isActive = state[optionNameLowerCase] === value;

            return (
              <button
                formAction={() => {
                  const newState = updateOption(optionNameLowerCase, value);
                  updateURL(newState);
                }}
                key={value}
                aria-disabled={!isAvailableForSale}
                disabled={!isAvailableForSale}
                title={`${option.name} ${value}${!isAvailableForSale ? " (Agotado)" : ""}`}
                className={clsx(
                  "flex min-w-[48px] items-center justify-center rounded-full px-3 py-1 text-sm font-medium transition duration-200 ease-in-out bg-transparent text-black hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700",
                  {
                    "cursor-default bg-yellow-400 text-black dark:bg-yellow-500":
                      isActive,
                    "ring-1 ring-transparent transition duration-300 ease-in-out hover:ring-blue-600":
                      !isActive && isAvailableForSale,
                    "relative z-10 cursor-not-allowed overflow-hidden bg-neutral-100 text-neutral-500 ring-1 ring-neutral-300 before:absolute before:inset-x-0 before:-z-10 before:h-px before:-rotate-45 before:bg-neutral-300 before:transition-transform dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:before:bg-neutral-700":
                      !isAvailableForSale,
                  }
                )}
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
