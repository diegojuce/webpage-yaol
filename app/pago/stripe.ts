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

// /pago/<sesión> (liga de pago): misma paleta que /agendar-cita, fondo claro.
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

// Checkout del sitio (/pago): tarjeta oscura como el formulario de /club.
export const APPEARANCE_DARK: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#FFC600",
    colorBackground: "#1a1a1a",
    colorText: "#ffffff",
    colorTextSecondary: "#9a9a9a",
    colorTextPlaceholder: "#5c5c5c",
    colorDanger: "#f87171",
    fontFamily: FONT,
    fontSizeBase: "15px",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #2e2e2e",
      boxShadow: "none",
      padding: "14px",
    },
    ".Input:focus": {
      border: "1px solid #FFC600",
      boxShadow: "none",
    },
    ".Label": {
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      color: "#8a8a8a",
    },
    ".Tab": {
      border: "1px solid #2e2e2e",
      boxShadow: "none",
    },
    ".Tab--selected": {
      borderColor: "#FFC600",
      boxShadow: "0 0 0 1px #FFC600",
    },
  },
};
