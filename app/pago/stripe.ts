// Stripe del lado del navegador para las páginas de pago: una sola carga de
// Stripe.js y la apariencia de los iframes (tarjeta) con la paleta del sitio.
import type { Appearance } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

let stripePromise: ReturnType<typeof loadStripe> | null = null;
export const getStripe = () =>
  (stripePromise ??= loadStripe(PUBLISHABLE_KEY, { locale: "es-419" }));

const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

// Misma paleta que /agendar-cita, fondo claro (/pago y /pago/<sesión>).
export const APPEARANCE_LIGHT: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#0f0f0f",
    colorBackground: "#ffffff",
    colorText: "#0f0f0f",
    colorTextSecondary: "#6b6b6b",
    colorDanger: "#e53935",
    fontFamily: FONT,
    fontSizeBase: "15px",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e2e2e2",
      boxShadow: "none",
      padding: "14px",
    },
    ".Input:focus": {
      border: "1px solid #ffc600",
      boxShadow: "0 0 0 3px rgba(255, 198, 0, 0.25)",
    },
    ".Label": {
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "#6b6b6b",
    },
    ".Tab--selected": {
      borderColor: "#ffc600",
      boxShadow: "0 0 0 1px #ffc600",
    },
  },
};
