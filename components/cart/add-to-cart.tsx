'use client';

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { addItem } from 'components/cart/actions';
import { useProduct } from 'components/product/product-context';
import { Product, ProductVariant } from 'lib/shopify/types';
import { useActionState, useState } from 'react';
import { useCart } from './cart-context';

function SubmitButton({
  availableForSale,
  selectedVariantId
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const buttonClasses =
    'relative flex w-full items-center justify-center rounded-full bg-yellow-500 p-4 tracking-wide text-white';
  const disabledClasses = 'cursor-not-allowed opacity-60 hover:opacity-60';

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        Out Of Stock
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label="Please select an option"
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        Add To Cart
      </button>
    );
  }

  return (
    <button
      aria-label="Add to cart"
      className={clsx(buttonClasses, {
        'hover:opacity-90': true
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      Add To Cart
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [quantity, setQuantity] = useState(1);
  const [message, formAction] = useActionState(addItem, null);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()]
    )
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId
  );

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <form
      action={async () => {
        if (!selectedVariantId || !finalVariant) {
          return;
        }

        addCartItem(finalVariant, product, quantity);
        await formAction({ selectedVariantId, quantity });
      }}
    >
      <div className="mb-4 flex items-center gap-3 text-sm font-medium text-black">
        <span>Cantidad</span>
        <div className="flex items-center rounded-full border border-neutral-200 bg-white text-black">
          <button
            type="button"
            aria-label="Disminuir cantidad"
            onClick={decrementQuantity}
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
            onClick={incrementQuantity}
            className="flex h-10 w-10 items-center justify-center rounded-r-full transition hover:bg-neutral-100"
          >
            <PlusIcon className="h-4" />
          </button>
        </div>
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
