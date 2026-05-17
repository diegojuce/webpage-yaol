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
  description:
    "Compra llantas y agenda servicios en linea con Yantissimo, tu mejor opción",
  openGraph: {
    type: "website",
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
