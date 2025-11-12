"use client";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  createAppointment,
  fetchAvailableTimes,
  type Branch,
  type CreateAppointmentPayload,
  type Service,
} from "lib/api/appointments";
import {
  getRawProduct
} from "lib/shopify/noCacheGetProduct";
import { ProductVariant } from "lib/shopify/types";
import { Fragment, useEffect, useMemo, useState } from "react";
import { addItem } from "../cart/actions";
import { useCart } from "../cart/cart-context";

type AgendarCitaProps = {
  triggerClassName?: string;
  triggerLabel?: string;
};

type CalendarDay = {
  key: string;
  label: number | "";
  iso: string | null;
};

type SubmitStatus = "idle" | "loading" | "success" | "error";

const WEEK_DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;
const CALENDAR_SLOTS = 42; // 6 semanas visibles
const ARRAY_KEYS = ["data", "dates", "fechas", "items", "horarios"] as const;

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
  { id: "1", name: "FRENOS", duration: 120 },
  { id: "2", name: "FRENO CON SENSOR ELECTRICO", duration: 180 },
  { id: "3", name: "LIMPIEZA Y AJUSTE DE FRENOS", duration: 60 },
  {
    id: "4",
    name: "CAMBIO DE SENSOR ABS Y /O SENSOR DE BALATA",
    duration: 60,
  },
  { id: "5", name: "CAMBIO DE PISTON Y REPUESTO", duration: 60 },
  { id: "6", name: "M.O DE CAMBIO DE BOMBA DE FRENOS", duration: 120 },
  {
    id: "7",
    name: "M.O DE CAMBIO DE BOMBA DE FRENOS ESPECIAL",
    duration: 180,
  },
  { id: "8", name: "RECTIFICADO", duration: 0 },
  {
    id: "9",
    name: "M.O CAMBIO DE CHICOTE DE FRENO EXTERNO",
    duration: 120,
  },
  {
    id: "10",
    name: "SERVICIO DE PURGADO(INCLUYE LIQUIDO DE FRENOS)",
    duration: 60,
  },
  { id: "11", name: "SUSPENSION", duration: 0 },
  { id: "12", name: "BUJE CON SOPORTE", duration: 0 },
  { id: "13", name: "BUJE EJE TRASERO CON PURGADO", duration: 0 },
  { id: "14", name: "HORQUILLA", duration: 0 },
  { id: "15", name: "HORQUILLA CON BARRA", duration: 0 },
  { id: "16", name: "HORQUILLA CON PUENTE", duration: 0 },
  { id: "17", name: "CREMALLERA ", duration: 0 },
  {
    id: "18",
    name: "JUNTA HOMOCINETICA O CUBRE POLVO X LADO",
    duration: 180,
  },
  {
    id: "19",
    name: "JUNTA HOMOCINETICA O CUBRE POLVO X LADO 4X4",
    duration: 240,
  },
  { id: "20", name: "BALERO CARDAN O CRUCETA", duration: 120 },
  { id: "21", name: "BUJES DE MUELLE POR LADO", duration: 90 },
  { id: "22", name: "HULES DE BARRA PAR", duration: 60 },
  { id: "23", name: "HULES DE BARRA PAR CON PUENTE", duration: 120 },
  {
    id: "24",
    name: "CAMBIO AMORTIGUADORES MACHPERSHON",
    duration: 120,
  },
  {
    id: "25",
    name: "CAMBIO AMORTIGUADORES MACHPERSHON DE BASTAGO",
    duration: 120,
  },
  { id: "26", name: "CAMBIO AMORTIGUADORES NORMAL", duration: 60 },
  { id: "27", name: "DESARME DELANTERO O TRASERO", duration: 0 },
  { id: "28", name: "ALINEACION ESCANTILLON", duration: 30 },
  { id: "29", name: "ALINEACION ESCANTILLON CON CAIDA", duration: 60 },
  { id: "30", name: "ALINEACION 3D", duration: 30 },
  { id: "31", name: "ALINEACION 3D 2 EJES", duration: 60 },
  {
    id: "32",
    name: "ALINEACION 3D  CON CAIDA DE AMORTIGUADOR",
    duration: 30,
  },
  { id: "33", name: "UNIDADES DE MANO DE OBRA", duration: 0 },
  {
    id: "34",
    name: "AFINACION MAYOR (CARBUCLEAN,BOYA, AFLOJATODO) 4CILINDROS",
    duration: 120,
  },
  {
    id: "35",
    name: "AFINACION MAYOR (CARBUCLEAN,BOYA, AFLOJATODO) 6 U 8 CILINDROS",
    duration: 240,
  },
  {
    id: "36",
    name: "AFINACION MENOR (CAMBIO DE FILTROS Y ACEITE)",
    duration: 60,
  },
  { id: "37", name: "CAMBIO DE ACEITE MOTOR", duration: 60 },
  {
    id: "38",
    name: "CAMBIO DE ACIETE MOTOR CON TOLVA O SKIDPLATE",
    duration: 90,
  },
  {
    id: "39",
    name: "CAMBIO DE ACEITE TRANSMISION ESTANDAR",
    duration: 90,
  },
  { id: "40", name: "CAMBIO DE ACEITE DIFERENCIAL", duration: 90 },
  { id: "41", name: "MANO DE OBRA ANTICONGELANTE", duration: 0 },
  { id: "42", name: "SOPORTES MOTOR", duration: 0 },
  { id: "43", name: "BALERO DOBLE, MAZA BALERO", duration: 120 },
  { id: "44", name: "CAMBIO EMPAQUE PUNTERIAS", duration: 0 },
  { id: "45", name: "CAMBIO DE BOMBA DE AGUA", duration: 0 },
  { id: "46", name: "CAMBIIO BANDAS DE ACCESORIOS", duration: 90 },
  { id: "47", name: "CAMBIO DE POLEAS O TENSOR", duration: 90 },
  { id: "48", name: "TRABAJOS ESPECIALES ES POR HORA", duration: 0 },
  {
    id: "49",
    name: "MONTAJE, BALANCEO, VALVULA Y NITROGENO (13-18) PASAJERO",
    duration: 60,
  },
  {
    id: "50",
    name: "MONTAJE, BALANCEO, VALVULA Y NITROGENO (19-22) PASAJERO",
    duration: 90,
  },
  {
    id: "51",
    name: "MONTAJE, BALANCEO, VALVULA Y NITROGENO PERFIL BAJO",
    duration: 0,
  },
  {
    id: "52",
    name: "MONTAJE, BALANCEO, VALVULA Y NITROGENO AT ",
    duration: 120,
  },
  {
    id: "53",
    name: "MONTAJE, BALANCEO, VALVULA Y NITROGENO MUD",
    duration: 120,
  },
  { id: "54", name: "BALANCEO RIN ACERO ", duration: 0 },
  { id: "55", name: "BALANCEO RIN OFF ROAD", duration: 0 },
  { id: "56", name: "BALANCEO RIN DEPORTIVO", duration: 0 },
  { id: "57", name: "ROTACION", duration: 0 },
  { id: "58", name: "REVISION DE VEHICULO", duration: 0 },
  { id: "59", name: "NITROGENO X LLANTA", duration: 0 },
  { id: "60", name: "PARCHE NORMAL", duration: 0 },
  {
    id: "61",
    name: "CAMBIO DE BIRLO POR RUEDA SIN DESARMAR",
    duration: 0,
  },
  {
    id: "62",
    name: "CAMBIO DE BIRLO POR RUEDA DESARMANDO",
    duration: 0,
  },
  {
    id: "63",
    name: "PAQUETE 1 (REVISION,ROTACION Y NITROGENO)",
    duration: 0,
  },
  {
    id: "64",
    name: "PAQUETE 2 (REVISION,ROTACION, NITROGENO Y BALANCEO)",
    duration: 0,
  },
  {
    id: "65",
    name: "PAQUETE 3 (REVISION,ROTACION, NITROGENO Y BALANCEO, ALINEACION)",
    duration: 0,
  },
  { id: "66", name: "BALATA DELATNERA", duration: 180 },
  { id: "67", name: "BALATA TRASERA", duration: 180 },
];

export function AgendarCita({
  triggerClassName,
  triggerLabel = "AGENDAR CITA",
}: AgendarCitaProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={clsx(
          "uppercase tracking-[0.25em]",
          "transition-transform duration-150 ease-out",
          triggerClassName
        )}
      >
        {triggerLabel}
      </button>
      <AppointmentModal isOpen={isOpen} onClose={close} />
    </>
  );
}

function AppointmentModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
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

  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );

  const todayISO = useMemo(() => formatISODate(new Date()), []);
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );
  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );

  // Reset form state when the modal closes.
  useEffect(() => {
    if (!isOpen) {
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
    }
  }, [isOpen]);

  // Load sucursales when modal opens.
  // useEffect(() => {
  //   if (!isOpen || branchesLoading || sucursales.length) {
  //     return;
  //   }
  //   setBranchesLoading(true);
  //   setBranchesError(null);
  //   fetchBranches()
  //     .then((raw) => setBranches(normalizeBranches(raw)))
  //     .catch((error: unknown) =>
  //       setBranchesError(
  //         error instanceof Error
  //           ? error.message
  //           : "Error al obtener sucursales",
  //       ),
  //     )
  //     .finally(() => setBranchesLoading(false));
  // }, [isOpen, sucursales.length, branchesLoading]);

  // Load services once when needed.
  // useEffect(() => {
  //   if (!isOpen || servicesLoading || services.length) {
  //     return;
  //   }
  //   setServicesLoading(true);
  //   setServicesError(null);
  //   fetchServices()
  //     .then((raw) => setServices(normalizeServices(raw)))
  //     .catch((error: unknown) =>
  //       setServicesError(
  //         error instanceof Error ? error.message : "Error al obtener servicios",
  //       ),
  //     )
  //     .finally(() => setServicesLoading(false));
  // }, [isOpen, services.length, servicesLoading]);

  // Fetch availability dates when branch changes.
  // useEffect(() => {
  //   if (!isOpen || !selectedBranchId) {
  //     return;
  //   }
  //   setDatesLoading(true);
  //   setDatesError(null);
  //   fetchAvailableDates(selectedBranchId)
  //     .then((raw) => setAvailableDates(normalizeStringArray(raw)))
  //     .catch((error: unknown) =>
  //       setDatesError(
  //         error instanceof Error
  //           ? error.message
  //           : "Error al obtener fechas disponibles"
  //       )
  //     )
  //     .finally(() => setDatesLoading(false));
  // }, [isOpen, selectedBranchId]);

  // Fetch availability times when date or service changes.
  useEffect(() => {
    if (!isOpen || !selectedBranchId || !selectedDate) {
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
      .then((raw) => setAvailableTimes(normalizeStringArray(raw)))
      .catch((error: unknown) =>
        setTimesError(
          error instanceof Error
            ? error.message
            : "Error al obtener horarios disponibles"
        )
      )
      .finally(() => setTimesLoading(false));
  }, [isOpen, selectedBranchId, selectedDate, selectedServiceId]);

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

    setSubmitStatus("loading");
    setSubmitMessage("Confirmando cita...");

    const payload: CreateAppointmentPayload = {
      branchId: selectedBranchId,
      date: selectedDate,
      time: selectedTime,
    };

    if (selectedServiceId) {
      payload.serviceId = selectedServiceId;
    }

    try {
      await createAppointment(payload);
      setSubmitStatus("success");
      setSubmitMessage("¡Tu cita ha sido confirmada con éxito!");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Error al crear la cita. Intenta de nuevo."
      );
    }
  };

  const isConfirmDisabled =
    !selectedBranchId ||
    !selectedDate ||
    !selectedTime ||
    submitStatus === "loading";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0">
            <Transition.Child
              as={Fragment}
              enter="transition-all duration-200 ease-out"
              enterFrom="opacity-0 scale-95 translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="transition-all duration-200 ease-in"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-2"
            >
              <Dialog.Panel className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-neutral-800/70 bg-neutral-950/90 p-6 pt-20 text-white shadow-[0_30px_120px_rgba(8,8,8,0.8)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <Dialog.Title className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] text-white">
                    Agendar cita
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-white/20 p-1 md:p-2 text-white transition hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    aria-label="Cerrar modal"
                  >
                    <XMarkIcon className="h-3 w-3 md:h-5 md:w-5" />
                  </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
                  <div className="space-y-6">
                    <section>
                      <header className="mb-2">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                          1. Selecciona la sucursal
                        </h3>
                      </header>
                      <div className="space-y-3">
                        <select
                          value={selectedBranchId}
                          onChange={(event) =>
                            handleBranchChange(event.target.value)
                          }
                          className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus:border-yellow-400 focus:outline-none"
                        >
                          <option value="">Selecciona una sucursal</option>
                          {sucursales.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                              {branch.address ? ` — ${branch.address}` : ""}
                            </option>
                          ))}
                        </select>
                        {branchesLoading ? (
                          <p className="text-xs text-neutral-400">
                            Cargando sucursales...
                          </p>
                        ) : null}
                        {branchesError ? (
                          <p className="text-xs text-red-400">
                            {branchesError}
                          </p>
                        ) : null}
                      </div>
                    </section>

                    {servicesLoading ? (
                      <p className="text-xs text-neutral-400">
                        Cargando servicios...
                      </p>
                    ) : null}

                    {servicesError ? (
                      <p className="text-xs text-red-400">{servicesError}</p>
                    ) : null}

                    {services.length ? (
                      <section>
                        <header className="mb-2">
                          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                            2. Elige el servicio
                          </h3>
                        </header>
                        <div className="space-y-3">
                          <select
                            value={selectedServiceId}
                            onChange={(event) =>
                              setSelectedServiceId(event.target.value)
                            }
                            className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                          >
                            <option value="">
                              Selecciona un servicio (opcional)
                            </option>
                            {services.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name} · {service.duration} min
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-neutral-400">
                            El servicio seleccionado puede ajustar la
                            disponibilidad de horarios.
                          </p>
                        </div>
                      </section>
                    ) : null}

                    <section className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs text-neutral-200">
                      <p className="font-semibold uppercase tracking-[0.25em] text-yellow-300">
                        Requisitos
                      </p>
                      <ul className="mt-2 space-y-1">
                        <li>
                          Selecciona sucursal, fecha y horario disponibles.
                        </li>
                        <li>
                          Confirma tu cita y guarda el número de confirmación.
                        </li>
                        <li>
                          Presenta tu cita en la sucursal elegida el día y hora
                          seleccionados.
                        </li>
                      </ul>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                            3. Selecciona la fecha
                          </h3>
                          <p className="text-xs text-neutral-400">
                            Los días disponibles se muestran en amarillo.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentMonth(addMonths(currentMonth, -1))
                            }
                            className="rounded-full border border-neutral-700 p-1 text-neutral-300 transition hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
                            aria-label="Mes anterior"
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCurrentMonth(addMonths(currentMonth, 1))
                            }
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
                          const isDisabled =
                            !selectedBranchId || isPast || datesLoading;
                          const isSelected = selectedDate === day.iso;

                          return (
                            <button
                              key={day.key}
                              type="button"
                              onClick={() => handleDateSelection(day.iso)}
                              disabled={isDisabled}
                              className={clsx(
                                "flex h-10 items-center justify-center rounded-full border text-sm transition",
                                isSelected
                                  ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_12px_30px_rgba(250,204,21,0.35)]"
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
                        <p className="mt-3 text-xs text-red-400">
                          {datesError}
                        </p>
                      ) : null}
                    </section>

                    <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
                      <header className="mb-3">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                          4. Selecciona el horario
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

                      {!timesLoading &&
                      !availableTimes.length &&
                      selectedDate ? (
                        <p className="text-xs text-neutral-400">
                          No hay horarios disponibles para esta fecha. Prueba
                          con otra combinación.
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {availableTimes.map((time) => {
                          const isSelected = selectedTime === time;
                          if (timesLoading) {
                            return null;
                          }
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={clsx(
                                "rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition",
                                isSelected
                                  ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_12px_30px_rgba(250,204,21,0.35)]"
                                  : "border-yellow-500/60 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-400/20"
                              )}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    </section>

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

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-neutral-500 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className={clsx(
                          "rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-black transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                          isConfirmDisabled
                            ? "cursor-not-allowed bg-yellow-500/50 text-black/60"
                            : "bg-yellow-500 shadow-[0_18px_40px_rgba(250,204,21,0.35)] hover:translate-y-[-2px]"
                        )}
                      >
                        {submitStatus === "loading"
                          ? "Confirmando..."
                          : "Confirmar cita"}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
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
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const todayISO = useMemo(() => formatISODate(new Date()), []);
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );
  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth),
    [currentMonth]
  );
  const { addCartItem } = useCart();

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
      .then((raw) => setAvailableTimes(normalizeStringArray(raw)))
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
    setSubmitStatus("loading");
    setSubmitMessage("Confirmando cita...");
    const payload: CreateAppointmentPayload = {
      branchId: selectedBranchId,
      date: selectedDate,
      time: selectedTime,
    };
    if (selectedServiceId) {
      payload.serviceId = selectedServiceId;
    }
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
    const productGid = sucursalCode in instProdIDs ? instProdIDs[sucursalCode as keyof typeof instProdIDs] : undefined;
    if (!productGid) {
      setSubmitStatus("error");
      setSubmitMessage(
        "No se pudo resolver el producto de instalación para la sucursal seleccionada."
      );
      return;
    }
    // const sucProduct = await backendFetch(`${sucursalCode}-inst-00`);
    const product = await getRawProduct(productGid);
    if (!product) {
      setSubmitStatus("error");
      setSubmitMessage(
        "No se pudo obtener el producto de instalación para la sucursal seleccionada."
      );
      return;
    }

    const selectedVariantId = instVarIDs[sucursalCode as keyof typeof instVarIDs] || "1";
    const finalVariant : ProductVariant  = {
      availableForSale: true,
      id: selectedVariantId,
      price: {amount: "0", currencyCode: "MXN"},
      quantityAvailable: 4,
      selectedOptions: [{name: "Instalacion", value: sucursalCode}],
      // sku: `${sucursalCode}-inst-00`,
      title: `Instalación gratuita ${sucursalCode.toLocaleUpperCase()}`,
    }
    if (!finalVariant) {
      setSubmitStatus("error");
      setSubmitMessage(
        "No se pudo obtener la variante del producto de instalación."
      );
      return;
    }
    product.variants = [finalVariant];
    const quantity = 1;
    const addItemPayload ={
      selectedVariantId,
      quantity,
    }
    try {
      // await createAppointment(payload);
      setSubmitStatus("success");
      setSubmitMessage("¡Tu cita ha sido confirmada con éxito!");
      console.debug("[agendar-cita] addCartItem:", finalVariant, product, quantity);
      console.debug("[agendar-cita] addItem:", selectedVariantId, quantity);
      addCartItem(finalVariant, product, quantity);
      await addItem(null, addItemPayload).then((r) => {
        if (r) console.debug("Added to cart:", r);
      });
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
    submitStatus === "loading";
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
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="space-y-6">
          <section>
            <header className="mb-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                1. Selecciona la sucursal
              </h3>
            </header>
            <div className="space-y-3">
              <select
                value={selectedBranchId}
                onChange={(event) => handleBranchChange(event.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] focus:border-yellow-400 focus:outline-none"
              >
                <option value="">Selecciona una sucursal</option>
                {sucursales.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                    {branch.address ? ` — ${branch.address}` : ""}
                  </option>
                ))}
              </select>
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
          {servicesLoading ? (
            <p className="text-xs text-neutral-400">Cargando servicios...</p>
          ) : null}
          {servicesError ? (
            <p className="text-xs text-red-400">{servicesError}</p>
          ) : null}
          {services.length ? (
            <section>
              <header className="mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                  2. Elige el servicio
                </h3>
              </header>
              <div className="space-y-3">
                <select
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-sm text-white focus:border-yellow-400 focus:outline-none"
                >
                  <option value="">Selecciona un servicio (opcional)</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.duration} min
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-400">
                  El servicio seleccionado puede ajustar la disponibilidad de
                  horarios.
                </p>
              </div>
            </section>
          ) : null}
          <section className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs text-neutral-200">
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
          </section>
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                  3. Selecciona la fecha
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
                      "flex h-10 items-center justify-center rounded-full border text-sm transition",
                      isSelected
                        ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_12px_30px_rgba(250,204,21,0.35)]"
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
          <section className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
            <header className="mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
                4. Selecciona el horario
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
            <div className="mt-4 flex flex-wrap gap-2">
              {availableTimes.map((time) => {
                const isSelected = selectedTime === time;
                if (timesLoading) {
                  return null;
                }
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {setSelectedTime(time); setSubmitStatus("idle");}}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition",
                      isSelected
                        ? "border-yellow-400 bg-yellow-400 text-black shadow-[0_12px_30px_rgba(250,204,21,0.35)]"
                        : "border-yellow-500/60 bg-yellow-500/10 text-yellow-200 hover:bg-yellow-400/20"
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </section>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-neutral-300 transition hover:border-neutral-500 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              className={clsx(
                "rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-black transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                isConfirmDisabled
                  ? "cursor-not-allowed bg-yellow-500/50 text-black/60"
                  : "bg-yellow-500 shadow-[0_18px_40px_rgba(250,204,21,0.35)] hover:translate-y-[-2px]"
              )}
            >
              {submitStatus === "loading" ? "Confirmando..." : "Confirmar cita"}
            </button>
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
