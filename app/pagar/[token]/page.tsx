// agendar → pagar: liga de pago de una cotización que ya existe (la mandan el
// bot, el ERP o la app). Muestra la cotización y abre Stripe Checkout por su
// saldo; al pagar, Stripe regresa a /agendar-cita?session_id=… como en una
// compra del carrito.
import "../../agendar-cita/agendar-cita.css";

import type { Metadata } from "next";
import Link from "next/link";
import { CART_BRANCHES, backendBranchCode } from "components/cart/branches";
import { getQuoteLink } from "lib/commerce";
import { COMMERCE_PROVIDER } from "lib/commerce-status";
import PayButton from "./pay-button";

export const metadata: Metadata = {
  title: "Paga tu cotización | Yantissimo",
  robots: { index: false, follow: false },
};

const formatMXN = (cents: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    cents / 100,
  );

function Screen({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="yt-agendar-page"
      style={{ paddingTop: "7rem", minHeight: "100vh" }}
    >
      <main className="success">
        <div className="success__card">
          <p className="success__eyebrow">{eyebrow}</p>
          <h1 className="success__title">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}

export default async function PagarPage(props: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ pago?: string }>;
}) {
  const { token } = await props.params;
  const { pago } = await props.searchParams;

  if (COMMERCE_PROVIDER !== "native") {
    return (
      <Screen eyebrow="PAGO EN LÍNEA" title="Disponible muy pronto">
        <p className="success__lead">
          Por ahora puedes pagar tu cotización en cualquiera de nuestras
          sucursales.
        </p>
      </Screen>
    );
  }

  const link = await getQuoteLink(token).catch((e) => {
    console.error("[pagar] getQuoteLink", e);
    return undefined;
  });

  if (!link) {
    return (
      <Screen eyebrow="LIGA NO ENCONTRADA" title="Esta liga ya no es válida">
        <p className="success__lead">
          Puede que haya vencido. Escríbenos por WhatsApp y te mandamos una
          nueva.
        </p>
      </Screen>
    );
  }

  if (link.paid) {
    return (
      <Screen
        eyebrow="COTIZACIÓN PAGADA"
        title="Esta cotización ya está pagada"
      >
        <p className="success__lead">Solo falta agendar tu cita.</p>
        <div className="success__actions">
          <Link className="cta" href={`/agendar-cita?quote_id=${link.quoteId}`}>
            Agendar cita <span className="cta__arrow">→</span>
          </Link>
        </div>
      </Screen>
    );
  }

  if (!link.open) {
    return (
      <Screen
        eyebrow="COTIZACIÓN CERRADA"
        title="Esta cotización ya no está activa"
      >
        <p className="success__lead">Escríbenos por WhatsApp para ayudarte.</p>
      </Screen>
    );
  }

  const branch = CART_BRANCHES.find(
    (b) => backendBranchCode(b.id) === link.branchCode,
  );
  const firstName = link.clientName.trim().split(/\s+/)[0];

  return (
    <Screen
      eyebrow={`COTIZACIÓN ${link.quoteId}`}
      title={firstName ? `Hola, ${firstName}` : "Paga tu cotización"}
    >
      {pago === "cancelado" ? (
        <p className="success__lead">
          El pago se canceló y no se hizo ningún cargo. Puedes intentarlo de
          nuevo.
        </p>
      ) : (
        <p className="success__lead">
          Revisa tu cotización y paga en línea con tarjeta.
        </p>
      )}
      <div className="success__detail">
        {link.lines.map((line, i) => (
          <div className="success__row" key={i}>
            <span>
              {line.quantity}× {line.title}
            </span>
            <strong>
              {line.totalCents > 0 ? formatMXN(line.totalCents) : "Incluido"}
            </strong>
          </div>
        ))}
        {branch ? (
          <div className="success__row">
            <span>Sucursal</span>
            <strong>{branch.name}</strong>
          </div>
        ) : null}
        {link.paidCents > 0 ? (
          <div className="success__row">
            <span>Ya pagado</span>
            <strong>−{formatMXN(link.paidCents)}</strong>
          </div>
        ) : null}
        <div className="success__row">
          <span>Total a pagar (IVA incluido)</span>
          <strong>{formatMXN(link.dueCents)}</strong>
        </div>
      </div>
      <PayButton token={token} label={`Pagar ${formatMXN(link.dueCents)}`} />
    </Screen>
  );
}
