"use client";
import { LocalShipping, TireRepair } from '@mui/icons-material';
import AirIcon from '@mui/icons-material/Air';
import BuildIcon from '@mui/icons-material/Build';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import clsx from "clsx";
import { useProduct, useUpdateURL } from "components/product/product-context";
import { ProductOption, ProductVariant } from "lib/shopify/types";
import { normalizeVariantId } from "lib/shopify/variant-utils";

type Combination = {
  id: string;
  availableForSale: boolean;
  [key: string]: string | boolean;
};

const findVariantFromState = (
  variants: ProductVariant[],
  state: Record<string, string | undefined>,
) =>
  variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()],
    ),
  );

const getVariantInfoMessage = (
  variant: ProductVariant,
  labelOverride?: string,
) => {
  const normalizedTitle = (labelOverride ?? variant.title).toLowerCase();

  if (
    normalizedTitle.includes("recoger") ||
    normalizedTitle.includes("pickup") ||
    normalizedTitle.includes("sucursal")
  ) {
    return (
      <div className='flex items-center flex-col md:flex-row gap-1 md-gap-2'>
      <div className='flex items-center flex-row gap-2'>
        <BuildIcon fontSize="medium" />
        <p className="">Instalacion GRATIS</p>
     
        <TireRepair fontSize="medium" />
        <p className="">Balanceo GRATIS</p>
      </div>
      <div className='flex items-center flex-row gap-2'>
        <AirIcon fontSize="medium" />
        <p className="">Nitrogeno & valvula GRATIS</p>
      </div>
      <div className='flex items-center flex-row gap-2'>
        <CalendarMonthIcon fontSize="medium" />
        <p className="">Agenda tu cita ONLINE</p>
      </div>
      </div>

      )
  }

  if (
    normalizedTitle.includes("envío") ||
    normalizedTitle.includes("envio") ||
    normalizedTitle.includes("delivery") ||
    normalizedTitle.includes("domicilio")
  ) {
    return (
      <div className='flex items-center flex-row gap-2'>
      <LocalShipping fontSize="medium" />
      <p className="">Envio GRATIS: Entrega de 2-5 días</p>
    </div>
    )
  }

  const optionsSummary = variant.selectedOptions
    .map((option) => `${option.name}: ${option.value}`)
    .join(" · ");

  return optionsSummary
    ? `Seleccionaste la variante ${optionsSummary}.`
    : `Seleccionaste la variante ${variant.title}.`;
};

const VariantInfoBox = ({
  variant,
  labelOverride,
}: {
  variant?: ProductVariant;
  labelOverride?: string;
}) => {
  if (!variant) {
    return null;
  }

  return (
    <p className="mt-2 w-full rounded-2xl bg-white shadow-sm px-4 py-3 text-sm text-[#5D4418]">
      {getVariantInfoMessage(variant, labelOverride)}
    </p>
  );
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
    "grid w-full items-center truncate gap-1 rounded-full bg-gradient-to-r from-[#FFC600] to-[#8B6220] p-1";
  const segmentedButtonBaseClass =
    "flex w-full min-w-0 items-center justify-center text-center rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ease-in-out";
  const chosenVariantId = normalizeVariantId(state["variantId"]);
  const selectedVariantFromOptions = findVariantFromState(variants, state);
  const selectedVariant =
    variants.find(
      (variant) => normalizeVariantId(variant.id) === chosenVariantId,
    ) ??
    selectedVariantFromOptions ??
    variants[0];
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
    const selectedId = chosenVariantId ?? firstId ?? undefined;

    const choices = [
      firstId ? { id: firstId, label: "Recoger en sucursal" } : null,
      secondId ? { id: secondId, label: "Envío a domicilio" } : null,
    ].filter((choice): choice is { id: string; label: string } =>
      Boolean(choice),
    );
    const activeChoice = choices.find((choice) => choice.id === selectedId);

    return (
      <form className="w-full">
        <dl className="mb-4 w-full rounded-2xl md:bg-neutral-50 md:p-4 md:shadow-lg">
          <dd
            className={segmentedControlClass}
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, choices.length)}, minmax(0, 1fr))`,
            }}
          >
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
                    "cursor-default bg-white shadow-xl  border-[#8B6220] text-[#8B6220] shadow-sm":
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
          <VariantInfoBox
            variant={selectedVariant}
            labelOverride={activeChoice?.label}
          />
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

  return (
    <div className="w-full">
      {computedOptions.map((option) => (
        <form
          className="w-full"
          key={option.id ?? `${option.name}-${option.values.join("|")}`}
        >
          <dl className="mb-8 w-full">
            <dt className="mb-3 text-sm uppercase tracking-wide">
              {option.name}
            </dt>
            <dd
              className={segmentedControlClass}
              style={{
                gridTemplateColumns: `repeat(${Math.max(1, option.values.length)}, minmax(0, 1fr))`,
              }}
            >
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
                      combination[key] === value &&
                      combination.availableForSale,
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
      ))}
      <VariantInfoBox variant={selectedVariant} />
    </div>
  );
}
