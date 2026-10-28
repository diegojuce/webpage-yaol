// Checkout del sitio para el carrito: tus datos → cita o envío → pago →
// confirmación, con la tarjeta de pasos de /club. "Completar pago" del carrito
// llega aquí; al pagar, la URL pasa a /pago?payment_intent=pi_… (el webhook
// marca el pedido pagado y agenda la cita; `session_id=cs_…` en los pedidos
// anteriores a la Fase 5A). Las ligas de cotización pagan en /pago/<pi_…> y
// también terminan en esta confirmación, donde se pide la factura.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart, getOrderBySession, getOrderLineImages } from "lib/commerce";
import { COMMERCE_PROVIDER } from "lib/commerce-status";
import Checkout, { type SummaryLine } from "./checkout";

export const metadata: Metadata = {
  title: "Pago | Yantissimo",
  robots: { index: false, follow: false },
};

const DISPLAY_FONT =
  "var(--font-staatliches), var(--font-fjalla), Impact, sans-serif";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-28 min-h-screen bg-[#f4f4f2] text-[#0f0f0f]">
      {children}
    </div>
  );
}

function Screen({
  eyebrow,
  title,
  message,
  action,
}: {
  eyebrow: string;
  title: string;
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <Shell>
      <main className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#d19d00]">
          {eyebrow}
        </p>
        <h1
          className="m-0 text-4xl font-black uppercase leading-none tracking-[0.04em]"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h1>
        <p className="m-0 text-[15px] leading-relaxed text-[#6b6b6b]">
          {message}
        </p>
        {action ? (
          <Link
            href={action.href}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFC600] px-7 py-4 text-sm font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#FFD34A]"
          >
            {action.label} →
          </Link>
        ) : null}
      </main>
    </Shell>
  );
}

export default async function PagoPage(props: {
  searchParams: Promise<{
    payment_intent?: string;
    session_id?: string;
    redirect_status?: string;
  }>;
}) {
  const sp = await props.searchParams;
  // Stripe regresa con ?payment_intent=…&redirect_status=… si el pago salió
  // del sitio (no pasa con tarjeta: el 3D Secure va en un modal).
  const paymentId = sp.payment_intent ?? sp.session_id;

  if (COMMERCE_PROVIDER !== "native") {
    return (
      <Screen
        eyebrow="PAGO EN LÍNEA"
        title="Disponible muy pronto"
        message="Por ahora puedes pagar en cualquiera de nuestras sucursales."
      />
    );
  }

  // Confirmación: después de pagar (o al recargar la página).
  if (paymentId) {
    const order = await getOrderBySession(paymentId).catch((e) => {
      console.error("[pago] getOrderBySession", e);
      return undefined;
    });
    if (!order) {
      return (
        <Screen
          eyebrow="PAGO NO ENCONTRADO"
          title="No encontramos este pago"
          message="Vuelve a tu carrito para intentarlo de nuevo."
          action={{ href: "/?pago=cancelado", label: "Volver al carrito" }}
        />
      );
    }
    // El pago fuera del sitio falló: se reintenta con el mismo cobro.
    if (
      sp.redirect_status === "failed" &&
      order.status === "pending_payment" &&
      order.clientSecret
    ) {
      redirect(`/pago/${encodeURIComponent(paymentId)}`);
    }
    const { clientSecret: _secret, ...publicOrder } = order;
    const lineImages = await getOrderLineImages(order.lines);
    return (
      <Shell>
        <Checkout
          key={paymentId}
          mode="confirm"
          paymentId={paymentId}
          order={publicOrder}
          lineImages={lineImages}
        />
      </Shell>
    );
  }

  const cart = await getCart().catch((e) => {
    console.error("[pago] getCart", e);
    return undefined;
  });
  if (!cart || cart.lines.length === 0) {
    return (
      <Screen
        eyebrow="TU CARRITO"
        title="Tu carrito está vacío"
        message="Agrega tus llantas para completar tu pedido."
        action={{ href: "/search", label: "Ver llantas" }}
      />
    );
  }

  const lines: SummaryLine[] = cart.lines.map((line) => ({
    key: line.id ?? line.merchandise.id,
    title: line.merchandise.product.title,
    quantity: line.quantity,
    totalAmount: line.cost.totalAmount.amount,
    imageUrl: line.merchandise.product.featuredImage?.url ?? null,
    imageAlt:
      line.merchandise.product.featuredImage?.altText ||
      line.merchandise.product.title,
  }));
  const attribute = (key: string) =>
    cart.attributes?.find((a) => a.key === key)?.value?.trim() ?? "";

  return (
    <Shell>
      <Checkout
        key="cart"
        mode="cart"
        lines={lines}
        totalAmount={cart.cost.totalAmount.amount}
        initialPhone={attribute("telefono")}
        initialBranchCode={attribute("sucursal").toUpperCase()}
      />
    </Shell>
  );
}
