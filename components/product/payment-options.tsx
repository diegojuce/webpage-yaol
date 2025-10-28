'use client';

import { useMemo } from 'react';
import { useProduct } from 'components/product/product-context';
import { Product, ProductVariant } from 'lib/shopify/types';

const PAYMENT_PLANS = [
  { label: '3 Meses', months: 3, rate: 0.0469 },
  { label: '6 Meses', months: 6, rate: 0.0769 },
  { label: '9 Meses', months: 9, rate: 0.1119 },
  { label: '12 Meses', months: 12, rate: 0.1289 }
];

const formatCurrency = (value: number, currencyCode: string) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'narrowSymbol'
  }).format(value);

const findVariantFromState = (
  variants: ProductVariant[],
  state: Record<string, string | undefined>
) =>
  variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );

export function PaymentOptions({ product }: { product: Product }) {
  const { state, quantity } = useProduct();
  const { variants, priceRange } = product;
  const hasMultipleVariants = variants.length > 1;

  const selectedVariant = useMemo(
    () => findVariantFromState(variants, state),
    [variants, state]
  );

  if (hasMultipleVariants && !selectedVariant) {
    return (
      <section className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-black">
        <h3 className="mb-3 text-base font-semibold">Opciones de pago</h3>
        <p className="text-neutral-600">
          Selecciona una combinación disponible para ver los montos mensuales con el incremento
          correspondiente.
        </p>
      </section>
    );
  }

  const variant = selectedVariant ?? variants[0];

  if (!variant) {
    return null;
  }

  const unitPrice = parseFloat(variant.price.amount);
  if (Number.isNaN(unitPrice)) {
    return null;
  }

  const currencyCode =
    variant.price.currencyCode ?? priceRange.maxVariantPrice.currencyCode ?? 'USD';
  const totalPrice = unitPrice * quantity;

  const plans = PAYMENT_PLANS.map((plan) => {
    const totalWithInterest = totalPrice * (1 + plan.rate);
    const monthlyAmount = totalWithInterest / plan.months;

    return {
      ...plan,
      totalWithInterest,
      monthlyAmount
    };
  });

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-black">
      <h3 className="mb-3 text-base font-semibold">Opciones de pago</h3>
      <p className="mb-3 text-xs text-neutral-600">
        Precio base seleccionado: {formatCurrency(totalPrice, currencyCode)} {currencyCode}
      </p>
      <ul className="space-y-2">
        {plans.map(({ label, months, monthlyAmount }) => (
          <li className="flex items-center justify-between" key={months}>
            <span>{label}</span>
            <span className="font-semibold">
              {formatCurrency(monthlyAmount, currencyCode)} {currencyCode} / mes
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-neutral-500">
        Los montos incluyen el incremento porcentual indicado y se dividen entre el número de
        pagos.
      </p>
    </section>
  );
}
