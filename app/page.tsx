import { ThreeItemGrid } from "components/grid/three-items";
import Footer from "components/layout/footer";
import { getProducts } from "lib/shopify";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js, Vercel, and Shopify.",
  openGraph: {
    type: "website",
  },
};

const SERVICES = [
  { 
    title: "AFINACIÓN", 
    subtitle: "MAYOR Y MENOR", 
    icon: (
      <Image
        src="/Recurso 3.svg"
        alt="Icono de afinación"
        width={64}
        height={64}
        priority
      />
    ),
    
  
  },
  { title: "VENTA Y MONTAJE", 
    subtitle: "DE LLANTAS",
    icon: (
      <Image
        src="/Recurso 4.svg"
        alt="Icono de afinación"
        width={64}
        height={64}
        priority
      />
    ), 
  
  },
  { title: "ALINEACIÓN 3D", 
    subtitle: "Y ESCANTILLÓN", 
    icon: (
      <Image
        src="/Recurso 5.svg"
        alt="Icono de afinación"
        width={64}
        height={64}
        priority
      />
    ), 
  
  },
  { title: "SUSPENSIÓN", 
    subtitle: "Y AMORTIGUADORES", 
    icon: (
      <Image
        src="/Recurso 6.svg"
        alt="Icono de afinación"
        width={64}
        height={64}
        priority
      />
    ), 
  },
  { title: "RECARGA", 
    subtitle: "DE NITRÓGENO", 
    icon: (
      <Image
        src="/Recurso 7.svg"
        alt="Icono de afinación"
        width={64}
        height={64}
        priority
      />
    ), 
  },
  { title: "FRENOS", 
    subtitle: "Y BALATAS", 
    icon: (
      <Image
        src="/Recurso 8.svg"
        alt="Icono de afinación"
        width={64}
        height={64}
        priority
      />
    ), 
  },
  { title: "BALANCEO", 
    subtitle: "PRO",
    icon: (
      <Image
        src="/Recurso 9.svg"
        alt="Icono de afinación"
        width={64}
        height={64}
        priority
      />
    ),  
  },
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
      {/* <Carousel /> */}
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
              <div className="svc-card__icon">{service.icon}</div>
              <h3 className="svc-card__title">{service.title}</h3>
              <p className="svc-card__subtitle">{service.subtitle}</p>
            </article>
          ))}
        </div>
      </section>
      {/* <div className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div> */}
      <Footer />
    </>
  );
}
