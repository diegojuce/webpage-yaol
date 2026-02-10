"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { updateItemQuantity } from "components/cart/actions";
import type { CartItem } from "lib/shopify/types";
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
      className={clsx(
        "ease flex h-full min-w-[36px] max-w-[36px] flex-none items-center justify-center rounded-full p-2 transition-all duration-200 hover:border-neutral-800 hover:opacity-80",
        {
          "ml-auto": type === "minus",
        },
      )}
    >
      {type === "plus" ? (
        <PlusIcon className="h-4 w-4 dark:text-neutral-500" />
      ) : (
        <MinusIcon className="h-4 w-4 dark:text-neutral-500" />
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
  const edges = productAny?.variants?.edges ?? [];
  const variants = edges.map((e: any) => e.node);
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
