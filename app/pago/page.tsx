// Checkout del sitio para el carrito: tus datos → cita o envío → pago →
// confirmación, con la tarjeta de pasos de /club. "Completar pago" del carrito
// llega aquí; al pagar, la URL pasa a /pago?session_id=… (el webhook marca el
// pedido pagado y agenda la cita). Las ligas de cotización pagan en
// /pago/<sesión>.
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart, getOrderBySession } from "lib/commerce";
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
    <div className="mt-28 min-h-screen bg-[#0F0F0F] text-white">{children}</div>
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
        <p className="m-0 text-[13px] font-bold uppercase tracking-[0.22em] text-[#FFD34A]">
          {eyebrow}
        </p>
        <h1
          className="m-0 text-4xl font-black uppercase leading-none tracking-[0.04em]"
          style={{ fontFamily: DISPLAY_FONT }}
        >
          {title}
        </h1>
        <p className="m-0 text-[15px] leading-relaxed text-white/60">
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
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await props.searchParams;

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
  if (sessionId) {
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
          action={{ href: "/?pago=cancelado", label: "Volver al carrito" }}
        />
      );
    }
    if (order.kind === "quote") {
      redirect(`/agendar-cita?session_id=${encodeURIComponent(sessionId)}`);
    }
    const { clientSecret: _secret, ...publicOrder } = order;
    return (
      <Shell>
        <Checkout
          key={sessionId}
          mode="confirm"
          sessionId={sessionId}
          order={publicOrder}
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
