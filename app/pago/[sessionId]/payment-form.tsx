"use client";

// Formulario de pago de las ligas de cotización (agendar → pagar): Payment
// Element sobre el PaymentIntent que abrió el backend. El carrito paga en /pago
// (checkout.tsx). Los campos de tarjeta son iframes de Stripe con nuestro
// estilo; nombre y email son nuestros. confirmPayment() resuelve el 3D Secure
// en un modal, sin salir de la página, y al terminar se va a la confirmación
// de /pago?payment_intent=… (el pedido lo marca pagado el webhook).
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  APPEARANCE_LIGHT,
  confirmacionUrl,
  getStripe,
  PUBLISHABLE_KEY,
} from "../stripe";
import { saveCheckoutContact } from "./actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  paymentId: string;
  clientSecret: string;
  returnUrl: string;
  totalLabel: string;
  defaultName: string;
  defaultEmail: string;
};

export default function PaymentForm(props: Props) {
  const options = useMemo(
    () => ({ clientSecret: props.clientSecret, appearance: APPEARANCE_LIGHT }),
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
    <Elements stripe={getStripe()} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
}

function CheckoutForm({
  paymentId,
  returnUrl,
  totalLabel,
  defaultName,
  defaultEmail,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [listo, setListo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = !stripe || !elements || !listo;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

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

    // confirmPayment() va antes de cualquier await: Apple Pay solo abre dentro
    // del gesto del clic. El contacto se guarda en paralelo; termina mucho
    // antes de que llegue el webhook.
    const pago = stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: returnUrl,
        receipt_email: cleanEmail,
        payment_method_data: {
          billing_details: { name: cleanName, email: cleanEmail },
        },
      },
    });
    const guardado = saveCheckoutContact(paymentId, {
      name: cleanName,
      email: cleanEmail,
    }).catch((e) => ({ ok: false as const, message: String(e) }));

    try {
      const result = await pago;
      if (result.error) return fail(result.error.message);
      const saved = await guardado;
      if (!saved.ok) console.error("[pago] contacto", saved.message);
    } catch (e) {
      console.error("[pago] confirmPayment", e);
      return fail();
    }

    // Se queda en "procesando" mientras navega.
    router.replace(confirmacionUrl(paymentId));
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

      <section className="pago-section">
        <h2 className="pago-section__title">Pago con tarjeta</h2>
        {loading ? <div className="pago-skeleton" aria-hidden /> : null}
        <PaymentElement
          options={{ layout: "tabs" }}
          onReady={() => setListo(true)}
          onLoadError={(e) =>
            setError(
              e.error.message || "No se pudo cargar el formulario de pago.",
            )
          }
        />
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
