// Descarga del PDF o XML de la factura de un pedido. El id del pago en Stripe
// (`pi_…`, o `cs_…` en pedidos anteriores a la Fase 5A) es la llave, igual que
// en la confirmación de /pago; el backend se llama desde el servidor con
// BACKEND_API_TOKEN.
import { fetchInvoiceFile } from "lib/commerce";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  props: { params: Promise<{ sessionId: string; formato: string }> },
) {
  const { sessionId, formato } = await props.params;
  if (formato !== "pdf" && formato !== "xml") {
    return new Response("Not found", { status: 404 });
  }
  const res = await fetchInvoiceFile(sessionId, formato).catch((e) => {
    console.error("[factura] descarga", e);
    return null;
  });
  if (!res?.body) return new Response("Factura no encontrada", { status: 404 });
  return new Response(res.body, {
    headers: {
      "Content-Type":
        res.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition":
        res.headers.get("content-disposition") ??
        `attachment; filename="factura.${formato}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
