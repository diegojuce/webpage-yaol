"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  PencilSquareIcon,
  ShoppingCartIcon,
  TruckIcon,
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
  useCallback,
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
    product: Product,
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
    <div className="mb-3 mx-4 mt-1">
      <h3 className="mb-2 text-sm font-semibold text-yellow-500">
        Seleccione el tipo de envío:
      </h3>
      <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
        <button
          type="button"
          onClick={() => void handleSelect(first.id)}
          aria-pressed={currentVariantId === first.id}
          className={clsx(
            "flex h-[88px] w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
            currentVariantId === first.id
              ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_14px_36px_rgba(255,211,74,0.18)]"
              : "border-white/10 bg-[#141416] text-white hover:border-white/20",
          )}
        >
          <span
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
              currentVariantId === first.id
                ? "bg-black/10 text-black"
                : "bg-white/5 text-yellow-300",
            )}
          >
            <BuildingStorefrontIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold">
              Instalar en Yantissimo
            </span>
            <span
              className={clsx(
                "mt-0.5 block text-[11px] font-semibold md:hidden",
                currentVariantId === first.id
                  ? "text-black/70"
                  : "text-neutral-400",
              )}
            >
              Montaje GRATIS · listo en 24h
            </span>
          </span>
          <span
            className={clsx(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              currentVariantId === first.id
                ? "border-black"
                : "border-white/25",
            )}
          >
            {currentVariantId === first.id ? (
              <span className="h-2.5 w-2.5 rounded-full bg-black" />
            ) : null}
          </span>
        </button>

        <button
          type="button"
          onClick={() => void handleSelect(second.id)}
          aria-pressed={currentVariantId === second.id}
          className={clsx(
            "flex h-[88px] w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
            currentVariantId === second.id
              ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_14px_36px_rgba(255,211,74,0.18)]"
              : "border-white/10 bg-[#141416] text-white hover:border-white/20",
          )}
        >
          <span
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
              currentVariantId === second.id
                ? "bg-black/10 text-black"
                : "bg-white/5 text-yellow-300",
            )}
          >
            <TruckIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold">
              Envío a domicilio
            </span>
            <span
              className={clsx(
                "mt-0.5 block text-[11px] font-semibold md:hidden",
                currentVariantId === second.id
                  ? "text-black/70"
                  : "text-neutral-400",
              )}
            >
              GRATIS · 2-4 días
            </span>
          </span>
          <span
            className={clsx(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
              currentVariantId === second.id
                ? "border-black"
                : "border-white/25",
            )}
          >
            {currentVariantId === second.id ? (
              <span className="h-2.5 w-2.5 rounded-full bg-black" />
            ) : null}
          </span>
        </button>
      </div>
      <div className="sr-only">
        <div role="radiogroup" aria-label="Tipo de envío">
          <input
            readOnly
            type="radio"
            name={`shippingType-${item.id}`}
            value={first.id}
            checked={currentVariantId === first.id}
          />
          <input
            readOnly
            type="radio"
            name={`shippingType-${item.id}`}
            value={second.id}
            checked={currentVariantId === second.id}
          />
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
const CART_ICON_BUMP_EVENT = "cart:icon-bump";

const normalizeBranchLabel = (value: string) => value.trim().toLowerCase();

const findBranchByName = (branchName: string) => {
  const normalizedBranchName = normalizeBranchLabel(branchName);
  if (!normalizedBranchName) {
    return undefined;
  }

  return CART_BRANCHES.find(
    (branch) => normalizeBranchLabel(branch.name) === normalizedBranchName,
  );
};

const formatPhoneForDisplay = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) {
    return phone;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};

const isPickupLabel = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return (
    normalized.includes("pickup") ||
    normalized.includes("recoger") ||
    normalized.includes("sucursal") ||
    normalized.includes("instalar")
  );
};

const isPickupCartLine = (item: CartItem) => {
  const title = item?.merchandise?.title ?? "";
  if (isPickupLabel(title)) {
    return true;
  }
  return item?.merchandise?.selectedOptions?.some((option) =>
    isPickupLabel(option.value),
  );
};

function BranchContactCard({
  branchName,
  branchAddress,
  branchDistance,
  phone,
  onEditBranch,
  onEditPhone,
}: {
  branchName: string;
  branchAddress?: string;
  branchDistance?: string;
  phone: string;
  onEditBranch: () => void;
  onEditPhone: () => void;
}) {
  return (
    <div className="mb-4 rounded-xl border border-yellow-500/35 bg-[#0f0f10] p-3 text-white">
      <div className="relative mb-3 h-20 overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(255,198,0,0.2),transparent_55%)]" />
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-400/60 bg-yellow-400/20">
          <span className="absolute left-1/2 top-1/2 block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-400" />
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-400/95">
            <MapPinIcon className="h-3 w-3" />
            Tu sucursal
          </p>
          <p className="truncate text-sm font-semibold">{branchName}</p>
          <p className="mt-0.5 text-[11px] text-neutral-400">
            {branchAddress || "Sucursal por confirmar"}
            {branchDistance ? ` · ${branchDistance}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onEditBranch}
          aria-label="Editar sucursal"
          className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          <PencilSquareIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/10 pt-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-yellow-400/15 text-yellow-400">
            <PhoneIcon className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-xs text-neutral-300">
            {phone ? formatPhoneForDisplay(phone) : "Teléfono pendiente"}
          </p>
        </div>
        <button
          type="button"
          onClick={onEditPhone}
          aria-label="Editar teléfono"
          className="rounded-full p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          <PencilSquareIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

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
              "md:inset-x-4 md:top-1/2 md:bottom-auto md:mx-auto md:h-auto md:max-h-[92vh] md:w-[min(980px,calc(100%-2rem))] md:-translate-y-1/2 md:rounded-[24px] md:border md:border-white/10 md:shadow-[0_40px_120px_rgba(0,0,0,0.65)]",
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
                      : "cursor-not-allowed bg-white/10 text-neutral-500",
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
                      : "cursor-not-allowed bg-white/10 text-neutral-500",
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
    (branch) => branch.id === selectedBranchId,
  );
  const cartAttributes = cart?.attributes ?? [];
  const phoneFromAttributes =
    cartAttributes
      .find((attribute) => attribute.key === "telefono")
      ?.value?.trim() ?? "";
  const branchNameFromAttributes =
    cartAttributes
      .find((attribute) => attribute.key === "sucursal")
      ?.value?.trim() ?? "";
  const branchFromAttributes = findBranchByName(branchNameFromAttributes);
  const branchIdFromAttributes = branchFromAttributes?.id ?? "";
  const branchForDisplay = selectedBranch ?? branchFromAttributes;
  const displayedPhone = preCartPhone || phoneFromAttributes;
  const displayedBranchName =
    branchForDisplay?.name || branchNameFromAttributes || "Pendiente";
  const shouldShowBranchContact = (cart?.lines ?? []).some(isPickupCartLine);

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
      (branch) => branch.id === selectedBranchId,
    );
    const normalizedPhone = preCartPhone.replace(/\D/g, "");
    if (
      !selectedBranch ||
      normalizedPhone.length !== 10 ||
      isSavingPreCartData
    ) {
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

  // Seed the wizard's local state from cart attributes ONLY once per session.
  // Without the refs, the effect would re-run whenever preCartPhone /
  // selectedBranchId change, so clearing the input would immediately re-write
  // it with the value stored in cart attributes.
  const seededPhoneRef = useRef(false);
  const seededBranchRef = useRef(false);

  useEffect(() => {
    if (seededPhoneRef.current) return;
    if (!phoneFromAttributes) return;
    setPreCartPhone(phoneFromAttributes);
    seededPhoneRef.current = true;
  }, [phoneFromAttributes]);

  useEffect(() => {
    if (seededBranchRef.current) return;
    if (!branchIdFromAttributes) return;
    setSelectedBranchId(branchIdFromAttributes);
    seededBranchRef.current = true;
  }, [branchIdFromAttributes]);

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
      bumpCartTrigger();
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
  }, [isActive, modalId, bumpCartTrigger]);

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

  const openWizardForEdit = (step: 1 | 2) => {
    if (!isActive) {
      activateModal();
    }

    const nextPhone = preCartPhone || phoneFromAttributes;
    const nextBranchId = selectedBranchId || branchIdFromAttributes;

    if (nextPhone) {
      setPreCartPhone(nextPhone);
    }
    if (nextBranchId) {
      setSelectedBranchId(nextBranchId);
    }

    const canStartOnStep2 = nextPhone.replace(/\D/g, "").length === 10;
    setPreCartStep(step === 2 && canStartOnStep2 ? 2 : 1);
    setIsOpen(false);
    setIsPreCartWizardOpen(true);
  };

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
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 z-[220] flex h-full w-full flex-col border-l border-neutral-200 bg-white/80 p-6 text-black backdrop-blur-xl md:w-[460px] dark:border-neutral-700 dark:bg-black/80 dark:text-white">
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
                  {shouldShowBranchContact ? (
                    <BranchContactCard
                      branchName={displayedBranchName}
                      branchAddress={branchForDisplay?.address}
                      branchDistance={branchForDisplay?.distance}
                      phone={displayedPhone}
                      onEditBranch={() => openWizardForEdit(2)}
                      onEditPhone={() => openWizardForEdit(1)}
                    />
                  ) : null}
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
          className,
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
                `${it.title}: solicitado ${it.requested}, disponible ${it.available}`,
            )
            .join("\n");
          toast.error("Algunos productos no están disponibles", {
            description: details,
          });
        } else if (result.error === "empty_cart") {
          toast.error("Tu carrito está vacío.");
        } else {
          toast.error(
            "No se pudo validar la disponibilidad del carrito. Inténtalo de nuevo.",
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
