"use client";

import { Dialog, Listbox, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import LoadingDots from "components/loading-dots";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Fragment,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  createCartAndSetCookie,
  setCartAttributes,
  setCartIdFromParam,
  updateItemVariant,
  validateCartAvailability,
} from "./actions";
import BranchList from "./branch-list";
import BranchMap from "./branch-map";
import { CART_BRANCHES } from "./branches";
import { useCart } from "./cart-context";
import { DeleteItemButton } from "./delete-item-button";
import { EditItemQuantityButton } from "./edit-item-quantity-button";
import OpenCart from "./open-cart";
// Removed unused static ShippingType in favor of per-line selector
import type { CartItem, Product, ProductVariant } from "lib/shopify/types";

let activeCartModalId: string | null = null;
const activeCartModalListeners = new Set<(id: string | null) => void>();

const setActiveCartModalId = (nextId: string | null) => {
  activeCartModalId = nextId;
  activeCartModalListeners.forEach((listener) => listener(activeCartModalId));
};

function LineShippingSelector({
  item,
  optimisticUpdate,
}: {
  item: CartItem;
  optimisticUpdate: (
    lineId: string,
    variant: ProductVariant,
    product: Product
  ) => void;
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
      <h3 className="text-sm font-semibold mb-2 text-yellow-600">
        Seleccione el tipo de envío:
      </h3>
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
      <p aria-live="polite" className="sr-only" role="status">
        {message}
      </p>
    </div>
  );
}

type MerchandiseSearchParams = {
  [key: string]: string;
};

const PRE_CART_EVENT = "cart:item-added";

function PreCartWizard({
  open,
  step,
  phone,
  selectedBranchId,
  isSubmitting,
  onClose,
  onBack,
  onNext,
  onPhoneChange,
  onSelectBranch,
  onSubmit,
}: {
  open: boolean;
  step: 1 | 2;
  phone: string;
  selectedBranchId: string;
  isSubmitting: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onPhoneChange: (value: string) => void;
  onSelectBranch: (value: string) => void;
  onSubmit: () => void;
}) {
  const totalSteps = 2;
  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length === 10;
  const canSubmit = Boolean(selectedBranchId) && isPhoneValid && !isSubmitting;
  const mobileTargetHeight = step === 1 ? "70dvh" : "100dvh";
  const [mobilePanelHeight, setMobilePanelHeight] = useState("0dvh");
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasOpenedRef.current = false;
      setMobilePanelHeight("0dvh");
      return;
    }

    if (!hasOpenedRef.current) {
      hasOpenedRef.current = true;
      setMobilePanelHeight("0dvh");
      const rafId = window.requestAnimationFrame(() => {
        setMobilePanelHeight(mobileTargetHeight);
      });
      return () => window.cancelAnimationFrame(rafId);
    }

    setMobilePanelHeight(mobileTargetHeight);
  }, [open, mobileTargetHeight]);

  return (
    <Transition show={open}>
      <Dialog onClose={onClose} className="relative z-[260]">
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-out duration-250"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-all ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-[261] bg-black/75 backdrop-blur-sm" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transition-all ease-out duration-250"
          enterFrom="opacity-0 md:translate-y-3 md:scale-[0.98]"
          enterTo="opacity-100 md:translate-y-0 md:scale-100"
          leave="transition-all ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 scale-100"
          leaveTo="opacity-0 translate-y-full md:translate-y-3 md:scale-[0.98]"
        >
          <Dialog.Panel
            className={clsx(
              "fixed z-[262] flex w-full flex-col overflow-hidden bg-neutral-950 text-white h-[var(--wizard-mobile-height)]",
              step === 1
                ? "inset-x-0 bottom-0 rounded-t-[24px] border-t border-white/10"
                : "inset-x-0 bottom-0 rounded-none",
              "md:inset-x-4 md:top-1/2 md:bottom-auto md:mx-auto md:h-auto md:max-h-[92vh] md:w-[min(980px,calc(100%-2rem))] md:-translate-y-1/2 md:rounded-[24px] md:border md:border-white/10 md:shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
            )}
            style={{
              ["--wizard-mobile-height" as any]: mobilePanelHeight,
              transition:
                "height 420ms cubic-bezier(0.22,1,0.36,1), border-radius 280ms ease",
            }}
          >
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/10 px-4 py-3 md:grid-cols-[1fr_auto_1fr] md:gap-4 md:px-7 md:py-4">
              <div className="hidden md:flex">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-emerald-300">
                  AGREGADO AL CARRITO
                </span>
              </div>
              <div className="col-span-2 flex min-w-[180px] flex-col items-center gap-2 md:col-span-1 md:min-w-[220px]">
                <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400">
                  PASO {step} DE {totalSteps}
                </span>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar formulario"
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10 md:justify-self-end"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-4 py-5 md:px-9 md:py-7">
              {step === 1 ? (
                <div className="space-y-7">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="font-black leading-none text-yellow-400 text-5xl md:text-7xl">
                      01
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
                        Tu contacto
                      </p>
                      <h2 className="font-black uppercase tracking-[0.04em] text-xl leading-tight md:text-4xl">
                        ¿A qué número te confirmamos?
                      </h2>
                      <p className="max-w-2xl text-sm leading-relaxed text-neutral-300">
                        Te mandaremos la confirmación de tu orden y datos de
                        sucursal por WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="max-w-xl space-y-3">
                    <label
                      htmlFor="pre-cart-phone"
                      className="block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300"
                    >
                      Teléfono (10 dígitos)
                    </label>
                    <input
                      id="pre-cart-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => onPhoneChange(event.target.value)}
                      placeholder="312 123 4567"
                      className="w-full rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-4 text-lg font-semibold text-white outline-none transition placeholder:text-neutral-500 focus:border-yellow-400"
                    />
                    <p className="text-xs text-neutral-400">
                      Solo usamos este número para tu compra y seguimiento.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-7">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="font-black leading-none text-yellow-400 text-6xl md:text-7xl">
                      02
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
                        Tu sucursal
                      </p>
                      <h2 className="font-black uppercase tracking-[0.04em] text-xl leading-tight md:text-4xl">
                        ¿Dónde prefieres el servicio?
                      </h2>
                      <p className="max-w-2xl text-sm leading-relaxed text-neutral-300">
                        Elige la sucursal donde quieres atender tu instalación o
                        seguimiento.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 md:hidden">
                    <div className="h-[40dvh] overflow-hidden rounded-2xl border border-white/10">
                      <BranchMap
                        branches={CART_BRANCHES}
                        selectedId={selectedBranchId}
                        onSelect={onSelectBranch}
                        tall
                        minHeight={0}
                      />
                    </div>
                    <div className="h-[34dvh] rounded-2xl border border-white/10 bg-[#0f0f10]/95 p-2 backdrop-blur">
                      <BranchList
                        branches={CART_BRANCHES}
                        selectedId={selectedBranchId}
                        onSelect={onSelectBranch}
                        compact
                      />
                    </div>
                  </div>

                  <div className="hidden gap-4 md:grid md:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="overflow-hidden rounded-2xl border border-white/10">
                      <BranchMap
                        branches={CART_BRANCHES}
                        selectedId={selectedBranchId}
                        onSelect={onSelectBranch}
                        tall
                      />
                    </div>
                    <div className="h-[520px]">
                      <BranchList
                        branches={CART_BRANCHES}
                        selectedId={selectedBranchId}
                        onSelect={onSelectBranch}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 bg-neutral-950/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:px-7 md:py-4">
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-neutral-300 transition hover:border-white/40 hover:text-white"
              >
                {step === 1 ? "Cancelar" : "Atrás"}
              </button>

              {step === 1 ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!isPhoneValid}
                  className={clsx(
                    "rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.08em] transition",
                    isPhoneValid
                      ? "bg-yellow-400 text-black hover:bg-yellow-300"
                      : "cursor-not-allowed bg-white/10 text-neutral-500"
                  )}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className={clsx(
                    "rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.08em] transition",
                    canSubmit
                      ? "bg-yellow-400 text-black hover:bg-yellow-300"
                      : "cursor-not-allowed bg-white/10 text-neutral-500"
                  )}
                >
                  {isSubmitting ? "Guardando..." : "Continuar al carrito"}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}

export default function CartModal({ isWhite = false }) {
  const { cart, updateCartItem, updateCartItemVariant } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPreCartWizardOpen, setIsPreCartWizardOpen] = useState(false);
  const [preCartStep, setPreCartStep] = useState<1 | 2>(1);
  const [preCartPhone, setPreCartPhone] = useState("");
  const [isSavingPreCartData, setIsSavingPreCartData] = useState(false);
  const [isTriggerVisible, setIsTriggerVisible] = useState(false);
  const shouldOpenWizardAfterAddRef = useRef(false);
  const quantityRef = useRef(cart?.totalQuantity);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const modalId = useId();
  const [activeId, setActiveId] = useState<string | null>(activeCartModalId);
  const isActive = activeId === modalId;
  const selectedBranch = CART_BRANCHES.find(
    (branch) => branch.id === selectedBranchId
  );

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
    if (!isActive) {
      activateModal();
    }
    if (shouldOpenWizardAfterAddRef.current) {
      shouldOpenWizardAfterAddRef.current = false;
      setPreCartStep(1);
      setIsPreCartWizardOpen(true);
      return;
    }
    setIsPreCartWizardOpen(false);
    setIsOpen(true);
  };
  const closeCart = () => {
    if (isActive) {
      setIsOpen(false);
    }
  };
  const closePreCartWizard = () => {
    setIsPreCartWizardOpen(false);
    setPreCartStep(1);
    shouldOpenWizardAfterAddRef.current = false;
  };
  const handleWizardBack = () => {
    if (preCartStep === 1) {
      closePreCartWizard();
      return;
    }
    setPreCartStep(1);
  };
  const handleWizardNext = () => {
    const digits = preCartPhone.replace(/\D/g, "");
    if (digits.length === 10) {
      setPreCartStep(2);
    }
  };
  const handleWizardSubmit = async () => {
    const selectedBranch = CART_BRANCHES.find(
      (branch) => branch.id === selectedBranchId
    );
    const normalizedPhone = preCartPhone.replace(/\D/g, "");
    if (!selectedBranch || normalizedPhone.length !== 10 || isSavingPreCartData) {
      return;
    }

    setIsSavingPreCartData(true);
    try {
      await setCartAttributes({
        sucursal: selectedBranch.name,
        phone: normalizedPhone,
      });
      setIsPreCartWizardOpen(false);
      setPreCartStep(1);
      setIsOpen(true);
    } catch (error) {
      console.error("[cart][wizard] Failed to save cart attributes", error);
      toast.error("No se pudieron guardar tus datos. Inténtalo de nuevo.");
    } finally {
      setIsSavingPreCartData(false);
    }
  };

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  useEffect(() => {
    const handleItemAdded = () => {
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
      shouldOpenWizardAfterAddRef.current = true;
      if (!isActive) {
        setActiveId(modalId);
        setActiveCartModalId(modalId);
      }
      setIsOpen(false);
      setPreCartStep(1);
      setIsPreCartWizardOpen(true);
      shouldOpenWizardAfterAddRef.current = false;
    };

    window.addEventListener(PRE_CART_EVENT, handleItemAdded);
    return () => window.removeEventListener(PRE_CART_EVENT, handleItemAdded);
  }, [isActive, modalId]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    if (
      cart?.totalQuantity &&
      cart?.totalQuantity !== quantityRef.current &&
      cart?.totalQuantity > 0
    ) {
      quantityRef.current = cart?.totalQuantity;

      if (isOpen || isPreCartWizardOpen) {
        return;
      }

      if (shouldOpenWizardAfterAddRef.current) {
        shouldOpenWizardAfterAddRef.current = false;
        setPreCartStep(1);
        setIsPreCartWizardOpen(true);
        return;
      }

      setIsOpen(true);
    }
  }, [isOpen, isPreCartWizardOpen, cart?.totalQuantity, quantityRef, isActive]);

  useEffect(() => {
    if (!isActive) {
      if (isOpen) {
        setIsOpen(false);
      }
      if (isPreCartWizardOpen) {
        setIsPreCartWizardOpen(false);
      }
    }
  }, [isActive, isOpen, isPreCartWizardOpen]);

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

  return (
    <>
      <button ref={cartButtonRef} aria-label="Abrir carrito" onClick={openCart}>
        <OpenCart quantity={cart?.totalQuantity} isWhite={isWhite} />
      </button>
      <PreCartWizard
        open={isPreCartWizardOpen && isActive}
        step={preCartStep}
        phone={preCartPhone}
        selectedBranchId={selectedBranchId}
        isSubmitting={isSavingPreCartData}
        onClose={closePreCartWizard}
        onBack={handleWizardBack}
        onNext={handleWizardNext}
        onPhoneChange={setPreCartPhone}
        onSelectBranch={setSelectedBranchId}
        onSubmit={handleWizardSubmit}
      />
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
                          b.merchandise.product.title
                        )
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
                          }
                        );

                        const merchandiseUrl = createUrl(
                          `/product/${item.merchandise.product.handle}`,
                          new URLSearchParams(merchandiseSearchParams)
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
                                      item.merchandise?.product?.featuredImage
                                        ?.altText ||
                                      item.merchandise.product.title
                                    }
                                    src={
                                      item.merchandise?.product?.featuredImage
                                        ?.url
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
                                  const productAny = (item?.merchandise
                                    ?.product ?? {}) as any;
                                  const fallbackAmount =
                                    productAny?.priceRange?.minVariantPrice
                                      ?.amount;
                                  const fallbackCurrency =
                                    productAny?.priceRange?.minVariantPrice
                                      ?.currencyCode;
                                  const amount =
                                    item?.cost?.totalAmount?.amount ||
                                    fallbackAmount ||
                                    "0";
                                  const currencyCode =
                                    item?.cost?.totalAmount?.currencyCode ||
                                    fallbackCurrency ||
                                    "MXN";
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
                            <LineShippingSelector
                              item={item}
                              optimisticUpdate={updateCartItemVariant}
                            />
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

                    <div className="mb-3 border-b border-neutral-200 pb-3 pt-1 dark:border-neutral-700">
                      <Listbox
                        value={selectedBranchId}
                        onChange={setSelectedBranchId}
                      >
                        <div className="relative w-full">
                          <Listbox.Button className="flex w-full items-center justify-between gap-3 rounded-sm border border-neutral-300 bg-white px-3 py-2 text-left text-xs text-neutral-700 hover:border-yellow-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white">
                            <span
                              className={clsx(
                                "truncate",
                                selectedBranch
                                  ? "text-neutral-700 dark:text-white"
                                  : "text-neutral-400"
                              )}
                            >
                              {selectedBranch
                                ? `${selectedBranch.name}${selectedBranch.address ? ` — ${selectedBranch.address}` : ""}`
                                : "Seleccionar sucursal"}
                            </span>
                            <ChevronUpDownIcon className="h-4 w-4 text-neutral-400" />
                          </Listbox.Button>
                          <Listbox.Options className="absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-auto rounded-sm border border-neutral-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:border-neutral-700 dark:bg-neutral-900">
                            {CART_BRANCHES.map((branch) => (
                              <Listbox.Option
                                key={branch.id}
                                value={branch.id}
                                className={({ active, selected }) =>
                                  clsx(
                                    "cursor-pointer px-3 py-2 text-xs transition",
                                    active
                                      ? "bg-yellow-400 text-black"
                                      : "text-neutral-700 dark:text-white",
                                    selected && "font-semibold"
                                  )
                                }
                              >
                                {branch.name}
                                {branch.address ? ` — ${branch.address}` : ""}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </div>
                      </Listbox>
                    </div>
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
                    <CheckoutButton />
                    {/* <ServiceModal
                      autoOpen={autoOpenService}
                      quoteIdFromQuery={quoteIdFromQuery}
                    ></ServiceModal> */}
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
          className
        )}
      />
    </div>
  );
}

function CheckoutButton() {
  const [pending, setPending] = useState(false);

  const handleCheckout = async () => {
    if (pending) return;
    setPending(true);
    try {
      const result = await validateCartAvailability();

      if (!result.ok) {
        if (result.error === "unavailable") {
          const details = result.unavailableItems
            .map(
              (it) =>
                `${it.title}: solicitado ${it.requested}, disponible ${it.available}`
            )
            .join("\n");
          toast.error("Algunos productos no están disponibles", {
            description: details,
          });
        } else if (result.error === "empty_cart") {
          toast.error("Tu carrito está vacío.");
        } else {
          toast.error(
            "No se pudo validar la disponibilidad del carrito. Inténtalo de nuevo."
          );
        }
        setPending(false);
        return;
      }

      window.location.href = result.checkoutUrl;
    } catch (e) {
      console.error("[CheckoutButton] validation failed", e);
      toast.error("Error al validar el carrito. Inténtalo de nuevo.");
      setPending(false);
    }
  };

  return (
    <button
      className="block w-full rounded-full bg-yellow-500 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100 disabled:cursor-not-allowed"
      type="button"
      onClick={handleCheckout}
      disabled={pending}
    >
      {pending ? <LoadingDots className="bg-white" /> : "Completar Pago"}
    </button>
  );
}
