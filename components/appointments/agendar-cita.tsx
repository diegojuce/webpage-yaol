"use client";
import { Listbox } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  fetchAvailableTimes,
  saveAndSchedule,
  type Branch,
  type Service
} from "lib/api/appointments";
import { ProductVariant } from "lib/shopify/types";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { addItem, redirectToCheckout, setCartAttributes } from "../cart/actions";
import { useCart } from "../cart/cart-context";

type CalendarDay = {
  key: string;
  label: number | "";
  iso: string | null;
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;
const CALENDAR_SLOTS = 42; // 6 semanas visibles
const ARRAY_KEYS = ["data", "dates", "fechas", "items", "horarios"] as const;
const TIME_ZONE_CDMX = "America/Mexico_City";
const APPOINTMENT_STEPS = [
  { id: 1, title: "Elige el servicio" },
  { id: 2, title: "Selecciona la sucursal" },
  { id: 3, title: "Ingresa tus datos" },
  { id: 4, title: "Fecha y hora" },
] as const;

function extractQuoteId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const data = raw as Record<string, any>;
  const direct = data.quote_id ?? data.quoteId;
  if (direct) {
    return String(direct);
  }
  const quote =
    data.quote ?? data.data?.quote ?? data.result?.quote ?? data.response?.quote;
  const nested = quote?.quote_id ?? quote?.quoteId ?? quote?.id;
  return nested ? String(nested) : null;
}

// same hardcoded sucursales and services arrays as in AppointmentModal (copy as-is)
const sucursales: Branch[] = [
  {
    id: "1",
    name: "NHS",
    address: "Av Niños Héroes Esquina, Ignacio Torres #1050",
  },
  { id: "2", name: "TEC", address: "Av Tecnológico #7, La Frontera" },
  { id: "3", name: "BJZ", address: "Av. Benito Juárez #365, La Gloria" },
  { id: "4", name: "CON", address: "Av. Constitución #1837, Parque Royal" },
  { id: "5", name: "REY", address: "Av. Enrique Corona Morfin #422" },
  { id: "6", name: "MAN", address: "Boulevard Miguel de la Madrid #11386" },
];

const services: Service[] = [
  { id: "1", name: "MONTAJE", duration: 60 },
  { id: "6", name: "ALINEACION 3D 2 EJES", duration: 60 },
  {
    id: "2",
    name: "PAQUETE 1 (REVISION,ROTACION Y NITROGENO)",
    duration: 60,
  },
  {
    id: "3",
    name: "PAQUETE 2 (REVISION,ROTACION, NITROGENO Y BALANCEO)",
    duration: 60,
  },
  {
    id: "4",
    name: "PAQUETE 3 (REVISION,ROTACION, NITROGENO Y BALANCEO, ALINEACION)",
    duration: 60,
  },
  { id: "5", name: "FRENOS", duration: 120 },
];

function StepProgress({ currentStep }: { currentStep: number }) {
  const totalSteps = APPOINTMENT_STEPS.length;
  const progress =
    totalSteps > 1
      ? ((currentStep - 1) / (totalSteps - 1)) * 100
      : 0;

  return (
    <div className="mt-6 space-y-4">
      <div className="md:hidden">
        <div className="relative h-8">
          <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-neutral-800" />
          <div
            className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
          <div className="relative z-10 flex h-8 items-center justify-between">
            {APPOINTMENT_STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isDone = step.id < currentStep;
              return (
                <span
                  key={step.id}
                  className={clsx(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition",
                    isDone
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : isActive
                        ? "border-yellow-400 bg-neutral-900 text-yellow-300"
                        : "border-neutral-700 bg-neutral-900 text-neutral-500"
                  )}
                >
                  {step.id}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="hidden md:block">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {APPOINTMENT_STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isDone = step.id < currentStep;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <span
                  className={clsx(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition",
                    isDone
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : isActive
                        ? "border-yellow-400 text-yellow-300"
                        : "border-neutral-700 text-neutral-500"
                  )}
                >
                  {step.id}
                </span>
                <span
                  className={clsx(
                    "text-[10px] font-semibold uppercase tracking-[0.28em] transition",
                    isActive
                      ? "text-white"
                      : isDone
                        ? "text-yellow-300"
                        : "text-neutral-500"
                  )}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="relative mt-3 h-2 w-full rounded-full bg-neutral-800">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}


const instVarIDs = {
  tec: "gid://shopify/ProductVariant/45765059444935",
  bjz: "gid://shopify/ProductVariant/45765059477703",
  con: "gid://shopify/ProductVariant/45765059510471",
  nhs: "gid://shopify/ProductVariant/45765059543239",
  rey: "gid://shopify/ProductVariant/45765059576007",
  man: "gid://shopify/ProductVariant/45765059608775",
  tap: "gid://shopify/ProductVariant/45765059641543",
};

const instProdIDs = {
  tec: "gid://shopify/Product/8548552900807",
  bjz: "gid://shopify/Product/8548552933575",
  con: "gid://shopify/Product/8548552966343",
  nhs: "gid://shopify/Product/8548552999111",
  rey: "gid://shopify/Product/8548553031879",
  man: "gid://shopify/Product/8548553064647",
  tap: "gid://shopify/Product/8548553097415",
};

export function AppointmentEmbedded({ onClose }: { onClose: () => void }) {
  // replicate the same local state as in AppointmentModal:
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [datesLoading, setDatesLoading] = useState(false);
  const [datesError, setDatesError] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesError, setTimesError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [currentStep, setCurrentStep] = useState(1);
  const checkoutFormRef = useRef<HTMLFormElement>(null);
  const todayISO = useMemo(() => formatISODate(new Date()), []);
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );
  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  );
  const selectedBranch = sucursales.find(
    (branch) => branch.id === selectedBranchId
  );
  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );
  // const { addCartItem } = useCart();
  const { cart } = useCart();
  const [, formAction] = useActionState(addItem, null);

  // same useEffects for resetting (omit the isOpen guard), fetching availableTimes, etc.
  useEffect(() => {
    setSelectedBranchId("");
    setSelectedServiceId("");
    setSelectedDate("");
    setSelectedTime("");
    setAvailableDates([]);
    setAvailableTimes([]);
    setDatesError(null);
    setTimesError(null);
    setSubmitStatus("idle");
    setSubmitMessage(null);
    setCurrentMonth(startOfMonth(new Date()));
    setCurrentStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount
  useEffect(() => {
    if (!selectedBranchId || !selectedDate) {
      if (!selectedDate) {
        setAvailableTimes([]);
      }
      return;
    }
    setTimesLoading(true);
    setTimesError(null);
    fetchAvailableTimes(
      String(
        services.find((service) => service.id === selectedServiceId)
          ?.duration || 0
      ),
      String(
        sucursales.find((service) => service.id === selectedBranchId)?.name || 0
      ),
      selectedDate
    )
      .then((raw) => setAvailableTimes(normalizeAvailableTimes(raw)))
      .catch((error: unknown) =>
        setTimesError(
          error instanceof Error
            ? error.message
            : "Error al obtener horarios disponibles"
        )
      )
      .finally(() => setTimesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, selectedDate, selectedServiceId]);
  // same handlers: handleBranchChange, handleDateSelection, handleConfirm
  const handleBranchChange = (value: string) => {
    setSelectedBranchId(value);
    setAvailableDates([]);
    setAvailableTimes([]);
    setSelectedDate("");
    setSelectedTime("");
  };
  const handleDateSelection = (iso: string | null) => {
    if (!iso) return;
    setSelectedDate(iso);
    setSelectedTime("");
  };
  const handleConfirm = async () => {
    if (!selectedBranchId || !selectedDate || !selectedTime) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Selecciona una sucursal, una fecha y un horario disponibles antes de confirmar."
      );
      return;
    }
    if (!clientName.trim() || !phone.trim()) {
      setSubmitStatus("error");
      setSubmitMessage("Ingresa tu nombre y teléfono para continuar.");
      return;
    }
    setSubmitStatus("loading");
    setSubmitMessage("Confirmando cita...");
    const duration =
      services.find((s) => s.id === selectedServiceId)?.duration ?? 60;
    const sucursalName = sucursales.find(
      (b) => b.id === selectedBranchId
    )?.name;
    const sucursalCode = sucursalName ? sucursalName.toLowerCase() : "tec";
    const variantId = sucursalCode
      ? instVarIDs[
          (sucursalCode in instVarIDs
            ? sucursalCode
            : "") as keyof typeof instVarIDs
        ]
      : undefined;
    if (!variantId) {
      setSubmitStatus("error");
      setSubmitMessage(
        "No se pudo resolver el producto de instalación para la sucursal seleccionada."
      );
      return;
    }
    // const productGid =
    //   sucursalCode in instProdIDs
    //     ? instProdIDs[sucursalCode as keyof typeof instProdIDs]
    //     : undefined;
    // if (!productGid) {
    //   setSubmitStatus("error");
    //   setSubmitMessage(
    //     "No se pudo resolver el producto de instalación para la sucursal seleccionada."
    //   );
    //   return;
    // }
    // // const sucProduct = await backendFetch(`${sucursalCode}-inst-00`);
    // const product = await getRawProduct(productGid);
    // if (!product) {
    //   setSubmitStatus("error");
    //   setSubmitMessage(
    //     "No se pudo obtener el producto de instalación para la sucursal seleccionada."
    //   );
    //   return;
    // }

    const selectedVariantId =
      instVarIDs[sucursalCode as keyof typeof instVarIDs] || "1";
    const finalVariant: ProductVariant = {
      availableForSale: true,
      id: selectedVariantId,
      price: { amount: "0", currencyCode: "MXN" },
      quantityAvailable: 4,
      selectedOptions: [{ name: "Instalacion", value: sucursalCode }],
      // sku: `${sucursalCode}-inst-00`,
      title: `Instalación gratuita ${sucursalCode.toLocaleUpperCase()}`,
    };
    if (!finalVariant) {
      setSubmitStatus("error");
      setSubmitMessage(
        "No se pudo obtener la variante del producto de instalación."
      );
      return;
    }
    // product.variants = [finalVariant];
    // const quantity = 1;
    // const addItemPayload = {
    //   selectedVariantId,
    //   quantity,
    // };
    try {
      // Build save-and-schedule payload including cart items
      const startAt = buildStartAtInCdmx(selectedDate, selectedTime);
      const items = (cart?.lines ?? []).map((line) => {
        const quantity = line.quantity || 0;
        const total = Number(line.cost?.totalAmount?.amount || 0);
        const unit = quantity > 0 ? total / quantity : total;
        return {
          merchandise_id: line.merchandise?.id,
          product_id: line.merchandise?.product?.id,
          title: line.merchandise?.product?.title,
          variant_title: line.merchandise?.title,
          quantity,
          unit_price: unit,
          total_price: total,
          currency: line.cost?.totalAmount?.currencyCode,
          selected_options: (line.merchandise?.selectedOptions || []).map(
            (o) => ({ name: o.name, value: o.value })
          ),
        };
      });
      const response = await saveAndSchedule({
        client_name: clientName,
        phone,
        sucursal: sucursalName || "",
        additional_notes: notes || undefined,
        items,
        start_at: startAt,
        duration_minutes: duration,
      });
      const quoteId = extractQuoteId(response);
      if (quoteId || sucursalName) {
        try {
          await setCartAttributes({ quoteId, sucursal: sucursalName });
        } catch (error) {
          console.warn(
            "[appointments] Failed to sync cart attributes",
            error
          );
        }
      }
      startTransition(() => {
        setSubmitStatus("success");
        setSubmitMessage("¡Tu cita ha sido confirmada con éxito!");
        // Keep adding the installation product to cart as before
        // addCartItem(finalVariant, product, quantity);
        // formAction(addItemPayload);
      });
      // Redirect to checkout after successful confirmation
      checkoutFormRef.current?.requestSubmit();
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Error al crear la cita. Intenta de nuevo."
      );
    }
  };
  // same isConfirmDisabled calculation
  const isConfirmDisabled =
    !selectedBranchId ||
    !selectedDate ||
    !selectedTime ||
    !clientName.trim() ||
    !phone.trim() ||
    submitStatus === "loading";
  const canProceedFromStep1 = !services.length || Boolean(selectedServiceId);
  const canProceedFromStep2 = Boolean(selectedBranchId);
  const canProceedFromStep3 = Boolean(clientName.trim() && phone.trim());
  const canGoNext =
    (currentStep === 1 && canProceedFromStep1) ||
    (currentStep === 2 && canProceedFromStep2) ||
    (currentStep === 3 && canProceedFromStep3);
  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, APPOINTMENT_STEPS.length));
  };
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  return (
    <div className="relative w-full p-0 text-white">
      {/* paste the inner content that was inside Dialog.Panel of AppointmentModal, starting from the header row */}
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-white">
          Agendar cita
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/20 p-1 md:p-2 text-white transition hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="h-3 w-3 md:h-5 md:w-5" />
        </button>
      </div>
      <StepProgress currentStep={currentStep} />

      <div className="mt-8 space-y-6">
        <form
          ref={checkoutFormRef}
          action={redirectToCheckout}
          className="hidden"
          aria-hidden="true"
        >
          <button type="submit" tabIndex={-1} aria-hidden="true" />
        </form>
        {currentStep === 1 ? (
          <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
            <header className="mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Paso 1. Elige el servicio
              </h3>
              <p className="text-xs text-neutral-400">
                Selecciona el servicio para ajustar la duración de la cita.
              </p>
            </header>
            {servicesLoading ? (
              <p className="text-xs text-neutral-400">Cargando servicios...</p>
            ) : null}
            {servicesError ? (
              <p className="text-xs text-red-400">{servicesError}</p>
            ) : null}
            {services.length ? (
              <div className="space-y-3">
                <Listbox value={selectedServiceId} onChange={setSelectedServiceId}>
                  <div className="relative">
                    <Listbox.Button className="flex w-full items-center justify-between gap-3 rounded-sm border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-left text-sm text-white hover:border-yellow-400 focus:outline-none">
                      <span
                        className={clsx(
                          "truncate",
                          selectedService
                            ? "text-white"
                            : "text-neutral-400"
                        )}
                      >
                        {selectedService
                          ? `${selectedService.name} · ${selectedService.duration} min`
                          : "Selecciona un servicio"}
                      </span>
                      <ChevronUpDownIcon className="h-4 w-4 text-neutral-400" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute left-0 top-full z-30 max-h-64 w-full overflow-auto rounded-b-sm rounded-t-none border border-neutral-700 border-t-0 bg-neutral-900/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                      {services.map((service) => (
                        <Listbox.Option
                          key={service.id}
                          value={service.id}
                          className={({ active, selected }) =>
                            clsx(
                              "cursor-pointer px-4 py-2 text-sm transition",
                              active
                                ? "bg-yellow-400 text-black"
                                : "text-white",
                              selected && "font-semibold"
                            )
                          }
                        >
                          {service.name} · {service.duration} min
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
                <p className="text-xs text-neutral-400">
                  El servicio seleccionado puede ajustar la disponibilidad de
                  horarios.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                No hay servicios disponibles en este momento.
              </p>
            )}
          </section>
        ) : null}

        {currentStep === 2 ? (
          <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
            <header className="mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Paso 2. Selecciona la sucursal
              </h3>
            </header>
            <div className="space-y-3">
              <Listbox value={selectedBranchId} onChange={handleBranchChange}>
                <div className="relative">
                  <Listbox.Button className="flex w-full items-center justify-between gap-3 rounded-sm border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-left text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-yellow-400 focus:outline-none">
                    <span
                      className={clsx(
                        "truncate",
                        selectedBranch
                          ? "text-white"
                          : "text-neutral-400"
                      )}
                    >
                      {selectedBranch
                        ? `${selectedBranch.name}${selectedBranch.address ? ` — ${selectedBranch.address}` : ""}`
                        : "Selecciona una sucursal"}
                    </span>
                    <ChevronUpDownIcon className="h-4 w-4 text-neutral-400" />
                  </Listbox.Button>
                  <Listbox.Options className="absolute left-0 top-full z-30 max-h-64 w-full overflow-auto rounded-b-sm rounded-t-none border border-neutral-700 border-t-0 bg-neutral-900/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                    {sucursales.map((branch) => (
                      <Listbox.Option
                        key={branch.id}
                        value={branch.id}
                        className={({ active, selected }) =>
                          clsx(
                            "cursor-pointer px-4 py-2 text-sm transition",
                            active
                              ? "bg-yellow-400 text-black"
                              : "text-white",
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
              {branchesLoading ? (
                <p className="text-xs text-neutral-400">
                  Cargando sucursales...
                </p>
              ) : null}
              {branchesError ? (
                <p className="text-xs text-red-400">{branchesError}</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {currentStep === 3 ? (
          <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
            <header className="mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                Paso 3. Ingresa tus datos
              </h3>
              <p className="text-xs text-neutral-400">
                Usaremos esta información para confirmar la cita.
              </p>
            </header>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-sm border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-yellow-400 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-sm border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-yellow-400 focus:outline-none"
              />
              <textarea
                placeholder="Notas adicionales (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-sm border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-yellow-400 focus:outline-none"
              />
            </div>
          </section>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-neutral-800/80 bg-neutral-900/70 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                      Paso 4. Selecciona fecha
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Los días disponibles se muestran en amarillo.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                      className="rounded-full border border-neutral-700 p-1 text-neutral-300 transition hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                      aria-label="Mes anterior"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="rounded-full border border-neutral-700 p-1 text-neutral-300 transition hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                      aria-label="Mes siguiente"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold capitalize text-white">
                  {formatMonthLabel(currentMonth)}
                </p>
                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-neutral-400">
                  {WEEK_DAYS.map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-sm">
                  {calendarDays.map((day) => {
                    if (!day.iso) {
                      return <span key={day.key} className="h-10" />;
                    }
                    const isPast = day.iso < todayISO;
                    const isDisabled = !selectedBranchId || isPast || datesLoading;
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => handleDateSelection(day.iso)}
                        disabled={isDisabled}
                        className={clsx(
                          "flex h-10 items-center justify-center  text-sm transition",
                          isSelected
                            ? "border-yellow-400 bg-yellow-400 text-black "
                            : isDisabled
                              ? "border-neutral-800 text-neutral-600"
                              : "border-yellow-500/60 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-400/20",
                          datesLoading && "opacity-60"
                        )}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {datesLoading ? (
                  <p className="mt-3 text-xs text-neutral-400">
                    Cargando fechas disponibles...
                  </p>
                ) : null}
                {datesError ? (
                  <p className="mt-3 text-xs text-red-400">{datesError}</p>
                ) : null}
              </section>
              <section className="rounded-xl border border-neutral-800/80 bg-neutral-900/70 p-5">
                <header className="mb-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                    Paso 4. Selecciona horario
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Solo verás horarios disponibles para la fecha elegida.
                  </p>
                </header>
                {timesLoading ? (
                  <p className="text-xs text-neutral-400">
                    Cargando horarios disponibles...
                  </p>
                ) : null}
                {timesError ? (
                  <p className="text-xs text-red-400">{timesError}</p>
                ) : null}
                {!timesLoading && !availableTimes.length && selectedDate ? (
                  <p className="text-xs text-neutral-400">
                    No hay horarios disponibles para esta fecha. Prueba con otra
                    combinación.
                  </p>
                ) : null}
                <div className="mt-4">
                  <Listbox
                    value={selectedTime}
                    onChange={(value) => {
                      setSelectedTime(value);
                      setSubmitStatus("idle");
                    }}
                    disabled={timesLoading || !availableTimes.length}
                  >
                    <div className="relative">
                      <Listbox.Button
                        className={clsx(
                          "flex w-full items-center justify-between gap-3 rounded-sm border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-left text-sm text-white focus:outline-none",
                          timesLoading || !availableTimes.length
                            ? "cursor-not-allowed opacity-60"
                            : "hover:border-yellow-400"
                        )}
                      >
                        <span
                          className={clsx(
                            "truncate",
                            selectedTime ? "text-white" : "text-neutral-400"
                          )}
                        >
                          {selectedTime
                            ? formatTimeLabel(selectedTime)
                            : "Selecciona un horario"}
                        </span>
                        <ChevronUpDownIcon className="h-4 w-4 text-neutral-400" />
                      </Listbox.Button>
                      <Listbox.Options className="absolute left-0 top-full z-30 max-h-64 w-full overflow-auto rounded-b-sm rounded-t-none border border-neutral-700 border-t-0 bg-neutral-900/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                        {availableTimes.map((time) => (
                          <Listbox.Option
                            key={time}
                            value={time}
                            className={({ active }) =>
                              clsx(
                                "cursor-pointer px-4 py-2 text-sm text-white",
                                active ? "bg-yellow-500/20 text-yellow-200" : ""
                              )
                            }
                          >
                            {formatTimeLabel(time)}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </section>
            </div>
            {/* <section className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs text-neutral-200">
              <p className="font-semibold uppercase tracking-[0.25em] text-yellow-300">
                Requisitos
              </p>
              <ul className="mt-2 space-y-1">
                <li>Selecciona sucursal, fecha y horario disponibles.</li>
                <li>Confirma tu cita y guarda el número de confirmación.</li>
                <li>
                  Presenta tu cita en la sucursal elegida el día y hora
                  seleccionados.
                </li>
              </ul>
            </section> */}
            {submitMessage ? (
              <div
                className={clsx(
                  "rounded-2xl border px-4 py-3 text-sm",
                  submitStatus === "success"
                    ? "border-green-500/60 bg-green-500/10 text-green-200"
                    : submitStatus === "error"
                      ? "border-red-500/60 bg-red-500/10 text-red-200"
                      : "border-yellow-500/60 bg-yellow-500/10 text-yellow-200"
                )}
              >
                {submitMessage}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-row gap-3  sm:items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={clsx(
              "rounded-sm border px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
              currentStep === 1
                ? "cursor-not-allowed border-neutral-800 text-neutral-600"
                : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:text-white"
            )}
          >
            Regresar
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-neutral-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-neutral-500 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Salir
            </button> */}
            {currentStep < APPOINTMENT_STEPS.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canGoNext}
                className={clsx(
                  "rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-black transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                  canGoNext
                    ? "bg-yellow-500  hover:translate-y-[-2px]"
                    : "cursor-not-allowed bg-yellow-500/50 text-black/60"
                )}
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                className={clsx(
                  "rounded-lg px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-black transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                  isConfirmDisabled
                    ? "cursor-not-allowed bg-yellow-500/50 text-black/60"
                    : "bg-yellow-500  hover:translate-y-[-2px]"
                )}
              >
                {submitStatus === "loading"
                  ? "Confirmando..."
                  : "Checkout"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function buildCalendarDays(currentMonth: Date): CalendarDay[] {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const leadingSlots = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalSlots = Math.max(CALENDAR_SLOTS, leadingSlots + daysInMonth);
  const days: CalendarDay[] = [];

  for (let slot = 0; slot < totalSlots; slot += 1) {
    const dayNumber = slot - leadingSlots + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      days.push({ key: `empty-${slot}`, label: "", iso: null });
    } else {
      const date = new Date(year, month, dayNumber);
      const iso = formatISODate(date);
      days.push({
        key: `day-${iso}`,
        label: dayNumber,
        iso,
      });
    }
  }

  return days;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, modifier: number) {
  return new Date(date.getFullYear(), date.getMonth() + modifier, 1);
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeBranches(data: unknown): Branch[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = typeof item.id === "string" ? item.id : null;
      if (!id) {
        return null;
      }

      const name =
        typeof item.name === "string"
          ? item.name
          : typeof item.nombre === "string"
            ? item.nombre
            : null;

      if (!name) {
        return null;
      }

      const address =
        typeof item.address === "string"
          ? item.address
          : typeof item.direccion === "string"
            ? item.direccion
            : undefined;

      return { id, name, address };
    })
    .filter(Boolean) as Branch[];
}

function normalizeServices(data: unknown): Service[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = typeof item.id === "string" ? item.id : null;
      const name =
        typeof item.name === "string"
          ? item.name
          : typeof item.nombre === "string"
            ? item.nombre
            : null;
      const duration =
        typeof item.duration === "number"
          ? item.duration
          : typeof item.duracionMinutos === "number"
            ? item.duracionMinutos
            : null;

      if (!id || !name || duration === null) {
        return null;
      }

      return {
        id,
        name,
        duration: duration,
      };
    })
    .filter(Boolean) as Service[];
}

function normalizeStringArray(data: unknown): string[] {
  console.log("Raw data for normalization:", data);
  // Disponibilidad del día: [
  //   {
  //     start: '2025-10-30T09:00:00.000Z',
  //     end: '2025-10-30T10:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T09:30:00.000Z',
  //     end: '2025-10-30T10:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T10:00:00.000Z',
  //     end: '2025-10-30T11:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T10:30:00.000Z',
  //     end: '2025-10-30T11:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T11:00:00.000Z',
  //     end: '2025-10-30T12:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T11:30:00.000Z',
  //     end: '2025-10-30T12:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T12:00:00.000Z',
  //     end: '2025-10-30T13:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T12:30:00.000Z',
  //     end: '2025-10-30T13:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T13:00:00.000Z',
  //     end: '2025-10-30T14:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T13:30:00.000Z',
  //     end: '2025-10-30T14:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T14:00:00.000Z',
  //     end: '2025-10-30T15:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T14:30:00.000Z',
  //     end: '2025-10-30T15:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T15:00:00.000Z',
  //     end: '2025-10-30T16:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T15:30:00.000Z',
  //     end: '2025-10-30T16:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T16:00:00.000Z',
  //     end: '2025-10-30T17:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T16:30:00.000Z',
  //     end: '2025-10-30T17:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T17:00:00.000Z',
  //     end: '2025-10-30T18:00:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T17:30:00.000Z',
  //     end: '2025-10-30T18:30:00.000Z'
  //   },
  //   {
  //     start: '2025-10-30T18:00:00.000Z',
  //     end: '2025-10-30T19:00:00.000Z'
  //   }
  // ]
  if (Array.isArray(data)) {
    return data.filter((item): item is string => typeof item === "string");
  }

  if (isRecord(data)) {
    for (const key of ARRAY_KEYS) {
      const value = data[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
      }
    }
  }

  return [];
}

function normalizeAvailableTimes(data: unknown): string[] {
  const rawArray = Array.isArray(data)
    ? data
    : isRecord(data)
      ? ARRAY_KEYS.flatMap((key) =>
          Array.isArray(data[key]) ? (data[key] as unknown[]) : []
        )
      : [];

  if (!rawArray.length) {
    return [];
  }

  return rawArray
    .map((item) => {
      if (typeof item === "string") {
        return toHHMMInZone(item) ?? item.trim();
      }
      if (isRecord(item)) {
        const start =
          (item.start as string | undefined) ??
          (item.start_at as string | undefined);
        return start ? toHHMMInZone(start) : null;
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

function toHHMMInZone(value: string): string | null {
  const trimmed = value.trim();
  const looksLikeISO =
    trimmed.includes("T") ||
    /Z$/i.test(trimmed) ||
    /[+-]\d{2}:?\d{2}$/.test(trimmed) ||
    /^\d{4}-\d{2}-\d{2}/.test(trimmed);

  if (looksLikeISO) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const formatter = new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIME_ZONE_CDMX,
      });
      return formatter.format(parsed);
    }
  }

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = Number(ampmMatch[1] ?? 0);
    const minutes = String(ampmMatch[2] ?? "00").padStart(2, "0");
    const meridiem = (ampmMatch[3] ?? "").toLowerCase();
    if (meridiem === "pm" && hours < 12) {
      hours += 12;
    }
    if (meridiem === "am" && hours === 12) {
      hours = 0;
    }
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const hhmmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (hhmmMatch) {
    const hh = hhmmMatch[1]?.padStart(2, "0") ?? "00";
    const mm = hhmmMatch[2] ?? "00";
    return `${hh}:${mm}`;
  }

  const parsedFallback = new Date(trimmed);
  if (Number.isNaN(parsedFallback.getTime())) {
    return null;
  }

  const fallbackFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE_CDMX,
  });
  return fallbackFormatter.format(parsedFallback);
}

function formatTimeLabel(time: string) {
  return time;
}

function buildStartAtInCdmx(date: string, timeLabel: string): string {
  const hhmm = extractHHMM(timeLabel);
  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day || !hhmm) {
    return `${date}T${hhmm}:00`;
  }

  const [hourStr, minuteStr] = hhmm.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return `${date}T${hhmm}:00`;
  }

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offset1 = getTimeZoneOffsetMinutes(TIME_ZONE_CDMX, utcGuess);
  let utcDate = new Date(utcGuess.getTime() - offset1 * 60000);
  const offset2 = getTimeZoneOffsetMinutes(TIME_ZONE_CDMX, utcDate);
  if (offset2 !== offset1) {
    utcDate = new Date(utcGuess.getTime() - offset2 * 60000);
  }
  const finalOffset = getTimeZoneOffsetMinutes(TIME_ZONE_CDMX, utcDate);
  const offsetLabel = formatOffsetMinutes(finalOffset);
  return `${date}T${hhmm}:00${offsetLabel}`;
}

function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const values = parts.reduce(
    (acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);
  const hour = Number(values.hour);
  const minute = Number(values.minute);
  const second = Number(values.second);
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    Number.isNaN(second)
  ) {
    return 0;
  }

  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return (asUtc - date.getTime()) / 60000;
}

function formatOffsetMinutes(offsetMinutes: number): string {
  const rounded = Math.round(offsetMinutes);
  const sign = rounded >= 0 ? "+" : "-";
  const abs = Math.abs(rounded);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

function extractHHMM(timeLabel: string): string {
  // Tries to find HH:mm in the label. Fallback to 00:00
  const match = timeLabel.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "00:00";
  const hh = (match[1] ?? "0").toString().padStart(2, "0");
  const mm = (match[2] ?? "0").toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
