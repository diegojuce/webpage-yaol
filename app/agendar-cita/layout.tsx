import type { ReactNode } from "react";

export const metadata = {
  title: "Agenda tu cita · Llantera en Colima | Yantissimo",
  description:
    "Agenda en línea tu cambio de llantas, alineación 3D, balanceo, frenos o afinación en cualquiera de las 7 sucursales Yantissimo en Colima, Villa de Álvarez y Manzanillo.",
  alternates: { canonical: "/agendar-cita" },
  openGraph: {
    title: "Agenda tu cita · Yantissimo",
    description:
      "Reserva tu servicio en la llantera Yantissimo. 7 sucursales en Colima y Manzanillo.",
    url: "https://yantissimo.com/agendar-cita",
    type: "website",
  },
};

export default function AgendarCitaLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
