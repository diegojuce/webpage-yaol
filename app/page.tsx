import { Carousel } from "components/carousel";
import { ThreeItemGrid } from "components/grid/three-items";
import Footer from "components/layout/footer";
import ProductCard from "components/product/product-card";
import { getProducts } from "lib/shopify";

export const dynamic = "force-dynamic";
export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js, Vercel, and Shopify.",
  openGraph: {
    type: "website",
  },
};

const SERVICES = [
  { title: "AFINACIÓN", subtitle: "mayor y menor" },
  { title: "VENTA Y MONTAJE", subtitle: "de llantas" },
  { title: "ALINEACIÓN 3D", subtitle: "y escantillón" },
  { title: "SUSPENSIÓN", subtitle: "y amortiguadores" },
  { title: "RECARGA", subtitle: "de nitrógeno" },
  { title: "FRENOS", subtitle: "y balatas" },
  { title: "BALANCEO", subtitle: "pro" },
];

export default async function HomePage() {
  // Productos más recientes publicados en Custom Storefronts
  const products = await getProducts({
    query: "255/55 R20",
    sortKey: "CREATED_AT",
    reverse: true,
  });
  const recentProducts = products.slice(0, 12);

  return (
    <>
      <ThreeItemGrid />
      <Carousel />
      <section
        id="servicios"
        aria-labelledby="services-heading"
        className="servicios"
      >
        <header className="servicios__head">
          <p>CONOCE NUESTROS</p>
          <h2 id="services-heading">SERVICIOS</h2>
        </header>
        <div className="servicios__grid">
          {SERVICES.map((service) => (
            <article key={service.title} tabIndex={0} className="svc-card">
              <div className="svc-card__icon">{/* ICONO */}</div>
              <h3 className="svc-card__title">{service.title}</h3>
              <p className="svc-card__subtitle">{service.subtitle}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
