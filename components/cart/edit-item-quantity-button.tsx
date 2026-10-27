"use client";
import { cartLineVariants } from "lib/commerce/variant-utils";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { updateItemQuantity } from "components/cart/actions";
import type { CartItem } from "lib/commerce/types";
import { useActionState } from "react";

function SubmitButton({ type }: { type: "plus" | "minus" }) {
  return (
    <button
      type="submit"
      aria-label={
        type === "plus"
          ? "Aumentar cantidad del producto"
          : "Disminuir cantidad del producto"
      }
      className="flex h-full w-8 flex-none items-center justify-center rounded-full text-white/70 transition-colors duration-200 hover:text-[#FFC600]"
    >
      {type === "plus" ? (
        <PlusIcon className="h-3.5 w-3.5" />
      ) : (
        <MinusIcon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function EditItemQuantityButton({
  item,
  type,
  optimisticUpdate,
}: {
  item: CartItem;
  type: "plus" | "minus";
  optimisticUpdate: any;
}) {
  const [message, formAction] = useActionState(updateItemQuantity, null);
  const productAny = (item?.merchandise?.product ?? {}) as any;
  const variants = cartLineVariants(productAny);
  const currentVariant = variants.find(
    (variant: any) => variant.id === item.merchandise.id
  );
  const maxAvailable =
    typeof currentVariant?.quantityAvailable === "number"
      ? currentVariant.quantityAvailable
      : undefined;
  const isIncrement = type === "plus";
  const tentativeQuantity = isIncrement
    ? item.quantity + 1
    : item.quantity - 1;
  let nextQuantity = tentativeQuantity;

  if (isIncrement && typeof maxAvailable === "number") {
    if (item.quantity >= maxAvailable) {
      nextQuantity = item.quantity;
    } else {
      nextQuantity = Math.min(tentativeQuantity, maxAvailable);
    }
  }

  const payload = {
    lineId: item.id,
    merchandiseId: item.merchandise.id,
    updateType: type,
  };
  const updateItemQuantityAction = formAction.bind(null, payload);

  return (
    <form
      action={async () => {
        if (nextQuantity === item.quantity) {
          return;
        }

        optimisticUpdate(item.merchandise.id, type);
        updateItemQuantityAction();
      }}
    >
      <SubmitButton type={type} />
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </form>
  );
}
