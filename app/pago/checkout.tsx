"use client";

// Checkout del carrito en cuatro pasos, con la tarjeta de /club y la paleta
// clara de la página de pago anterior
// (app/club/club-signup-card.tsx):
//   datos (nombre y teléfono) → cita (sucursal, día y hora) o envío (dirección)
//   → pago (Stripe Elements) → confirmación
//
// Al pasar al pago se abre la sesión de Stripe con todo lo elegido: el backend
// aparta las llantas y guarda la entrega en el pedido; al pagar, el webhook crea
// la cotización y agenda la cita. La confirmación vive en /pago?session_id=…
// para que sobreviva a una recarga.
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import {
  lookupCheckoutSession,
  setCartAttributes,
  startCheckout,
  type StartCheckoutResult,
} from "components/cart/actions";
import { CART_BRANCHES, backendBranchCode } from "components/cart/branches";
import Image from "components/safe-image";
import { scrollAlInicio } from "components/scroll-to-top-on-route-change";
import { fetchAvailableTimes } from "lib/api/appointments";
import {
  buildStartAtInCdmx,
  formatISODate,
  normalizeAvailableTimes,
  TIME_ZONE_CDMX,
} from "lib/appointment-time";
import type {
  CheckoutDetails,
  CheckoutOrder,
  FiscalCatalog,
  OrderInvoice,
} from "lib/commerce";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  loadFiscalCatalog,
  requestOrderInvoice,
  saveCheckoutContact,
} from "./[sessionId]/actions";
import { APPEARANCE_LIGHT, getStripe, PUBLISHABLE_KEY } from "./stripe";

export type SummaryLine = {
  key: string;
  title: string;
  quantity: number;
  totalAmount: string; // pesos, IVA incluido
  imageUrl: string | null;
  imageAlt: string;
};

type PublicOrder = Omit<CheckoutOrder, "clientSecret">;

type Props =
  | {
      mode: "cart";
      lines: SummaryLine[];
      totalAmount: string;
      initialPhone: string;
      initialBranchCode: string;
    }
  | { mode: "confirm"; sessionId: string; order: PublicOrder };

type Paso = "datos" | "entrega" | "pago" | "listo";
type Modo = "install" | "delivery";

const PASOS: { id: Paso; label: string }[] = [
  { id: "datos", label: "Tus datos" },
  { id: "entrega", label: "Cita o envío" },
  { id: "pago", label: "Pago" },
  { id: "listo", label: "Listo" },
];

const DISPLAY_FONT =
  "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif";
const INPUT =
  "w-full rounded-xl border border-[#e2e2e2] bg-white px-4 py-3.5 text-[15px] text-[#0f0f0f] outline-none transition-[border-color,box-shadow] placeholder:text-[#a3a3a3] focus:border-[#FFC600] focus:shadow-[0_0_0_3px_rgba(255,198,0,0.25)] disabled:opacity-50";
const LABEL =
  "mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6b6b]";
const CHIP =
  "rounded-xl border px-3 py-2.5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const chipClass = (activo: boolean) =>
  `${CHIP} ${
    activo
      ? "border-[#FFC600] bg-[#FFC600]/15 text-[#0f0f0f]"
      : "border-[#e2e2e2] bg-white text-[#3a3a3a] hover:border-[#c9c9c9]"
  }`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIAS_A_OFRECER = 14;
// Margen mínimo entre ahora y la cita (el taller necesita preparar las llantas).
const MARGEN_CITA_MS = 60 * 60 * 1000;

const soloDigitos = (v: string) => v.replace(/\D/g, "");
const formatTelefono = (tel: string) =>
  soloDigitos(tel).replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
const formatMXN = (amount: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    amount,
  );
const formatCita = (iso: string) => {
  const d = new Date(iso);
  const dia = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE_CDMX,
  }).format(d);
  const hora = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE_CDMX,
  }).format(d);
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} · ${hora} h`;
};
const branchByCode = (code: string | null | undefined) =>
  CART_BRANCHES.find((b) => backendBranchCode(b.id) === code);

// Días a partir de hoy, sin domingos (las sucursales no abren).
function proximosDias(): Date[] {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Array.from({ length: DIAS_A_OFRECER }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    return d;
  }).filter((d) => d.getDay() !== 0);
}

function mensajeCheckout(r: Extract<StartCheckoutResult, { ok: false }>) {
  if (r.error === "unavailable") {
    const detalle = r.unavailableItems
      .map((it) => `${it.title} (disponibles: ${it.available})`)
      .join(", ");
    return `${r.message ?? "Algunas llantas ya no están disponibles"}${detalle ? `: ${detalle}` : ""}. Ajusta tu carrito para continuar.`;
  }
  if (r.error === "empty_cart") return "Tu carrito está vacío.";
  return r.message ?? "No se pudo iniciar el pago. Inténtalo de nuevo.";
}

export default function Checkout(props: Props) {
  const total =
    props.mode === "cart"
      ? Number(props.totalAmount)
      : props.order.totalCents / 100;
  const summary: SummaryLine[] =
    props.mode === "cart"
      ? props.lines
      : props.order.lines.map((l, i) => ({
          key: String(i),
          title: l.title,
          quantity: l.quantity,
          totalAmount: String((l.unitPriceCents * l.quantity) / 100),
          imageUrl: null,
          imageAlt: l.title,
        }));

  return (
    <section className="relative overflow-hidden px-4 py-10 md:px-14 md:py-16">
      <div className="relative mx-auto max-w-[1180px]">
        <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#d19d00]">
          Pago seguro
        </p>
        <h1
          className="m-0 mt-2 text-[clamp(2.4rem,6vw,3.6rem)] font-black uppercase leading-[0.9] tracking-[0.04em]"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          Completa tu pedido
        </h1>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[24px] border border-[#eaeaea] bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.06)] sm:p-8">
            {props.mode === "cart" ? (
              <CartFlow {...props} total={total} />
            ) : (
              <>
                <Stepper paso="listo" />
                <Confirmacion
                  sessionId={props.sessionId}
                  initialOrder={props.order}
                />
              </>
            )}
          </div>
          <Resumen
            lines={summary}
            total={total}
            nota={props.mode === "cart" || props.order.kind === "cart"}
          />
        </div>
      </div>
    </section>
  );
}

// --- Pasos 1 a 3 --------------------------------------------------------------

function CartFlow({
  initialPhone,
  initialBranchCode,
  total,
}: Extract<Props, { mode: "cart" }> & { total: number }) {
  const [paso, setPaso] = useState<Paso>("datos");
  const [error, setError] = useState("");

  // Cada paso del checkout se ve desde arriba, como una página nueva.
  const pasoInicial = useRef(true);
  useEffect(() => {
    if (pasoInicial.current) {
      pasoInicial.current = false;
      return;
    }
    scrollAlInicio();
  }, [paso]);
  const [enviando, setEnviando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState(
    soloDigitos(initialPhone).slice(0, 10),
  );

  const [modo, setModo] = useState<Modo | null>(null);
  const [branchId, setBranchId] = useState(
    () => branchByCode(initialBranchCode)?.id ?? "",
  );
  const [dias, setDias] = useState<Date[]>([]);
  const [dia, setDia] = useState<string | null>(null); // YYYY-MM-DD
  const [horas, setHoras] = useState<string[]>([]);
  const [horasCargando, setHorasCargando] = useState(false);
  const [hora, setHora] = useState<string | null>(null);
  const [direccion, setDireccion] = useState({
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    state: "Colima",
    references: "",
  });

  const [sesion, setSesion] = useState<{
    sessionId: string;
    clientSecret: string;
    key: string;
  } | null>(null);

  // Las fechas dependen del reloj del navegador: se calculan al montar.
  useEffect(() => setDias(proximosDias()), []);

  const branchCode = branchId ? backendBranchCode(branchId) : "";

  useEffect(() => {
    setHora(null);
    if (modo !== "install" || !branchCode || !dia) {
      setHoras([]);
      return;
    }
    let cancelado = false;
    setHorasCargando(true);
    fetchAvailableTimes("60", branchCode, dia)
      .then((raw) => {
        if (cancelado) return;
        const limite = Date.now() + MARGEN_CITA_MS;
        const libres = [...new Set(normalizeAvailableTimes(raw))]
          .filter(
            (hhmm) =>
              new Date(buildStartAtInCdmx(dia, hhmm)).getTime() > limite,
          )
          .sort();
        setHoras(libres);
      })
      // Sin horarios el backend responde 404.
      .catch(() => !cancelado && setHoras([]))
      .finally(() => !cancelado && setHorasCargando(false));
    return () => {
      cancelado = true;
    };
  }, [modo, branchCode, dia]);

  const nombreLimpio = nombre.trim().replace(/\s+/g, " ");
  const datosOk =
    nombreLimpio.length >= 2 && soloDigitos(telefono).length === 10;
  const direccionOk =
    direccion.line1.trim().length >= 3 &&
    /^\d{5}$/.test(direccion.postalCode) &&
    direccion.city.trim().length >= 2 &&
    direccion.state.trim().length >= 2;
  const entregaOk =
    modo === "install"
      ? Boolean(branchCode && dia && hora)
      : modo === "delivery"
        ? direccionOk
        : false;

  const irA = (siguiente: Paso) => {
    setError("");
    setPaso(siguiente);
  };

  function onDatos() {
    irA("entrega");
    // Para el seguimiento de carritos abandonados; el checkout lo vuelve a
    // guardar.
    setCartAttributes({ phone: soloDigitos(telefono) }).catch((e) =>
      console.warn("[pago] guardar teléfono", e),
    );
  }

  async function onEntrega() {
    if (!modo || !entregaOk) return;
    const base = { name: nombreLimpio, phone: soloDigitos(telefono) };
    const details: CheckoutDetails =
      modo === "install"
        ? {
            ...base,
            fulfillment: "install",
            branchCode,
            startAt: buildStartAtInCdmx(dia!, hora!),
          }
        : { ...base, fulfillment: "delivery", address: direccion };
    const key = JSON.stringify(details);
    // Sin cambios desde la última vez: la misma sesión sigue vigente.
    if (sesion?.key === key) {
      irA("pago");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const r = await startCheckout(details);
      if (!r.ok) {
        setError(mensajeCheckout(r));
        return;
      }
      if (!r.sessionId || !r.clientSecret) {
        setError("No se pudo iniciar el pago. Inténtalo de nuevo.");
        return;
      }
      setSesion({ sessionId: r.sessionId, clientSecret: r.clientSecret, key });
      irA("pago");
    } catch (e) {
      console.error("[pago] startCheckout", e);
      setError("No se pudo iniciar el pago. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const branch = CART_BRANCHES.find((b) => b.id === branchId);

  return (
    <>
      <Stepper paso={paso} />
      <Aviso error={error} />

      {paso === "datos" ? (
        <div className="flex flex-col gap-5">
          <Encabezado
            titulo="Tus datos"
            sub="Te mandamos la confirmación de tu pedido por WhatsApp."
          />
          <div>
            <label className={LABEL} htmlFor="pago-nombre">
              Nombre completo
            </label>
            <input
              id="pago-nombre"
              className={INPUT}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="¿A nombre de quién?"
              autoComplete="name"
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="pago-tel">
              Celular
            </label>
            <input
              id="pago-tel"
              className={INPUT}
              value={telefono}
              onChange={(e) =>
                setTelefono(soloDigitos(e.target.value).slice(0, 10))
              }
              placeholder="10 dígitos"
              inputMode="numeric"
              autoComplete="tel-national"
            />
            <p className="mt-2 text-[12px] leading-relaxed text-[#8a8a8a]">
              Solo lo usamos para tu compra y su seguimiento.
            </p>
          </div>
          <Boton onClick={onDatos} disabled={!datosOk}>
            Continuar
          </Boton>
        </div>
      ) : null}

      {paso === "entrega" ? (
        <div className="flex flex-col gap-5">
          <Encabezado
            titulo="¿Cómo quieres tus llantas?"
            sub="Las dos opciones son gratis."
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Opcion
              seleccionada={modo === "install"}
              onClick={() => setModo("install")}
              titulo="Instalar en sucursal"
              sub="Instalación, balanceo y nitrógeno"
            />
            <Opcion
              seleccionada={modo === "delivery"}
              onClick={() => setModo("delivery")}
              titulo="Envío a domicilio"
              sub="Entrega de 2 a 5 días"
            />
          </div>

          {modo === "install" ? (
            <>
              <div>
                <span className={LABEL}>Sucursal</span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CART_BRANCHES.map((b) => (
                    <Opcion
                      key={b.id}
                      seleccionada={branchId === b.id}
                      onClick={() => setBranchId(b.id)}
                      titulo={b.name}
                      sub={`${b.address} · ${b.hours}`}
                      compacta
                    />
                  ))}
                </div>
              </div>

              {branch ? (
                <div>
                  <span className={LABEL}>Día</span>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                    {dias.map((d) => {
                      const iso = formatISODate(d);
                      return (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => setDia(iso)}
                          aria-pressed={dia === iso}
                          className={`${chipClass(dia === iso)} min-w-[64px] shrink-0`}
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">
                            {d.toLocaleDateString("es-MX", {
                              weekday: "short",
                            })}
                          </span>
                          <span className="block text-lg font-bold leading-tight">
                            {d.getDate()}
                          </span>
                          <span className="block text-[11px] text-[#8a8a8a]">
                            {d.toLocaleDateString("es-MX", { month: "short" })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {branch && dia ? (
                <div>
                  <span className={LABEL}>Hora</span>
                  {horasCargando ? (
                    <p className="m-0 text-[13px] text-[#8a8a8a]">
                      Buscando horarios…
                    </p>
                  ) : horas.length === 0 ? (
                    <p className="m-0 rounded-xl border border-[#eaeaea] bg-[#f7f7f5] px-4 py-3 text-[13px] text-[#6b6b6b]">
                      No hay horarios disponibles este día. Prueba con otro.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {horas.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHora(h)}
                          aria-pressed={hora === h}
                          className={`${chipClass(hora === h)} text-[14px] font-semibold`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          ) : null}

          {modo === "delivery" ? (
            <div className="flex flex-col gap-4 rounded-2xl border border-[#eaeaea] bg-[#f7f7f5] p-4">
              <Campo
                id="dir-calle"
                label="Calle y número"
                value={direccion.line1}
                onChange={(v) => setDireccion((d) => ({ ...d, line1: v }))}
                placeholder="Av. Constitución 1240"
                autoComplete="address-line1"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
                <Campo
                  id="dir-colonia"
                  label="Colonia"
                  value={direccion.line2}
                  onChange={(v) => setDireccion((d) => ({ ...d, line2: v }))}
                  placeholder="Centro"
                  autoComplete="address-line2"
                />
                <Campo
                  id="dir-cp"
                  label="Código postal"
                  value={direccion.postalCode}
                  onChange={(v) =>
                    setDireccion((d) => ({
                      ...d,
                      postalCode: soloDigitos(v).slice(0, 5),
                    }))
                  }
                  placeholder="28000"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Campo
                  id="dir-ciudad"
                  label="Ciudad"
                  value={direccion.city}
                  onChange={(v) => setDireccion((d) => ({ ...d, city: v }))}
                  placeholder="Colima"
                  autoComplete="address-level2"
                />
                <Campo
                  id="dir-estado"
                  label="Estado"
                  value={direccion.state}
                  onChange={(v) => setDireccion((d) => ({ ...d, state: v }))}
                  placeholder="Colima"
                  autoComplete="address-level1"
                />
              </div>
              <Campo
                id="dir-ref"
                label="Referencias (opcional)"
                value={direccion.references}
                onChange={(v) => setDireccion((d) => ({ ...d, references: v }))}
                placeholder="Entre calles, color de la casa…"
              />
            </div>
          ) : null}

          <Boton onClick={onEntrega} disabled={!entregaOk || enviando}>
            {enviando ? "Apartando tus llantas…" : "Continuar al pago"}
          </Boton>
          <Atras onClick={() => irA("datos")} disabled={enviando}>
            ← Cambiar mis datos
          </Atras>
        </div>
      ) : null}

      {paso === "pago" && sesion ? (
        <div className="flex flex-col gap-5">
          <Encabezado
            titulo="Pago"
            sub="Tus llantas quedan apartadas 30 minutos mientras pagas."
          />
          <ResumenEntrega
            modo={modo!}
            branchName={branch?.name}
            cita={
              modo === "install" && dia && hora
                ? buildStartAtInCdmx(dia, hora)
                : null
            }
            direccion={
              modo === "delivery"
                ? [direccion.line1, direccion.line2, direccion.city]
                    .filter((x) => x.trim())
                    .join(", ")
                : null
            }
            onCambiar={() => irA("entrega")}
          />
          <StripePago
            key={sesion.sessionId}
            sessionId={sesion.sessionId}
            clientSecret={sesion.clientSecret}
            nombre={nombreLimpio}
            totalLabel={formatMXN(total)}
            onError={setError}
          />
        </div>
      ) : null}
    </>
  );
}

function ResumenEntrega({
  modo,
  branchName,
  cita,
  direccion,
  onCambiar,
}: {
  modo: Modo;
  branchName?: string;
  cita: string | null;
  direccion: string | null;
  onCambiar: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-[#eaeaea] bg-[#f7f7f5] px-4 py-3.5">
      <div className="min-w-0">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8a8a]">
          {modo === "install" ? "Instalación en sucursal" : "Envío a domicilio"}
        </p>
        <p className="m-0 mt-1 text-[14px] font-semibold text-[#0f0f0f]">
          {modo === "install" ? branchName : direccion}
        </p>
        {cita ? (
          <p className="m-0 text-[13px] text-[#6b6b6b]">{formatCita(cita)}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onCambiar}
        className="shrink-0 text-[13px] font-semibold text-[#b38600] transition-colors hover:text-[#0f0f0f]"
      >
        Cambiar
      </button>
    </div>
  );
}

function StripePago(props: {
  sessionId: string;
  clientSecret: string;
  nombre: string;
  totalLabel: string;
  onError: (message: string) => void;
}) {
  const options = useMemo(
    () => ({
      clientSecret: props.clientSecret,
      elementsOptions: { appearance: APPEARANCE_LIGHT },
    }),
    [props.clientSecret],
  );

  if (!PUBLISHABLE_KEY) {
    return (
      <p className="m-0 rounded-xl border border-[#f5c6c1] bg-[#fdecea] px-4 py-3 text-sm text-[#b71c1c]">
        El pago en línea no está disponible por ahora.
      </p>
    );
  }

  return (
    <CheckoutElementsProvider stripe={getStripe()} options={options}>
      <PagoForm {...props} />
    </CheckoutElementsProvider>
  );
}

function PagoForm({
  sessionId,
  nombre,
  totalLabel,
  onError,
}: {
  sessionId: string;
  nombre: string;
  totalLabel: string;
  onError: (message: string) => void;
}) {
  const state = useCheckoutElements();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pagando, setPagando] = useState(false);

  if (state.type === "error") {
    return (
      <p className="m-0 rounded-xl border border-[#f5c6c1] bg-[#fdecea] px-4 py-3 text-sm text-[#b71c1c]">
        {state.error.message || "No se pudo cargar el formulario de pago."}
      </p>
    );
  }

  const cargando = state.type === "loading";

  async function onPagar() {
    if (state.type !== "success" || pagando) return;
    const cleanEmail = email.trim();
    if (!EMAIL_RE.test(cleanEmail)) {
      onError("Escribe un email válido.");
      return;
    }
    onError("");
    setPagando(true);
    const fallo = (message?: string) => {
      onError(message || "No se pudo completar el pago. Inténtalo de nuevo.");
      setPagando(false);
    };
    try {
      const saved = await saveCheckoutContact(sessionId, {
        name: nombre,
        email: cleanEmail,
      });
      if (!saved.ok) return fallo(saved.message);
      // Sin returnUrl: ya viene en la sesión (Stripe lo rechaza si se repite).
      const result = await state.checkout.confirm({
        email: cleanEmail,
        redirect: "if_required",
      });
      if (result.type === "error") return fallo(result.error.message);
    } catch (e) {
      console.error("[pago] confirm", e);
      return fallo();
    }
    // Se queda en "procesando" mientras navega a la confirmación.
    router.replace(`/pago?session_id=${encodeURIComponent(sessionId)}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className={LABEL} htmlFor="pago-email">
          Email
        </label>
        <input
          id="pago-email"
          className={INPUT}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Para enviarte tu comprobante"
          disabled={pagando}
        />
      </div>
      <div>
        <span className={LABEL}>Tarjeta</span>
        {cargando ? (
          <div
            className="h-36 animate-pulse rounded-xl bg-[#f1f1ef]"
            aria-hidden
          />
        ) : null}
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      <Boton onClick={onPagar} disabled={cargando || pagando}>
        {pagando ? "Procesando…" : `Pagar ${totalLabel}`}
      </Boton>
      <p className="m-0 text-center text-[12px] leading-relaxed text-[#8a8a8a]">
        Pago seguro procesado por Stripe. Yantissimo no guarda los datos de tu
        tarjeta.
      </p>
    </div>
  );
}

// --- Paso 4: confirmación -----------------------------------------------------

// El webhook marca el pedido pagado y después agenda la cita: se consulta
// hasta tener las dos cosas (unos 35 s en total).
const REINTENTOS_MS = [1000, 2000, 3000, 4000, 5000, 8000, 12000];

function Confirmacion({
  sessionId,
  initialOrder,
}: {
  sessionId: string;
  initialOrder: PublicOrder;
}) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [agotado, setAgotado] = useState(false);

  const pendiente = (o: PublicOrder) =>
    o.status === "pending_payment" ||
    (o.status === "paid" && o.appointment?.status === "pending");

  useEffect(() => {
    if (!pendiente(initialOrder)) return;
    let cancelado = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const intento = (i: number) => {
      lookupCheckoutSession(sessionId)
        .then((o) => {
          if (cancelado || !o) return;
          setOrder(o);
          if (!pendiente(o)) return;
          const espera = REINTENTOS_MS[i];
          if (espera === undefined) setAgotado(true);
          else timer = setTimeout(() => intento(i + 1), espera);
        })
        .catch(() => !cancelado && setAgotado(true));
    };
    timer = setTimeout(() => intento(0), REINTENTOS_MS[0]);
    return () => {
      cancelado = true;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, initialOrder]);

  // El carrito ya se pagó: el ícono del carrito se actualiza.
  const pagado = order.status === "paid";
  useEffect(() => {
    if (pagado) router.refresh();
  }, [pagado, router]);

  if (order.status === "expired" || order.status === "cancelled") {
    return (
      <div className="flex flex-col gap-5">
        <Encabezado
          titulo="El pago no se completó"
          sub="No se hizo ningún cargo. Tu carrito sigue disponible para intentarlo de nuevo."
        />
        <BotonLink href="/?pago=cancelado">Volver al carrito</BotonLink>
      </div>
    );
  }

  if (order.status === "pending_payment") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        {!agotado ? (
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#e2e2e2] border-t-[#FFC600]" />
        ) : null}
        <Encabezado
          titulo={
            agotado ? "Tu pago se está procesando" : "Confirmando tu pago…"
          }
          sub={
            agotado
              ? "Tarda más de lo normal. En cuanto se confirme te avisamos por WhatsApp."
              : "Esto toma unos segundos."
          }
        />
      </div>
    );
  }

  const branch = branchByCode(order.branchCode);
  const cita = order.appointment;
  const dir = order.shippingAddress;
  const agendar = order.quoteId
    ? `/agendar-cita?quote_id=${encodeURIComponent(order.quoteId)}`
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC600] text-2xl text-black">
          ✓
        </span>
        <h2
          className="m-0 text-3xl font-black uppercase leading-none tracking-[0.04em] text-[#0f0f0f]"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          ¡Pago confirmado!
        </h2>
        <p className="m-0 max-w-[380px] text-[14px] leading-relaxed text-[#6b6b6b]">
          Te mandamos la confirmación por WhatsApp
          {order.customerEmail
            ? ` y el comprobante a ${order.customerEmail}`
            : ""}
          .
        </p>
      </div>

      {order.quoteId ? (
        <div className="rounded-2xl border border-[#eaeaea] bg-[#f7f7f5] px-4 py-3.5 text-center">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8a8a]">
            Número de pedido
          </p>
          <p className="m-0 mt-1 font-mono text-[15px] text-[#0f0f0f]">
            {order.quoteId}
          </p>
        </div>
      ) : null}

      {order.fulfillment === "install" && cita ? (
        <div className="rounded-2xl border border-[#eaeaea] bg-[#f7f7f5] px-4 py-3.5">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8a8a]">
            Tu cita de instalación
          </p>
          <p className="m-0 mt-1 text-[15px] font-semibold text-[#0f0f0f]">
            {formatCita(cita.startAt)}
          </p>
          <p className="m-0 text-[13px] text-[#6b6b6b]">
            {branch ? `${branch.name} · ${branch.address}` : order.branchCode}
          </p>
          {cita.status === "failed" ? (
            <p className="m-0 mt-3 rounded-xl border border-[#f3dc8a] bg-[#fff6d6] px-3 py-2.5 text-[13px] text-[#7a5a00]">
              Ese horario se ocupó mientras pagabas. Tu pago está registrado:
              elige otro horario para tu instalación.
            </p>
          ) : cita.status === "pending" ? (
            <p className="m-0 mt-2 text-[12px] text-[#8a8a8a]">
              Estamos apartando tu horario; te lo confirmamos por WhatsApp.
            </p>
          ) : null}
        </div>
      ) : null}

      {order.fulfillment === "delivery" && dir ? (
        <div className="rounded-2xl border border-[#eaeaea] bg-[#f7f7f5] px-4 py-3.5">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8a8a]">
            Envío a domicilio · 2 a 5 días
          </p>
          <p className="m-0 mt-1 text-[14px] text-[#0f0f0f]">
            {[
              dir.address?.line1,
              dir.address?.line2,
              dir.address?.city,
              dir.address?.state,
              dir.address?.postal_code,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      ) : null}

      <Factura sessionId={sessionId} invoice={order.invoice} />

      {agendar &&
      ((order.fulfillment === "install" && cita?.status === "failed") ||
        (!order.fulfillment && order.needsAppointment)) ? (
        <BotonLink href={agendar}>
          {order.kind === "quote" ? "Ver o agendar mi cita" : "Elegir horario"}
        </BotonLink>
      ) : (
        <BotonLink href="/">Volver a la tienda</BotonLink>
      )}
    </div>
  );
}

// --- Factura ------------------------------------------------------------------
// Después de pagar, hasta el fin del mes del pago. Se timbra al enviar el
// formulario y se descarga (PDF y XML).

const RFC_RE = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/;
const formatFechaLimite = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE_CDMX,
  }).format(new Date(new Date(iso).getTime() - 1));

function Factura({
  sessionId,
  invoice,
}: {
  sessionId: string;
  invoice: OrderInvoice | null | undefined;
}) {
  const [emitida, setEmitida] = useState<OrderInvoice | null>(null);
  const [abierto, setAbierto] = useState(false);
  const estado = emitida ?? invoice;
  if (!estado) return null;

  if (estado.status === "issued") {
    const base = `/api/factura/${encodeURIComponent(sessionId)}`;
    return (
      <div className="rounded-2xl border border-[#eaeaea] bg-[#f7f7f5] px-4 py-3.5">
        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a8a8a]">
          Tu factura
        </p>
        <p className="m-0 mt-1 text-[15px] font-semibold text-[#0f0f0f]">
          Folio {estado.serie}-{estado.folio}
        </p>
        <p className="m-0 text-[13px] text-[#6b6b6b]">
          {estado.razonSocial} · {estado.rfc}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a className={BOTON_NEGRO} href={`${base}/pdf`} download>
            Descargar PDF
          </a>
          <a className={BOTON_NEGRO} href={`${base}/xml`} download>
            Descargar XML
          </a>
        </div>
      </div>
    );
  }

  if (estado.status !== "available") {
    return (
      <p className="m-0 rounded-xl border border-[#eaeaea] bg-[#f7f7f5] px-4 py-3 text-[13px] leading-relaxed text-[#6b6b6b]">
        <span className="font-semibold text-[#0f0f0f]">Factura: </span>
        {estado.message}
      </p>
    );
  }

  if (!abierto) {
    return (
      <div className="flex flex-col gap-2">
        {estado.deadline ? (
          <p className="m-0 text-center text-[12px] text-[#8a8a8a]">
            Puedes pedir tu factura hasta el{" "}
            {formatFechaLimite(estado.deadline)}.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className={BOTON_NEGRO}
        >
          Facturar
        </button>
      </div>
    );
  }

  return (
    <FacturaForm
      sessionId={sessionId}
      onCancelar={() => setAbierto(false)}
      onEmitida={setEmitida}
    />
  );
}

function FacturaForm({
  sessionId,
  onCancelar,
  onEmitida,
}: {
  sessionId: string;
  onCancelar: () => void;
  onEmitida: (invoice: OrderInvoice) => void;
}) {
  const [catalogo, setCatalogo] = useState<FiscalCatalog | null>(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [rfc, setRfc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [regimen, setRegimen] = useState("");
  const [cp, setCp] = useState("");
  const [uso, setUso] = useState("");

  useEffect(() => {
    let cancelado = false;
    loadFiscalCatalog().then((c) => {
      if (cancelado) return;
      if (c) setCatalogo(c);
      else setError("No pudimos cargar el formulario. Inténtalo de nuevo.");
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const rfcLimpio = rfc.trim().toUpperCase();
  const rfcOk = RFC_RE.test(rfcLimpio);
  // 12 caracteres = persona moral; 13 = persona física.
  const moral = rfcLimpio.length === 12;
  const regimenes = (catalogo?.regimenes ?? []).filter((r) =>
    !rfcOk ? true : moral ? r.moral : r.fisica,
  );
  const usos = (catalogo?.usos ?? []).filter((u) =>
    u.regimenes.includes(regimen),
  );

  // Al cambiar el RFC o el régimen, se limpia lo que ya no aplica.
  useEffect(() => {
    if (regimen && !regimenes.some((r) => r.clave === regimen)) setRegimen("");
  }, [regimen, regimenes]);
  useEffect(() => {
    if (uso && !usos.some((u) => u.clave === uso)) setUso("");
  }, [uso, usos]);

  const listo =
    rfcOk &&
    razonSocial.trim().length >= 3 &&
    Boolean(regimen) &&
    /^\d{5}$/.test(cp) &&
    Boolean(uso);

  async function onGenerar() {
    if (!listo || enviando) return;
    setError("");
    setEnviando(true);
    try {
      const r = await requestOrderInvoice(sessionId, {
        rfc: rfcLimpio,
        razonSocial: razonSocial.trim(),
        regimenFiscal: regimen,
        codigoPostal: cp,
        usoCfdi: uso,
      });
      if (r.ok) onEmitida(r.invoice);
      else setError(r.message);
    } catch (e) {
      console.error("[pago] factura", e);
      setError("No pudimos generar tu factura. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#eaeaea] bg-[#f7f7f5] p-4">
      <div>
        <p className="m-0 text-[15px] font-semibold text-[#0f0f0f]">
          Datos de facturación
        </p>
        <p className="m-0 mt-1 text-[13px] leading-relaxed text-[#6b6b6b]">
          Escríbelos tal como aparecen en tu Constancia de Situación Fiscal.
        </p>
      </div>
      <Aviso error={error} />
      <Campo
        id="fac-rfc"
        label="RFC"
        value={rfc}
        onChange={(v) =>
          setRfc(
            v
              .toUpperCase()
              .replace(/[^A-ZÑ&0-9]/g, "")
              .slice(0, 13),
          )
        }
        placeholder="12 o 13 caracteres"
        autoComplete="off"
      />
      <Campo
        id="fac-razon"
        label="Nombre o razón social"
        value={razonSocial}
        onChange={setRazonSocial}
        placeholder="Sin S.A. de C.V."
        autoComplete="organization"
      />
      <Selector
        id="fac-regimen"
        label="Régimen fiscal"
        value={regimen}
        onChange={setRegimen}
        disabled={!catalogo}
        opciones={regimenes.map((r) => ({
          value: r.clave,
          label: `${r.clave} · ${r.nombre}`,
        }))}
      />
      <Campo
        id="fac-cp"
        label="Código postal fiscal"
        value={cp}
        onChange={(v) => setCp(soloDigitos(v).slice(0, 5))}
        placeholder="28000"
        inputMode="numeric"
        autoComplete="postal-code"
      />
      <Selector
        id="fac-uso"
        label="Uso de CFDI"
        value={uso}
        onChange={setUso}
        disabled={!regimen}
        placeholder={regimen ? "Elige el uso" : "Elige primero tu régimen"}
        opciones={usos.map((u) => ({
          value: u.clave,
          label: `${u.clave} · ${u.nombre}`,
        }))}
      />
      <Boton onClick={onGenerar} disabled={!listo || enviando}>
        {enviando ? "Generando tu factura…" : "Generar factura"}
      </Boton>
      <Atras onClick={onCancelar} disabled={enviando}>
        Cancelar
      </Atras>
    </div>
  );
}

function Selector({
  id,
  label,
  value,
  onChange,
  opciones,
  disabled,
  placeholder = "Elige una opción",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  opciones: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={INPUT}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// --- Resumen del pedido -------------------------------------------------------

function Resumen({
  lines,
  total,
  nota,
}: {
  lines: SummaryLine[];
  total: number;
  nota: boolean;
}) {
  return (
    <aside className="rounded-[24px] border border-[#0f0f0f] bg-[#0f0f0f] p-5 text-white sm:p-6 lg:sticky lg:top-32">
      <h2 className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#FFC600]">
        Tu pedido
      </h2>
      <ul className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
        {lines.map((line) => (
          <li key={line.key} className="flex items-center gap-3">
            {line.imageUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                <Image
                  className="h-full w-full object-contain"
                  width={64}
                  height={64}
                  alt={line.imageAlt}
                  src={line.imageUrl}
                />
                <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFC600] px-1 text-[11px] font-bold text-black">
                  {line.quantity}
                </span>
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[14px] leading-snug text-white">
                {line.imageUrl ? null : `${line.quantity}× `}
                {line.title}
              </p>
              {nota ? (
                <p className="m-0 text-[12px] text-white/40">
                  Instalación o envío GRATIS
                </p>
              ) : null}
            </div>
            <span className="shrink-0 text-[14px] font-semibold text-white">
              {formatMXN(Number(line.totalAmount))}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-[13px] text-white/55">Total (IVA incluido)</span>
        <strong className="text-2xl text-[#FFC600]">{formatMXN(total)}</strong>
      </div>
    </aside>
  );
}

// --- Piezas de la tarjeta (mismo estilo que /club) --------------------------

function Stepper({ paso }: { paso: Paso }) {
  const indice = PASOS.findIndex((p) => p.id === paso);
  return (
    <ol className="m-0 mb-7 flex list-none items-center gap-1.5 p-0">
      {PASOS.map((p, i) => {
        const hecho = i < indice;
        const activo = i === indice;
        return (
          <li key={p.id} className="flex flex-1 flex-col gap-2">
            <span
              className={`h-1 w-full rounded-full transition-colors ${
                hecho || activo ? "bg-[#FFC600]" : "bg-[#e6e6e3]"
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                activo
                  ? "text-[#b38600]"
                  : hecho
                    ? "text-[#6b6b6b]"
                    : "text-[#b5b5b5]"
              }`}
            >
              {p.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Aviso({ error }: { error: string }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="m-0 mb-5 rounded-xl border border-[#f5c6c1] bg-[#fdecea] px-4 py-3 text-sm text-[#b71c1c]"
    >
      {error}
    </p>
  );
}

function Encabezado({ titulo, sub }: { titulo: string; sub: string }) {
  return (
    <div>
      <h2
        className="m-0 text-[28px] font-black uppercase leading-none tracking-[0.04em] text-[#0f0f0f]"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {titulo}
      </h2>
      <p className="m-0 mt-2 text-[14px] leading-relaxed text-[#6b6b6b]">
        {sub}
      </p>
    </div>
  );
}

const BOTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC600] px-6 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFD34A] hover:shadow-[0_18px_50px_rgba(255,211,74,0.35)] disabled:pointer-events-none disabled:bg-[#ececea] disabled:text-[#a3a3a3]";

const BOTON_NEGRO =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f0f0f] px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[#3a3a3a]";

function Boton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={BOTON}
    >
      {children}
    </button>
  );
}

function BotonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={BOTON}>
      {children}
    </Link>
  );
}

function Atras({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="self-start text-[13px] text-[#6b6b6b] transition-colors hover:text-[#0f0f0f] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "numeric";
  autoComplete?: string;
}) {
  return (
    <div>
      <label className={LABEL} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={INPUT}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function Opcion({
  titulo,
  sub,
  seleccionada,
  onClick,
  compacta,
}: {
  titulo: string;
  sub: string;
  seleccionada: boolean;
  onClick: () => void;
  compacta?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={seleccionada}
      className={`flex items-center gap-3 rounded-2xl border px-4 text-left transition-colors ${
        compacta ? "py-3" : "py-3.5"
      } ${
        seleccionada
          ? "border-[#FFC600] bg-[#FFC600]/10"
          : "border-[#e2e2e2] bg-white hover:border-[#c9c9c9]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          seleccionada ? "border-[#0f0f0f]" : "border-[#c9c9c9]"
        }`}
      >
        {seleccionada ? (
          <span className="h-2.5 w-2.5 rounded-full bg-[#0f0f0f]" />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-[#0f0f0f]">
          {titulo}
        </span>
        <span className="block text-[12px] text-[#8a8a8a]">{sub}</span>
      </span>
    </button>
  );
}
