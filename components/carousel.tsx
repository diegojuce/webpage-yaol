import ProductCard from "components/product/product-card";
import { getCollectionProducts } from "lib/shopify";

export async function Carousel() {
  // Collections that start with `hidden-*` are hidden from the search page.
  const products = (
    await getCollectionProducts({
      collection: "ovation",
    })
  ).slice(0, 20);

  if (!products?.length) return null;

  // Purposefully duplicating products to make the carousel loop and not run out of products on wide screens.
  const carouselProducts = [...products, ...products, ...products];

  return (
    <div className="w-full overflow-x-auto pb-6 pt-1">
      <ul className="flex animate-carousel gap-5">
        {carouselProducts.map((product, i) => (
          <li
            key={`${product.handle}${i}`}
            className="flex-none w-[260px] max-w-[280px] md:w-[300px]"
          >
            <ProductCard product={product} className="h-full w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
