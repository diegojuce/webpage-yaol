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

export default async function HomePage() {
  // Productos más recientes publicados en Custom Storefronts
  const products = await getProducts({ sortKey: "CREATED_AT", reverse: true });
  const recentProducts = products.slice(0, 12);

  return (
    <>
      <ThreeItemGrid />
      <Carousel />
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
