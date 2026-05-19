import {
  Bento,
  Brands,
  CtaBand,
  FeaturedTires,
  Hero,
  Locations,
  Paquetes,
  QuickAccess,
  Services,
  Stats,
  Testimonials,
} from "components/home/landing";
import Footer from "components/layout/footer";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Llantas y llantera en Colima · Cita en línea | Yantissimo",
  description:
    "Llantera con 7 sucursales en Colima, Villa de Álvarez y Manzanillo. Cotiza y agenda en línea: llantas, alineación 3D, frenos, afinación y balanceo. Montaje incluido. Distribuidores oficiales Michelin, Bridgestone y Continental.",
  alternates: { canonical: "/" },
  keywords: [
    "llantera en colima",
    "llanteras en colima",
    "llantas colima",
    "llantera villa de álvarez",
    "llantera manzanillo",
    "alineación y balanceo colima",
    "yantissimo",
  ],
  openGraph: {
    title: "Llantas y llantera en Colima · Yantissimo",
    description:
      "7 sucursales en Colima y Manzanillo. Cotiza llantas y agenda servicio en línea con montaje + balanceo incluidos.",
    url: "https://yantissimo.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Llantas y llantera en Colima · Yantissimo",
    description:
      "7 sucursales en Colima y Manzanillo. Cotiza y agenda en línea con montaje + balanceo incluidos.",
  },
};

export default async function HomePage() {
  return (
    <>
      <div style={{ marginTop: "var(--masthead-offset, 6rem)" }}>
        <Hero />
        <QuickAccess />
        <Brands />
        <FeaturedTires />
        <Paquetes />
        <Services />
        <Bento />
        <Locations />
        <Stats />
        <Testimonials />
        <CtaBand />
        <Footer />
      </div>
    </>
  );
}
