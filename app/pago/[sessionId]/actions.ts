"use server";

import { ShopApiError, updateOrderContact } from "lib/commerce";

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
