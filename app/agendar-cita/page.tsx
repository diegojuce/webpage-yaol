"use client";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderMultiSectionDigitalClockTimeView } from "@mui/x-date-pickers/timeViewRenderers";
import { useCart } from "components/cart/cart-context";
import { setCartAttributes } from "components/cart/actions";
import { CART_BRANCHES, backendBranchCode } from "components/cart/branches";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import {
  fetchAvailableTimes,
  fetchClientServiceAndItems,
  fetchRegisteredClient,
  saveAndSchedule,
} from "lib/api/appointments";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import "./agendar-cita.css";

dayjs.locale("es");

const TIME_ZONE_CDMX = "America/Mexico_City";
const ARRAY_KEYS = ["data", "dates", "fechas", "items", "horarios"] as const;

type ClientData = {
  nombre: string;
  telefono: string;
  sucursal: string; // display label
  branchCode: string; // backend code (NHS, TEC, BJZ, CON, REY, MAN)
  articulos: string;
  servicios: string;
  duracion: number; // minutes — must match a backend-supported duration (60 or 120)
};

// Cart branch name → backend appointment branch code (uppercase, matches
// backend rampDictionary). Source of truth: CART_BRANCHES; both Manzanillo
// entries collapse to "MAN" via backendBranchCode().
const normalizeBranchName = (s: string) => s.trim().toLowerCase();

function codeFromBranchName(name: string): string {
  const target = normalizeBranchName(name);
  if (!target) return "";
  const branch = CART_BRANCHES.find(
    (b) => normalizeBranchName(b.name) === target
  );
  return branch ? backendBranchCode(branch.id) : "";
}

// Empty initial state — populated only after fetchRegisteredClient /
// fetchClientServiceAndItems return real data.
const EMPTY_CLIENT: ClientData = {
  nombre: "",
  telefono: "",
  sucursal: "",
  branchCode: "",
  articulos: "",
  servicios: "",
  duracion: 0,
};

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS_ES_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAYS_ES_LONG = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date | null, b: Date | null) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isSunday(d: Date) {
  return d.getDay() === 0;
}
function fmtFullDate(d: Date) {
  const dia = DAYS_ES_LONG[(d.getDay() + 6) % 7];
  return `${dia} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
}
function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  const hhmmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (hhmmMatch) {
    const hh = hhmmMatch[1]?.padStart(2, "0") ?? "00";
    const mm = hhmmMatch[2] ?? "00";
    return `${hh}:${mm}`;
  }

  const parsedFallback = new Date(trimmed);
  if (Number.isNaN(parsedFallback.getTime())) return null;

  const fallbackFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE_CDMX,
  });
  return fallbackFormatter.format(parsedFallback);
}

function normalizeAvailableTimes(data: unknown): string[] {
  const rawArray = Array.isArray(data)
    ? data
    : isRecord(data)
      ? ARRAY_KEYS.flatMap((key) =>
          Array.isArray(data[key]) ? (data[key] as unknown[]) : []
        )
      : [];

  if (!rawArray.length) return [];

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

function extractQuoteId(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, any>;
  const direct = data.quote_id ?? data.quoteId;
  if (direct) return String(direct);
  const quote =
    data.quote ??
    data.data?.quote ??
    data.result?.quote ??
    data.response?.quote;
  const nested = quote?.quote_id ?? quote?.quoteId ?? quote?.id;
  return nested ? String(nested) : null;
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
      if (part.type !== "literal") acc[part.type] = part.value;
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
  )
    return 0;
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

function buildStartAtInCdmx(date: string, hhmm: string): string {
  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const [hourStr, minuteStr] = hhmm.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
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
  return `${date}T${hhmm}:00${formatOffsetMinutes(finalOffset)}`;
}

type Step = "form" | "confirming" | "success";
type QuoteStatus =
  | "loading"
  | "syncing"
  | "ok"
  | "not_found"
  | "unpaid"
  | "already_scheduled";

// Backoff schedule for the registered-client poll while the Shopify webhook
// catches up. Cumulative ~31s before we give up and show not_found.
const REGISTERED_CLIENT_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

export default function AgendarCitaPage() {
  const searchParams = useSearchParams();
  const quoteIdFromQuery = searchParams.get("quote_id") ?? undefined;
  const { cart } = useCart();

  const [today, setToday] = useState<Date | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [date, setDate] = useState<Date | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [minute, setMinute] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [client, setClient] = useState<ClientData>(EMPTY_CLIENT);
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>(
    quoteIdFromQuery ? "loading" : "ok"
  );
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (!snackbar) return;
    const t = setTimeout(() => setSnackbar(null), 4000);
    return () => clearTimeout(t);
  }, [snackbar]);

  // Cart attributes (saved by the PreCartWizard in components/cart/modal.tsx
  // via setCartAttributes — backed by the cartId cookie + Shopify cart).
  const cartAttributes = cart?.attributes ?? [];
  const phoneFromCart =
    cartAttributes.find((a) => a.key === "telefono")?.value?.trim() ?? "";
  const branchNameFromCart =
    cartAttributes.find((a) => a.key === "sucursal")?.value?.trim() ?? "";
  const branchCodeFromCart = branchNameFromCart
    ? codeFromBranchName(branchNameFromCart)
    : "";

  useEffect(() => {
    setToday(startOfDay(new Date()));
  }, []);

  // Pre-fill client state from cart attributes. Only fills empty fields, so a
  // future fetchRegisteredClient response (when the endpoint is configured)
  // takes precedence.
  useEffect(() => {
    setClient((prev) => ({
      ...prev,
      telefono: prev.telefono || phoneFromCart,
      sucursal: prev.sucursal || branchNameFromCart,
      branchCode: prev.branchCode || branchCodeFromCart,
    }));
  }, [phoneFromCart, branchNameFromCart, branchCodeFromCart]);

  // Fetch registered client data + quote status. Drives the invalid-state
  // screens (not found / unpaid / already scheduled).
  //
  // Si el webhook orders/paid todavia no ha creado la quote en BD (race
  // entre el redirect post-pago y el procesamiento del webhook), exists
  // viene false. Reintentamos con backoff antes de declarar not_found para
  // que el usuario no tenga que recargar manualmente.
  useEffect(() => {
    if (!quoteIdFromQuery) {
      setQuoteStatus("ok");
      return;
    }
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    setQuoteStatus("loading");

    const attempt = (retryIdx: number) => {
      fetchRegisteredClient(quoteIdFromQuery)
        .then((data) => {
          if (cancelled) return;
          if (!data.exists) {
            const delay = REGISTERED_CLIENT_RETRY_DELAYS_MS[retryIdx];
            if (delay !== undefined) {
              setQuoteStatus("syncing");
              retryTimer = setTimeout(() => attempt(retryIdx + 1), delay);
              return;
            }
            setQuoteStatus("not_found");
            return;
          }
          if (!data.paid) {
            setQuoteStatus("unpaid");
            return;
          }
          const code = data.branch_code || data.sucursal;
          const branch = CART_BRANCHES.find(
            (b) => backendBranchCode(b.id) === code
          );
          setClient((prev) => ({
            ...prev,
            nombre: data.client_name,
            telefono: data.phone,
            sucursal: branch?.name ?? data.sucursal,
            branchCode: code,
          }));
          if (data.scheduled) {
            setScheduledAt(data.scheduled_at ?? null);
            setQuoteStatus("already_scheduled");
          } else {
            setQuoteStatus("ok");
          }
        })
        .catch((error) => {
          console.warn("[agendar-cita] fetchRegisteredClient", error);
          if (!cancelled) setQuoteStatus("ok");
        });
    };

    attempt(0);

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [quoteIdFromQuery, retryNonce]);

  // Fetch the client's service + items (duration drives availability lookup).
  useEffect(() => {
    let cancelled = false;
    fetchClientServiceAndItems(quoteIdFromQuery)
      .then((data) => {
        if (cancelled) return;
        setClient((prev) => ({
          ...prev,
          articulos: data.articulos,
          servicios: data.servicios,
          duracion: data.duracion,
        }));
      })
      .catch((error) => {
        console.warn("[agendar-cita] fetchClientServiceAndItems", error);
      });
    return () => {
      cancelled = true;
    };
  }, [quoteIdFromQuery]);

  // Fetch available time slots whenever the date or branch/duration changes.
  useEffect(() => {
    if (!date || !client.branchCode || !client.duracion) {
      setAvailableTimes([]);
      return;
    }
    let cancelled = false;
    setTimesLoading(true);
    setErrorMessage(null);
    fetchAvailableTimes(
      String(client.duracion),
      client.branchCode,
      formatISODate(date)
    )
      .then((raw) => {
        if (cancelled) return;
        setAvailableTimes(normalizeAvailableTimes(raw));
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAvailableTimes([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Error al obtener horarios disponibles"
        );
      })
      .finally(() => {
        if (!cancelled) setTimesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, client.duracion, client.branchCode]);

  // Reset hour/minute when date changes so a stale selection isn't kept.
  useEffect(() => {
    setHour(null);
    setMinute(null);
  }, [date]);

  const time =
    hour !== null && minute !== null ? `${pad(hour)}:${pad(minute)}` : null;
  const clientLoaded = Boolean(
    client.nombre && client.telefono && client.branchCode && client.duracion
  );
  const ready = !!date && !!time && clientLoaded;

  const missingFields = {
    nombre: !client.nombre,
    telefono: !client.telefono || client.telefono.length < 10,
    sucursal: !client.branchCode,
    date: !date,
    time: !time,
  };
  const showErrors = attempted && !ready;

  async function handleChangePhone(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    setClient((prev) => ({ ...prev, telefono: digits }));
    if (digits.length === 10) {
      try {
        await setCartAttributes({ phone: digits });
      } catch (error) {
        console.warn("[agendar-cita] save phone failed", error);
      }
    }
  }

  async function handleChangeBranch(name: string) {
    const code = codeFromBranchName(name);
    setClient((prev) => ({ ...prev, sucursal: name, branchCode: code }));
    if (!name) return;
    try {
      await setCartAttributes({ sucursal: name, sucursalCode: code });
    } catch (error) {
      console.warn("[agendar-cita] save branch failed", error);
    }
  }

  function handleCtaClick() {
    if (ready) {
      handleConfirm();
      return;
    }
    setAttempted(true);
    const missing: string[] = [];
    if (missingFields.nombre) missing.push("Nombre");
    if (missingFields.telefono) missing.push("Teléfono");
    if (missingFields.sucursal) missing.push("Sucursal");
    if (missingFields.date) missing.push("Día");
    if (missingFields.time) missing.push("Hora");
    setSnackbar(missing.join(" · "));
  }

  async function handleConfirm() {
    if (!date || hour === null || minute === null) return;
    setStep("confirming");
    setErrorMessage(null);

    const hhmm = `${pad(hour)}:${pad(minute)}`;
    const dateISO = formatISODate(date);
    const startAt = buildStartAtInCdmx(dateISO, hhmm);

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
          (o) => ({
            name: o.name,
            value: o.value,
          })
        ),
      };
    });

    try {
      const response = await saveAndSchedule({
        client_name: client.nombre,
        phone: client.telefono,
        sucursal: client.branchCode,
        additional_notes: client.servicios,
        start_at: startAt,
        duration_minutes: client.duracion,
        // When the quote already exists (paid), items live in the DB from
        // the orders/paid webhook — do not overwrite them. Only the legacy
        // "schedule first, pay later" flow sends items.
        ...(quoteIdFromQuery ? { quote_id: quoteIdFromQuery } : { items }),
      });

      const quoteId = extractQuoteId(response);

      if (quoteId || client.branchCode) {
        try {
          await setCartAttributes({
            quoteId,
            sucursal: client.sucursal,
            sucursalCode: client.branchCode,
          });
        } catch (cartError) {
          console.warn("[agendar-cita] cart attributes sync failed", cartError);
        }
      }

      setConfirmId(
        quoteId ?? `YT-${Math.floor(100000 + Math.random() * 900000)}`
      );
      setStep("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al confirmar la cita. Intenta de nuevo."
      );
      setStep("form");
    }
  }

  function handleReset() {
    setDate(null);
    setHour(null);
    setMinute(null);
    setErrorMessage(null);
    setStep("form");
  }

  if (!today) {
    return <div className="yt-agendar-page" style={{ minHeight: "100vh" }} />;
  }

  if (quoteStatus === "loading") {
    return (
      <div
        className="yt-agendar-page"
        style={{ paddingTop: "7rem", minHeight: "100vh" }}
      >
        <main className="layout">
          <p className="lead">Cargando tu cotización…</p>
        </main>
      </div>
    );
  }

  if (quoteStatus === "syncing") {
    return (
      <div
        className="yt-agendar-page"
        style={{ paddingTop: "7rem", minHeight: "100vh" }}
      >
        <main className="layout">
          <p className="lead">
            Estamos confirmando tu pago. Esto suele tomar unos segundos…
          </p>
        </main>
      </div>
    );
  }

  if (quoteStatus === "not_found") {
    return (
      <div className="yt-agendar-page" style={{ paddingTop: "7rem" }}>
        <StatusScreen
          eyebrow="COTIZACIÓN NO ENCONTRADA"
          title="No encontramos esta cotización"
          message={
            "Verifica el enlace que te llegó por WhatsApp o escríbenos para ayudarte."
          }
          actions={
            <button
              type="button"
              className="success__cta"
              onClick={() => setRetryNonce((n) => n + 1)}
            >
              Reintentar
            </button>
          }
        />
      </div>
    );
  }

  if (quoteStatus === "unpaid") {
    return (
      <div className="yt-agendar-page" style={{ paddingTop: "7rem" }}>
        <StatusScreen
          eyebrow="PAGO PENDIENTE"
          title="Tu pago aún está pendiente"
          message="Termina la compra para poder agendar tu cita."
        />
      </div>
    );
  }

  if (quoteStatus === "already_scheduled" && !rescheduling) {
    return (
      <div className="yt-agendar-page" style={{ paddingTop: "7rem" }}>
        <AlreadyScheduledScreen
          scheduledAt={scheduledAt}
          client={client}
          onReschedule={() => {
            setRescheduling(true);
            setQuoteStatus("ok");
          }}
        />
      </div>
    );
  }

  return (
    <div className="yt-agendar-page" style={{ paddingTop: "7rem" }}>
      {step !== "success" ? (
        <main className="layout">
          <Header />
          <SummaryStrip
            client={client}
            onChangeBranch={handleChangeBranch}
            onChangePhone={handleChangePhone}
            errors={
              showErrors
                ? {
                    nombre: missingFields.nombre,
                    telefono: missingFields.telefono,
                    sucursal: missingFields.sucursal,
                  }
                : undefined
            }
          />
          <DateCard
            today={today}
            date={date}
            setDate={setDate}
            error={showErrors && missingFields.date}
          />
          <TimeCard
            hour={hour}
            setHour={setHour}
            minute={minute}
            setMinute={setMinute}
            disabled={!date}
            availableTimes={availableTimes}
            timesLoading={timesLoading}
            error={showErrors && missingFields.time}
          />
          <Footer
            date={date}
            time={time}
            ready={ready}
            onConfirm={handleCtaClick}
            isConfirming={step === "confirming"}
            errorMessage={errorMessage}
            alertMessage={snackbar}
            onDismissAlert={() => setSnackbar(null)}
          />
        </main>
      ) : (
        <SuccessScreen
          confirmId={confirmId}
          date={date}
          time={time}
          onReset={handleReset}
          client={client}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="page-head">
      <p className="eyebrow">PASO 3 DE 4</p>
      <h1 className="display-title">AGENDA TU CITA</h1>
      <p className="lead">
        Elige el día y la hora en que pasarás a tu sucursal.
      </p>
    </div>
  );
}

function PencilButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="cell__pencil"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </button>
  );
}

function SummaryStrip({
  client,
  onChangeBranch,
  onChangePhone,
  errors,
}: {
  client: ClientData;
  onChangeBranch: (name: string) => void;
  onChangePhone: (phone: string) => void;
  errors?: { nombre: boolean; telefono: boolean; sucursal: boolean };
}) {
  const { nombre, telefono, sucursal, articulos, servicios, duracion } = client;
  const dash = "—";
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBranch, setEditingBranch] = useState(false);
  const errorClass = (flag?: boolean) => (flag ? "cell--error" : "");
  return (
    <div className="strip-card">
      <div className="strip-card__head">
        <span className="strip-card__check">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <span className="strip-card__title">DATOS REGISTRADOS</span>
      </div>
      <div className="strip-card__grid">
        <div
          className={`cell ${errorClass(errors?.nombre || errors?.telefono)}`}
        >
          <p className="cell__label">Cliente</p>
          <p className="cell__value">{nombre || dash}</p>
          {editingPhone ? (
            <input
              className="cell__input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="Teléfono (10 dígitos)"
              value={telefono}
              maxLength={14}
              autoFocus
              onChange={(e) => onChangePhone(e.target.value)}
              onBlur={(e) => {
                onChangePhone(e.target.value);
                setEditingPhone(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  e.currentTarget.blur();
                }
              }}
            />
          ) : (
            <div className="cell__row">
              <p className="cell__sub cell__sub--strong">{telefono || dash}</p>
              <PencilButton
                label="Editar teléfono"
                onClick={() => setEditingPhone(true)}
              />
            </div>
          )}
        </div>
        <div className={`cell ${errorClass(errors?.sucursal)}`}>
          <p className="cell__label">Sucursal</p>
          {editingBranch ? (
            <select
              className="cell__input cell__input--select"
              value={sucursal}
              autoFocus
              onChange={(e) => {
                onChangeBranch(e.target.value);
                setEditingBranch(false);
              }}
              onBlur={() => setEditingBranch(false)}
            >
              <option value="">Selecciona una sucursal</option>
              {CART_BRANCHES.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="cell__row">
              <p className="cell__value cell__value--inline">
                {sucursal || dash}
              </p>
              <PencilButton
                label="Editar sucursal"
                onClick={() => setEditingBranch(true)}
              />
            </div>
          )}
        </div>
        <Cell label="Artículos" value={articulos || dash} />
        <Cell
          label="Servicios"
          value={servicios || dash}
          sub={duracion ? `Duración estimada · ${duracion} min` : undefined}
        />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="cell">
      <p className="cell__label">{label}</p>
      <p className="cell__value">{value}</p>
      {sub && <p className="cell__sub">{sub}</p>}
    </div>
  );
}

function DateCard({
  today,
  date,
  setDate,
  error,
}: {
  today: Date;
  date: Date | null;
  setDate: (d: Date) => void;
  error?: boolean;
}) {
  const [view, setView] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const year = view.getFullYear();
  const month = view.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);

  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const canPrev = view > minMonth;

  return (
    <section className={`card ${error ? "card--error" : ""}`}>
      <div className="card__head">
        <p className="card__step">01</p>
        <div>
          <h2 className="card__title">Selecciona el día</h2>
          <p className="card__sub">
            Atendemos lunes a sábado · Domingos cerrado
          </p>
        </div>
      </div>
      <div className="cal">
        <div className="cal__head">
          <button
            type="button"
            className="cal__nav"
            disabled={!canPrev}
            onClick={() => setView(new Date(year, month - 1, 1))}
            aria-label="Mes anterior"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <p className="cal__title">
            {MONTHS_ES[month]} {year}
          </p>
          <button
            type="button"
            className="cal__nav"
            onClick={() => setView(new Date(year, month + 1, 1))}
            aria-label="Mes siguiente"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="cal__grid cal__grid--head">
          {DAYS_ES_SHORT.map((d) => (
            <div key={d} className="cal__dow">
              {d}
            </div>
          ))}
        </div>
        <div className="cal__grid">
          {cells.map((d, i) => {
            if (!d)
              return <div key={i} className="cal__cell cal__cell--empty" />;
            const past = d < today;
            const closed = isSunday(d);
            const dis = past || closed;
            const sel = sameDay(d, date);
            const isToday = sameDay(d, today);
            return (
              <button
                type="button"
                key={i}
                disabled={dis}
                onClick={() => setDate(d)}
                className={`cal__cell ${sel ? "cal__cell--sel" : ""} ${
                  isToday ? "cal__cell--today" : ""
                } ${dis ? "cal__cell--dis" : ""}`}
              >
                <span>{d.getDate()}</span>
                {isToday && <span className="cal__cell-today-dot" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TimeCard({
  hour,
  setHour,
  minute,
  setMinute,
  disabled,
  availableTimes,
  timesLoading,
  error,
}: {
  hour: number | null;
  setHour: (n: number) => void;
  minute: number | null;
  setMinute: (n: number) => void;
  disabled: boolean;
  availableTimes: string[];
  timesLoading: boolean;
  error?: boolean;
}) {
  const value: Dayjs | null =
    hour !== null && minute !== null
      ? dayjs().hour(hour).minute(minute).second(0)
      : null;

  const availableSet = useMemo(() => new Set(availableTimes), [availableTimes]);
  const availableHours = useMemo(
    () =>
      new Set(
        availableTimes
          .map((t) => Number(t.split(":")[0]))
          .filter((n) => !Number.isNaN(n))
      ),
    [availableTimes]
  );

  const noSlots = !timesLoading && !disabled && availableTimes.length === 0;

  return (
    <section
      className={`card ${disabled ? "card--locked" : ""} ${
        error ? "card--error" : ""
      }`}
    >
      <div className="card__head">
        <p className="card__step">02</p>
        <div>
          <h2 className="card__title">Selecciona la hora</h2>
          <p className="card__sub">
            {disabled
              ? "Primero elige el día"
              : timesLoading
                ? "Cargando horarios disponibles…"
                : noSlots
                  ? "No hay horarios disponibles para esta fecha"
                  : "Toca para abrir el selector"}
          </p>
        </div>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <TimePicker
          label="Hora de inicio"
          ampm={false}
          minutesStep={30}
          disabled={disabled || timesLoading || noSlots}
          value={value}
          onChange={(v) => {
            if (!v) return;
            setHour(v.hour());
            setMinute(v.minute());
          }}
          shouldDisableTime={(v, view) => {
            if (!availableTimes.length) return false;
            if (view === "hours") return !availableHours.has(v.hour());
            if (view === "minutes") {
              return !availableSet.has(`${pad(v.hour())}:${pad(v.minute())}`);
            }
            return false;
          }}
          viewRenderers={{
            hours: (props) =>
              renderMultiSectionDigitalClockTimeView({
                ...props,
                skipDisabled: true,
              }),
            minutes: (props) =>
              renderMultiSectionDigitalClockTimeView({
                ...props,
                skipDisabled: true,
              }),
            seconds: null,
          }}
          slotProps={{
            textField: { fullWidth: true, className: "yt-time-field" },
            popper: { className: "yt-time-popper" },
            actionBar: { actions: [] },
          }}
        />
      </LocalizationProvider>
    </section>
  );
}

function Footer({
  date,
  time,
  ready,
  onConfirm,
  isConfirming,
  errorMessage,
  alertMessage,
  onDismissAlert,
}: {
  date: Date | null;
  time: string | null;
  ready: boolean;
  onConfirm: () => void;
  isConfirming: boolean;
  errorMessage: string | null;
  alertMessage: string | null;
  onDismissAlert: () => void;
}) {
  return (
    <>
      {alertMessage ? (
        <div
          role="alert"
          aria-live="polite"
          className="fixed bottom-[88px] left-1/2 z-50 flex w-[min(calc(100vw-32px),520px)] -translate-x-1/2 items-start gap-3 rounded-lg border border-[#ffc600] bg-[#fffaeb] px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
        >
          <span
            aria-hidden
            className="mt-[2px] flex h-4 w-4 flex-none items-center justify-center rounded-full bg-[#ffc600] text-[10px] font-bold leading-none text-[#0f0f0f]"
          >
            !
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0f0f0f]">
              Faltan datos
            </p>
            <p className="m-0 break-words text-sm leading-snug text-[#1a1a1a]">
              {alertMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismissAlert}
            aria-label="Cerrar aviso"
            className="-mr-1 ml-2 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[#0f0f0f]/60 hover:text-[#0f0f0f]"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : null}
      <div className="yt-footer">
      <div className="yt-footer__info">
        {errorMessage ? (
          <>
            <span className="yt-footer__eyebrow" style={{ color: "#E53935" }}>
              ERROR
            </span>
            <span
              className="yt-footer__main"
              style={{ color: "#E53935", fontWeight: 600 }}
            >
              {errorMessage}
            </span>
          </>
        ) : ready && date && time ? (
          <>
            <span className="yt-footer__eyebrow">TU CITA</span>
            <span className="yt-footer__main">
              {fmtFullDate(date)} · <strong>{time}</strong>
            </span>
          </>
        ) : (
          <>
            <span className="yt-footer__eyebrow">PENDIENTE</span>
            <span className="yt-footer__main yt-footer__main--mute">
              {!date ? "Selecciona un día" : !time ? "Selecciona una hora" : ""}
            </span>
          </>
        )}
      </div>
      <button
        type="button"
        className={`cta ${ready ? "" : "cta--idle"} ${
          isConfirming ? "cta--loading" : ""
        }`}
        disabled={isConfirming}
        onClick={onConfirm}
      >
        {isConfirming ? (
          <span className="cta__spin" />
        ) : (
          <>
            Confirmar cita <span className="cta__arrow">→</span>
          </>
        )}
      </button>
    </div>
    </>
  );
}

function StatusScreen({
  eyebrow,
  title,
  message,
  actions,
}: {
  eyebrow: string;
  title: string;
  message: string;
  actions?: React.ReactNode;
}) {
  return (
    <main className="success">
      <div className="success__card">
        <p className="success__eyebrow">{eyebrow}</p>
        <h1 className="success__title">{title}</h1>
        <p className="success__lead">{message}</p>
        {actions ? <div className="success__actions">{actions}</div> : null}
      </div>
    </main>
  );
}

function AlreadyScheduledScreen({
  scheduledAt,
  client,
  onReschedule,
}: {
  scheduledAt: string | null;
  client: ClientData;
  onReschedule: () => void;
}) {
  const date = scheduledAt ? new Date(scheduledAt) : null;
  const valid = date && !Number.isNaN(date.getTime());
  return (
    <main className="success">
      <div className="success__card">
        <p className="success__eyebrow">YA TIENES CITA</p>
        <h1 className="success__title">Tu cita está agendada</h1>
        <p className="success__lead">
          Si necesitas cambiar el día o la hora, puedes reagendar.
        </p>
        <div className="success__detail">
          {valid ? (
            <div className="success__row">
              <span>Cita</span>
              <strong>
                {fmtFullDate(date!)} ·{" "}
                {`${pad(date!.getHours())}:${pad(date!.getMinutes())}`}
              </strong>
            </div>
          ) : null}
          {client.sucursal ? (
            <div className="success__row">
              <span>Sucursal</span>
              <strong>{client.sucursal}</strong>
            </div>
          ) : null}
          {client.nombre ? (
            <div className="success__row">
              <span>Cliente</span>
              <strong>{client.nombre}</strong>
            </div>
          ) : null}
        </div>
        <div className="success__actions">
          <button type="button" className="cta" onClick={onReschedule}>
            Reagendar <span className="cta__arrow">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}

function SuccessScreen({
  confirmId,
  date,
  time,
  onReset,
  client,
}: {
  confirmId: string | null;
  date: Date | null;
  time: string | null;
  onReset: () => void;
  client: ClientData;
}) {
  return (
    <main className="success">
      <div className="success__card">
        <div className="success__check">
          <svg viewBox="0 0 64 64" width="80" height="80">
            <circle
              cx="32"
              cy="32"
              r="29"
              fill="none"
              stroke="#0F0F0F"
              strokeWidth="3"
              className="success__circle"
            />
            <polyline
              points="20 33 28 41 44 24"
              fill="none"
              stroke="#0F0F0F"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="success__tick"
            />
          </svg>
        </div>
        <p className="success__eyebrow">CITA CONFIRMADA</p>
        <h1 className="success__title">¡NOS VEMOS PRONTO!</h1>
        <p className="success__lead">
          Te enviamos los detalles a <strong>{client.telefono}</strong> por
          WhatsApp.
        </p>

        <div className="success__detail">
          <div className="success__row">
            <span>Folio</span>
            <strong className="success__folio">{confirmId}</strong>
          </div>
          <div className="success__row">
            <span>Cita</span>
            <strong>
              {date ? fmtFullDate(date) : ""} · {time}
            </strong>
          </div>
          <div className="success__row">
            <span>Sucursal</span>
            <strong>{client.sucursal}</strong>
          </div>
          <div className="success__row">
            <span>Cliente</span>
            <strong>{client.nombre}</strong>
          </div>
        </div>

        <div className="success__actions">
          <button type="button" className="cta">
            Agregar al calendario <span className="cta__arrow">→</span>
          </button>
          <button type="button" className="cta cta--ghost" onClick={onReset}>
            Modificar cita
          </button>
        </div>
      </div>

      <div className="success__confetti" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 4.17) % 100}%`,
              animationDelay: `${(i % 6) * 0.12}s`,
              background:
                i % 3 === 0 ? "#FFC600" : i % 3 === 1 ? "#FFD34A" : "#0F0F0F",
            }}
          />
        ))}
      </div>
    </main>
  );
}
