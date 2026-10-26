// Página de pago dentro del sitio, para los dos flujos: el carrito (comprar →
// agendar) y la liga de una cotización (agendar → pagar) llegan aquí con la
// sesión de Stripe que abrió el backend. Al pagar se sigue a la confirmación
// de /pago (factura y "Elegir horario").
import "../../agendar-cita/agendar-cita.css";
import "../pago.css";

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrderBySession } from "lib/commerce";
import { COMMERCE_PROVIDER } from "lib/commerce-status";
import PaymentForm from "./payment-form";

export const metadata: Metadata = {
  title: "Pago | Yantissimo",
  robots: { index: false, follow: false },
};

const formatMXN = (cents: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    cents / 100,
  );

const formatHour = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Mexico_City",
  }).format(new Date(iso));

function Screen({
  eyebrow,
  title,
  message,
  action,
}: {
  eyebrow: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="yt-agendar-page" style={{ paddingTop: "7rem" }}>
      <main className="success">
        <div className="success__card">
          <p className="success__eyebrow">{eyebrow}</p>
          <h1 className="success__title">{title}</h1>
          <p className="success__lead">{message}</p>
          {action ? <div className="success__actions">{action}</div> : null}
        </div>
      </main>
    </div>
  );
}

const backToCart = (
  <Link className="cta" href="/?pago=cancelado">
    Volver al carrito <span className="cta__arrow">→</span>
  </Link>
);

export default async function PagoPage(props: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await props.params;

  if (COMMERCE_PROVIDER !== "native") {
    return (
      <Screen
        eyebrow="PAGO EN LÍNEA"
        title="Disponible muy pronto"
        message="Por ahora puedes pagar en cualquiera de nuestras sucursales."
      />
    );
  }

  const order = await getOrderBySession(sessionId).catch((e) => {
    console.error("[pago] getOrderBySession", e);
    return undefined;
  });

  if (!order) {
    return (
      <Screen
        eyebrow="PAGO NO ENCONTRADO"
        title="No encontramos este pago"
        message="Vuelve a tu carrito para intentarlo de nuevo."
        action={backToCart}
      />
    );
  }

  if (order.status === "paid") {
    redirect(`/pago?session_id=${encodeURIComponent(sessionId)}`);
  }

  if (!order.clientSecret) {
    return (
      <Screen
        eyebrow="PAGO VENCIDO"
        title="Este pago ya no está disponible"
        message={
          order.kind === "cart"
            ? "Pasó el tiempo para pagar o lo reemplazaste por otro. No se hizo ningún cargo; tu carrito sigue disponible."
            : "Pasó el tiempo para pagar. No se hizo ningún cargo; abre otra vez la liga que te mandamos por WhatsApp."
        }
        action={order.kind === "cart" ? backToCart : undefined}
      />
    );
  }

  return (
    <div className="yt-agendar-page yt-pago" style={{ paddingTop: "7rem" }}>
      <main className="pago-layout">
        <div className="page-head">
          <p className="eyebrow">PAGO SEGURO</p>
          <h1 className="display-title">COMPLETA TU PAGO</h1>
          <p className="lead">
            {order.kind === "cart"
              ? `Tus llantas quedan apartadas hasta las ${formatHour(order.expiresAt)}.`
              : `Tienes hasta las ${formatHour(order.expiresAt)} para completar este pago.`}
          </p>
        </div>

        <div className="pago-grid">
          <aside className="pago-summary">
            <h2 className="pago-section__title">Tu pedido</h2>
            <ul className="pago-lines">
              {order.lines.map((line, i) => (
                <li key={i} className="pago-line">
                  <span className="pago-line__title">
                    {line.quantity}× {line.title}
                    {line.fulfillment ? (
                      <span className="pago-line__sub">
                        {line.fulfillment === "delivery"
                          ? "Envío a domicilio · GRATIS"
                          : "Instalación en sucursal · GRATIS"}
                      </span>
                    ) : null}
                  </span>
                  <strong>
                    {line.unitPriceCents > 0
                      ? formatMXN(line.unitPriceCents * line.quantity)
                      : "Incluido"}
                  </strong>
                </li>
              ))}
            </ul>
            <div className="pago-total">
              <span>Total (IVA incluido)</span>
              <strong>{formatMXN(order.totalCents)}</strong>
            </div>
            {order.kind === "cart" ? (
              <Link className="pago-back" href="/?pago=cancelado">
                ← Volver al carrito
              </Link>
            ) : null}
          </aside>

          <section className="pago-card">
            <PaymentForm
              sessionId={sessionId}
              clientSecret={order.clientSecret}
              hasDelivery={order.hasDelivery}
              totalLabel={formatMXN(order.totalCents)}
              defaultName={order.customerName ?? ""}
              defaultEmail={order.customerEmail ?? ""}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
