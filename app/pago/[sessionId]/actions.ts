"use server";

import {
  getFiscalCatalog,
  requestInvoice,
  ShopApiError,
  updateOrderContact,
  type FiscalCatalog,
  type InvoiceRequest,
  type OrderInvoice,
} from "lib/commerce";

export type SaveContactResult = { ok: true } | { ok: false; message: string };

// Nombre y email del formulario de pago; se guardan antes de confirmar.
export async function saveCheckoutContact(
  sessionId: string,
  contact: { name: string; email: string },
): Promise<SaveContactResult> {
  try {
    await updateOrderContact(sessionId, contact);
    return { ok: true };
  } catch (e) {
    if (e instanceof ShopApiError && e.status < 500) {
      return { ok: false, message: e.message };
    }
    console.error("[pago] updateOrderContact", e);
    return {
      ok: false,
      message: "No se pudieron guardar tus datos. Inténtalo de nuevo.",
    };
  }
}

// Regímenes y usos de CFDI para el formulario de factura.
export async function loadFiscalCatalog(): Promise<FiscalCatalog | null> {
  try {
    return await getFiscalCatalog();
  } catch (e) {
    console.error("[pago] getFiscalCatalog", e);
    return null;
  }
}

export type RequestInvoiceResult =
  | { ok: true; invoice: OrderInvoice }
  | { ok: false; message: string };

// Timbra la factura del pedido pagado con los datos fiscales del cliente.
export async function requestOrderInvoice(
  sessionId: string,
  data: InvoiceRequest,
): Promise<RequestInvoiceResult> {
  try {
    return { ok: true, invoice: await requestInvoice(sessionId, data) };
  } catch (e) {
    if (e instanceof ShopApiError && e.status < 500) {
      return { ok: false, message: e.message };
    }
    console.error("[pago] requestInvoice", e);
    return {
      ok: false,
      message:
        e instanceof ShopApiError && e.status === 504
          ? e.message
          : "No pudimos generar tu factura. Inténtalo de nuevo en unos minutos.",
    };
  }
}
