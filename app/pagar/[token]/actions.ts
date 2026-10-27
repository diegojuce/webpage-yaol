"use server";

import { ShopApiError, startQuoteCheckout } from "lib/commerce";
import { COMMERCE_PROVIDER } from "lib/commerce-status";
import { headers } from "next/headers";

// Origen del sitio (preview, producción o local) al que Stripe regresa.
async function returnOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export type PayQuoteResult =
  | { ok: true; paymentId: string }
  | { ok: false; message: string };

// agendar → pagar: abre el cobro (PaymentIntent) por el saldo de la
// cotización; el formulario se pinta en /pago/<paymentId>.
export async function payQuote(token: string): Promise<PayQuoteResult> {
  if (COMMERCE_PROVIDER !== "native") {
    return {
      ok: false,
      message: "El pago en línea no está disponible por ahora.",
    };
  }
  try {
    const cobro = await startQuoteCheckout(token, await returnOrigin());
    return { ok: true, paymentId: cobro.paymentId };
  } catch (e) {
    if (e instanceof ShopApiError && e.status < 500) {
      return { ok: false, message: e.message };
    }
    console.error("[pagar] startQuoteCheckout", e);
    return {
      ok: false,
      message: "No se pudo iniciar el pago. Inténtalo de nuevo.",
    };
  }
}
