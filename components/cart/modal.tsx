"use client";

import { Dialog, Transition } from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import ServiceModal from "components/appointments/programar-cita";
import LoadingDots from "components/loading-dots";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCartAndSetCookie, redirectToCheckout, updateItemVariant } from "./actions";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import OpenCart from "./open-cart";
// Removed unused static ShippingType in favor of per-line selector
import type { CartItem, Product, ProductVariant } from "lib/shopify/types";
import { useActionState } from "react";

function LineShippingSelector({
  item,
  optimisticUpdate,
}: {
  item: CartItem;
  optimisticUpdate: (lineId: string, variant: ProductVariant, product: Product) => void;
}) {
  const [message, formAction] = useActionState(updateItemVariant, null);

  // Extract variants from product on the cart line
  const productAny = (item?.merchandise?.product ?? {}) as any;
  const edges = productAny?.variants?.edges ?? [];
  const variants: ProductVariant[] = edges.map((e: any) => e.node);
  const first = variants[0];
  const second = variants[1];
  if (!first || !second) return null;

  const currentVariantId = item.merchandise.id;

  const handleSelect = async (targetId: string) => {
    const chosen = variants.find((v) => v.id === targetId) || first;
    // Optimistic update
    optimisticUpdate(item.id!, chosen, productAny as Product);
    // Server update
    const payload = { lineId: item.id!, merchandiseId: chosen.id };
    const action = formAction.bind(null, payload);
    await action();
  };

  return (
    <div className="mb-2 mx-7">
      <h3 className="text-sm font-semibold mb-2 text-yellow-600">Seleccione el tipo de envío:</h3>
      <div className="mx-4">
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`shippingType-${item.id}`}
              value={first.id}
              checked={currentVariantId === first.id}
              onChange={() => handleSelect(first.id)}
              className="form-radio h-3 w-3 text-yellow-600"
            />
            <span className="text-xs">Instalar en Yantissimo</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`shippingType-${item.id}`}
              value={second.id}
              checked={currentVariantId === second.id}
              onChange={() => handleSelect(second.id)}
              className="form-radio h-3 w-3 text-yellow-600"
            />
            <span className="text-xs">Envío a domicilio</span>
          </label>
        </div>
      </div>
      <p aria-live="polite" className="sr-only" role="status">{message}</p>
    </div>
  );
}

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal({isWhite=false}) {
  const { cart, updateCartItem, updateCartItemVariant } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const [shippingType, setShippingType] = useState<string>("store");
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  useEffect(() => {
    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      if (!isOpen) {
        setIsOpen(true);
      }
      quantityRef.current = cart?.totalQuantity;
    }
  }, [isOpen, cart?.totalQuantity, quantityRef]);

  return (
    <>
      <button aria-label="Abrir carrito" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} isWhite={isWhite} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-[200]">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-[.5px]"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-[.5px]"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div
              className="fixed inset-0 z-[210] bg-black/30"
              aria-hidden="true"
            />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 z-[220] flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[390px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Mi carrito</p>
                <button aria-label="Cerrar carrito" onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {!cart || cart.lines.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">
                    Tu carrito está vacío.
                  </p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="grow overflow-auto py-4">
                    {cart.lines
                      .sort((a, b) =>
                        a.merchandise.product.title.localeCompare(
                          b.merchandise.product.title,
                        ),
                      )
                      .map((item, i) => {
                        const merchandiseSearchParams =
                          {} as MerchandiseSearchParams;

                        item.merchandise.selectedOptions.forEach(
                          ({ name, value }) => {
                            if (value !== DEFAULT_OPTION) {
                              merchandiseSearchParams[name.toLowerCase()] =
                                value;
                            }
                          },
                        );

                        const merchandiseUrl = createUrl(
                          `/product/${item.merchandise.product.handle}`,
                          new URLSearchParams(merchandiseSearchParams),
                        );

                        return (
                          <li
                            key={i}
                            className="flex w-full flex-col border-b border-neutral-300 dark:border-neutral-700"
                          >
                            <div className="relative flex w-full flex-row justify-between px-1 py-4">
                              <div className="absolute z-40 -ml-1 -mt-2">
                                <DeleteItemButton
                                  item={item}
                                  optimisticUpdate={updateCartItem}
                                />
                              </div>
                              <div className="flex flex-row">
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                  <Image
                                    className="h-full w-full object-cover"
                                    width={64}
                                    height={64}
                                    alt={
                                      item.merchandise?.product?.featuredImage?.altText ||
                                      item.merchandise.product.title
                                    }
                                    src={
                                      item.merchandise?.product?.featuredImage?.url
                                    }
                                  />
                                </div>
                                <Link
                                  href={merchandiseUrl}
                                  onClick={closeCart}
                                  className="z-30 ml-2 flex flex-row space-x-4"
                                >
                                  <div className="flex flex-1 flex-col text-base">
                                    <span className="leading-tight">
                                      {item.merchandise.product.title}
                                    </span>
                                    {item.merchandise.title !==
                                    DEFAULT_OPTION ? (
                                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {item.merchandise.title}
                                      </p>
                                    ) : null}
                                  </div>
                                </Link>
                              </div>
                              <div className="flex h-16 flex-col justify-between">
                                {(() => {
                                  const productAny = (item?.merchandise?.product ?? {}) as any;
                                  const fallbackAmount =
                                    productAny?.priceRange?.minVariantPrice?.amount;
                                  const fallbackCurrency =
                                    productAny?.priceRange?.minVariantPrice?.currencyCode;
                                  const amount =
                                    item?.cost?.totalAmount?.amount || fallbackAmount || "0";
                                  const currencyCode =
                                    item?.cost?.totalAmount?.currencyCode || fallbackCurrency || "MXN";
                                  return (
                                    <Price
                                      className="flex justify-end space-y-2 text-right text-sm"
                                      amount={amount}
                                      currencyCode={currencyCode}
                                    />
                                  );
                                })()}
                                <div className="ml-auto flex h-9 flex-row items-center rounded-full border border-neutral-200 dark:border-neutral-700">
                                  <EditItemQuantityButton
                                    item={item}
                                    type="minus"
                                    optimisticUpdate={updateCartItem}
                                  />
                                  <p className="w-6 text-center">
                                    <span className="w-full text-sm">
                                      {item.quantity}
                                    </span>
                                  </p>
                                  <EditItemQuantityButton
                                    item={item}
                                    type="plus"
                                    optimisticUpdate={updateCartItem}
                                  />
                                </div>
                              </div>
                            </div>
                            <LineShippingSelector item={item} optimisticUpdate={updateCartItemVariant} />
                          </li>
                        );
                      })}
                  </ul>
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    {/* <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Taxes</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.cost.totalTaxAmount.amount}
                        currencyCode={cart.cost.totalTaxAmount.currencyCode}
                      />
                    </div> */}
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Tipo de envío</p>
                      <p className="text-right">GRATIS</p>
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Total</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={cart.cost.totalAmount.amount}
                        currencyCode={cart.cost.totalAmount.currencyCode}
                      />
                    </div>
                  </div>
                  <div className="py-4">
                    <form action={redirectToCheckout}>
                      <CheckoutButton />
                    </form>
                    <ServiceModal></ServiceModal>
                  </div>
      
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

function CloseCart({ className }: { className?: string }) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center bg-white dark:bg-black rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white">
      <XMarkIcon
        className={clsx(
          "h-6 transition-all ease-in-out hover:scale-110",
          className,
        )}
      />
    </div>
  );
}

function CheckoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="block w-full rounded-full bg-yellow-500 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
      type="submit"
      disabled={pending}
    >
      {pending ? <LoadingDots className="bg-white" /> : "Completar Pago"}
    </button>
  );
}
