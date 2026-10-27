"use client";

import { Dialog, Transition } from "@headlessui/react";
import { ShoppingCartIcon, XMarkIcon } from "@heroicons/react/24/outline";
import LoadingDots from "components/loading-dots";
import LogoSquare from "components/logo-square";
import {
  COMMERCE_DISABLED_MESSAGE,
  COMMERCE_ENABLED,
  COMMERCE_PROVIDER,
} from "lib/commerce-status";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";
import Image from "components/safe-image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, Fragment, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createCartAndSetCookie,
  setCartIdFromParam,
  startCheckout,
} from "./actions";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import OpenCart from "./open-cart";

let activeCartModalId: string | null = null;
const activeCartModalListeners = new Set<(id: string | null) => void>();

const setActiveCartModalId = (nextId: string | null) => {
  activeCartModalId = nextId;
  activeCartModalListeners.forEach((listener) => listener(activeCartModalId));
};

const formatMXN = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    amount,
  );

type MerchandiseSearchParams = {
  [key: string]: string;
};

// La entrega (instalar en sucursal o envío) y los datos del cliente se piden
// en el checkout (/pago): agregar al carrito no abre nada, solo anima el ícono.
const CART_ICON_BUMP_EVENT = "cart:icon-bump";

export default function CartModal({ isWhite = false }) {
  const { cart, updateCartItem } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggerVisible, setIsTriggerVisible] = useState(false);
  const modalId = useId();
  const [activeId, setActiveId] = useState<string | null>(activeCartModalId);
  const isActive = activeId === modalId;

  const bumpCartTrigger = useCallback(() => {
    const trigger = cartButtonRef.current;
    if (!trigger) {
      return;
    }

    trigger.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.95)", offset: 0.35 },
        { transform: "scale(1.08)", offset: 0.65 },
        { transform: "scale(1)" },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(.34,1.56,.64,1)",
      },
    );

    const cartIcon = trigger.querySelector<HTMLElement>(
      "[data-cart-icon='true']",
    );
    cartIcon?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-10deg)", offset: 0.3 },
        { transform: "rotate(6deg)", offset: 0.62 },
        { transform: "rotate(0deg)" },
      ],
      {
        duration: 420,
        easing: "cubic-bezier(.34,1.56,.64,1)",
      },
    );

    const cartBadge = trigger.querySelector<HTMLElement>(
      "[data-cart-badge='true']",
    );
    cartBadge?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.28)", offset: 0.5 },
        { transform: "scale(1)" },
      ],
      {
        duration: 360,
        easing: "cubic-bezier(.34,1.56,.64,1)",
      },
    );
  }, []);

  useEffect(() => {
    const listener = (id: string | null) => setActiveId(id);
    activeCartModalListeners.add(listener);
    return () => {
      activeCartModalListeners.delete(listener);
      if (activeCartModalId === modalId) {
        setActiveCartModalId(null);
      }
    };
  }, [modalId]);

  useEffect(() => {
    const updateTriggerVisibility = () => {
      const el = cartButtonRef.current;
      if (!el) {
        setIsTriggerVisible(false);
        return;
      }
      const styles = window.getComputedStyle(el);
      const isVisible =
        styles.display !== "none" &&
        styles.visibility !== "hidden" &&
        el.getClientRects().length > 0;
      setIsTriggerVisible(isVisible);
    };

    updateTriggerVisibility();
    window.addEventListener("resize", updateTriggerVisibility);
    return () => window.removeEventListener("resize", updateTriggerVisibility);
  }, []);

  useEffect(() => {
    if (activeId === null && isTriggerVisible) {
      setActiveCartModalId(modalId);
    }
  }, [activeId, isTriggerVisible, modalId]);

  const activateModal = () => {
    // Keep local state in sync so the first click can open immediately.
    setActiveId(modalId);
    setActiveCartModalId(modalId);
  };

  const openCart = () => {
    if (!COMMERCE_ENABLED) {
      toast.info(COMMERCE_DISABLED_MESSAGE);
      return;
    }
    if (!isActive) {
      activateModal();
    }
    setIsOpen(true);
  };
  const closeCart = () => {
    if (isActive) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    // El carrito nativo se crea al agregar el primer producto (addItem) o al
    // guardar datos en el checkout: pre-crearlo aquí escribiría una fila por
    // cada visita, bots incluidos.
    if (!COMMERCE_ENABLED || COMMERCE_PROVIDER === "native") {
      return;
    }
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  useEffect(() => {
    const handleIconBump = () => {
      const el = cartButtonRef.current;
      if (!el) {
        return;
      }

      const styles = window.getComputedStyle(el);
      const isVisible =
        styles.display !== "none" &&
        styles.visibility !== "hidden" &&
        el.getClientRects().length > 0;

      if (!isVisible) {
        return;
      }

      bumpCartTrigger();
    };

    window.addEventListener(CART_ICON_BUMP_EVENT, handleIconBump);
    return () =>
      window.removeEventListener(CART_ICON_BUMP_EVENT, handleIconBump);
  }, [bumpCartTrigger]);

  useEffect(() => {
    if (!isActive && isOpen) {
      setIsOpen(false);
    }
  }, [isActive, isOpen]);

  useEffect(() => {
    if (!isTriggerVisible) {
      return;
    }

    const cartParam = searchParams.get("cart");
    if (!cartParam) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("cart");
    const nextQuery = nextParams.toString();

    let isCancelled = false;

    const syncCartFromUrl = async () => {
      const result = await setCartIdFromParam(cartParam);

      if (isCancelled) {
        return;
      }

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });

      if (result.ok) {
        router.refresh();
      }
    };

    void syncCartFromUrl();

    return () => {
      isCancelled = true;
    };
  }, [isTriggerVisible, pathname, router, searchParams]);

  useEffect(() => {
    if (!isTriggerVisible) {
      return;
    }

    const hasCartParam = !!searchParams.get("cart");
    if (hasCartParam) {
      return;
    }

    const shouldOpenAppointment =
      searchParams.get("agendar") === "1" ||
      searchParams.get("agendar") === "true";

    if (!shouldOpenAppointment) {
      return;
    }

    if (!isActive) {
      activateModal();
    }
    setIsOpen(true);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("agendar");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [isActive, isTriggerVisible, pathname, router, searchParams]);

  // Regreso de Stripe con el pago cancelado: se abre el carrito tal cual.
  useEffect(() => {
    if (!isTriggerVisible) {
      return;
    }
    if (searchParams.get("pago") !== "cancelado") {
      return;
    }

    if (!isActive) {
      activateModal();
    }
    setIsOpen(true);
    toast.info("Tu carrito sigue aquí.");

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("pago");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [isActive, isTriggerVisible, pathname, router, searchParams]);

  return (
    <>
      <button
        ref={cartButtonRef}
        data-cart-trigger="true"
        aria-label="Abrir carrito"
        onClick={openCart}
      >
        <OpenCart quantity={cart?.totalQuantity} isWhite={isWhite} />
      </button>
      <Transition show={isOpen && isActive}>
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
            <Dialog.Panel
              className="fixed bottom-0 right-0 top-0 z-[220] flex h-full w-full flex-col bg-[#0F0F10] text-white md:w-[460px]"
              style={{ fontFamily: "var(--font-geist-sans, system-ui)" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <LogoSquare variant="white" />
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#FFC600] hover:text-[#FFC600]"
                  onClick={closeCart}
                  aria-label="Cerrar carrito"
                >
                  <XMarkIcon className="h-5" />
                </button>
              </div>

              {!cart || cart.lines.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
                  <ShoppingCartIcon className="h-14 text-white/30" />
                  <p className="mt-6 text-2xl font-bold">
                    Tu carrito está vacío.
                  </p>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-6">
                    <h2 className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FFC600]">
                      Tu pedido
                    </h2>
                    <ul className="m-0 mt-4 flex list-none flex-col p-0">
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
                          const productAny = (item?.merchandise?.product ??
                            {}) as any;
                          const amount =
                            item?.cost?.totalAmount?.amount ||
                            productAny?.priceRange?.minVariantPrice?.amount ||
                            "0";

                          return (
                            <li
                              key={i}
                              className="flex items-start gap-3 border-b border-white/10 py-4 first:pt-0"
                            >
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                                <Image
                                  className="h-full w-full object-contain"
                                  width={64}
                                  height={64}
                                  alt={
                                    item.merchandise?.product?.featuredImage
                                      ?.altText ||
                                    item.merchandise.product.title
                                  }
                                  src={
                                    item.merchandise?.product?.featuredImage
                                      ?.url
                                  }
                                />
                                <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFC600] px-1 text-[11px] font-bold text-black">
                                  {item.quantity}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={merchandiseUrl}
                                  onClick={closeCart}
                                  className="m-0 block text-[14px] leading-snug text-white transition-colors hover:text-[#FFC600]"
                                >
                                  {item.merchandise.product.title}
                                </Link>
                                <p className="m-0 text-[12px] text-white/40">
                                  Instalación o envío GRATIS
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                  <div className="flex h-8 items-center rounded-full border border-white/15">
                                    <EditItemQuantityButton
                                      item={item}
                                      type="minus"
                                      optimisticUpdate={updateCartItem}
                                    />
                                    <span className="w-6 text-center text-[13px]">
                                      {item.quantity}
                                    </span>
                                    <EditItemQuantityButton
                                      item={item}
                                      type="plus"
                                      optimisticUpdate={updateCartItem}
                                    />
                                  </div>
                                  <DeleteItemButton
                                    item={item}
                                    optimisticUpdate={updateCartItem}
                                  />
                                </div>
                              </div>
                              <span className="shrink-0 text-[14px] font-semibold text-white">
                                {formatMXN(Number(amount))}
                              </span>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                  <div className="border-t border-white/10 px-5 pb-6 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-white/55">
                        Total (IVA incluido)
                      </span>
                      <strong className="text-2xl text-[#FFC600]">
                        {formatMXN(Number(cart.cost.totalAmount.amount))}
                      </strong>
                    </div>
                    <div className="mt-4">
                      <CheckoutButton onClose={closeCart} />
                    </div>
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

function CheckoutButton({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleCheckout = async () => {
    if (pending) return;

    // Nativo: el checkout del sitio pide contacto, entrega y pago en /pago.
    if (COMMERCE_PROVIDER === "native") {
      onClose();
      router.push("/pago");
      return;
    }

    // Shopify (legado): se valida el stock y se va a su checkout.
    setPending(true);
    try {
      const result = await startCheckout();

      if (!result.ok) {
        if (result.error === "unavailable") {
          const details = result.unavailableItems
            .map((it) =>
              it.requested
                ? `${it.title}: solicitado ${it.requested}, disponible ${it.available}`
                : `${it.title}: disponible ${it.available}`,
            )
            .join("\n");
          toast.error(
            result.message ?? "Algunos productos no están disponibles",
            {
              description: details,
            },
          );
        } else if (result.error === "empty_cart") {
          toast.error("Tu carrito está vacío.");
        } else {
          toast.error(
            result.message ?? "No se pudo iniciar el pago. Inténtalo de nuevo.",
          );
        }
        setPending(false);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e) {
      console.error("[CheckoutButton] checkout failed", e);
      toast.error("No se pudo iniciar el pago. Inténtalo de nuevo.");
      setPending(false);
    }
  };

  return (
    <button
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC600] px-6 py-4 text-sm font-bold uppercase tracking-wider text-black transition-colors duration-200 hover:bg-[#FFD34A] disabled:cursor-not-allowed"
      type="button"
      onClick={handleCheckout}
      disabled={pending}
    >
      {pending ? <LoadingDots className="bg-black" /> : "Completar pago"}
    </button>
  );
}
