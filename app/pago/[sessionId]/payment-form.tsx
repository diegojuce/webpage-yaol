"use client";

// Formulario de pago de las ligas de cotización (agendar → pagar): Stripe
// Checkout en modo `elements`. El carrito paga en /pago (checkout.tsx).
// Los campos de tarjeta (y la dirección, si hay envío) son iframes de Stripe
// con nuestro estilo; nombre y email son nuestros. confirm() resuelve el 3D
// Secure en un modal, sin salir de la página, y al terminar se va a la
// confirmación de /pago?session_id=… (el pedido lo marca pagado el webhook).
import {
  CheckoutElementsProvider,
  PaymentElement,
  ShippingAddressElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { APPEARANCE_LIGHT, getStripe, PUBLISHABLE_KEY } from "../stripe";
import { saveCheckoutContact } from "./actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  sessionId: string;
  clientSecret: string;
  hasDelivery: boolean;
  totalLabel: string;
  defaultName: string;
  defaultEmail: string;
};

export default function PaymentForm(props: Props) {
  const options = useMemo(
    () => ({
      clientSecret: props.clientSecret,
      elementsOptions: { appearance: APPEARANCE_LIGHT },
    }),
    [props.clientSecret],
  );

  if (!PUBLISHABLE_KEY) {
    return (
      <p className="pago-alert" role="alert">
        El pago en línea no está disponible por ahora.
      </p>
    );
  }

  return (
    <CheckoutElementsProvider stripe={getStripe()} options={options}>
      <CheckoutForm {...props} />
    </CheckoutElementsProvider>
  );
}

function CheckoutForm({
  sessionId,
  hasDelivery,
  totalLabel,
  defaultName,
  defaultEmail,
}: Props) {
  const state = useCheckoutElements();
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.type === "error") {
    return (
      <p className="pago-alert" role="alert">
        {state.error.message || "No se pudo cargar el formulario de pago."}
      </p>
    );
  }

  const loading = state.type === "loading";
  const doneUrl = `/pago?session_id=${encodeURIComponent(sessionId)}`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (state.type !== "success" || submitting) return;

    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim();
    if (cleanName.length < 2) {
      setError("Escribe tu nombre completo.");
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      setError("Escribe un email válido.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const fail = (message?: string) => {
      setError(message || "No se pudo completar el pago. Inténtalo de nuevo.");
      setSubmitting(false);
    };

    try {
      const saved = await saveCheckoutContact(sessionId, {
        name: cleanName,
        email: cleanEmail,
      });
      if (!saved.ok) return fail(saved.message);

      // Sin returnUrl: ya viene en la sesión (Stripe lo rechaza si se repite).
      const result = await state.checkout.confirm({
        email: cleanEmail,
        redirect: "if_required",
      });
      if (result.type === "error") return fail(result.error.message);
    } catch (e) {
      console.error("[pago] confirm", e);
      return fail();
    }

    // Se queda en "procesando" mientras navega.
    router.replace(doneUrl);
  };

  return (
    <form className="pago-form" onSubmit={handleSubmit} noValidate>
      <section className="pago-section">
        <h2 className="pago-section__title">Tus datos</h2>
        <label className="pago-field">
          <span className="pago-field__label">Nombre completo</span>
          <input
            className="pago-field__input"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como aparece en tu tarjeta"
            disabled={submitting}
          />
        </label>
        <label className="pago-field">
          <span className="pago-field__label">Email</span>
          <input
            className="pago-field__input"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Para enviarte tu comprobante"
            disabled={submitting}
          />
        </label>
      </section>

      {hasDelivery ? (
        <section className="pago-section">
          <h2 className="pago-section__title">Dirección de envío</h2>
          <ShippingAddressElement />
        </section>
      ) : null}

      <section className="pago-section">
        <h2 className="pago-section__title">Pago con tarjeta</h2>
        {loading ? <div className="pago-skeleton" aria-hidden /> : null}
        <PaymentElement options={{ layout: "tabs" }} />
      </section>

      {error ? (
        <p className="pago-alert" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className={`cta pago-submit ${submitting ? "cta--loading" : ""}`}
        disabled={loading || submitting}
      >
        {submitting ? (
          <>
            <span className="cta__spin" /> Procesando…
          </>
        ) : (
          <>
            Pagar {totalLabel} <span className="cta__arrow">→</span>
          </>
        )}
      </button>
      <p className="pago-secure">
        Pago seguro procesado por Stripe. Yantissimo no guarda los datos de tu
        tarjeta.
      </p>
    </form>
  );
}
