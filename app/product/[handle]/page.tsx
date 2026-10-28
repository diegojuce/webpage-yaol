import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "components/layout/footer";
import { Gallery } from "components/product/gallery";
import { ProductProvider } from "components/product/product-context";
import { ProductDescription } from "components/product/product-description";
import { RelatedProductsCarousel } from "components/product/related-products-carousel";
import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import { getProduct, getProductRecommendations } from "lib/commerce";
import { Image } from "lib/commerce/types";
import { baseUrl } from "lib/utils";
import { Suspense } from "react";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const { url, width, height, altText: alt } = product.featuredImage || {};
  const indexable = !product.tags.includes(HIDDEN_PRODUCT_TAG);

  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: url
      ? {
          images: [
            {
              url,
              width,
              height,
              alt,
            },
          ],
        }
      : null,
  };
}

export default async function ProductPage(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) return notFound();

  const sku = product.variants?.[0]?.sku;
  const brand = product.vendor || product.tags?.[0];
  const images = product.featuredImage?.url
    ? [product.featuredImage.url]
    : product.images.map((image: Image) => image.url);
  const description =
    product.description?.trim() || product.seo?.description || product.title;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description,
    image: images,
    ...(sku ? { sku, mpn: sku } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    offers: {
      "@type": "Offer",
      url: `${baseUrl}/product/${product.handle}`,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <ProductProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <div className="mx-auto max-w-(--breakpoint-2xl)  mt-5 pt-20 ">
        <div className="flex flex-col  border border-neutral-200 bg-white p-8 text-black md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-200 dark:bg-white dark:text-black">
          <div className="h-full w-full basis-full lg:basis-3/6">
            <Suspense
              fallback={
                <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden" />
              }
            >
              <Gallery
                images={product.images.slice(0, 5).map((image: Image) => ({
                  src: image.url,
                  altText: image.altText,
                }))}
              />
            </Suspense>
          </div>

          <div className="basis-full lg:basis-3/6">
            <Suspense fallback={null}>
              <ProductDescription
                product={product}
                descriptions={product.description
                  .split(/\r?\n/)
                  .map((description) => description.trim())
                  .filter(Boolean)}
              />
            </Suspense>
          </div>
        </div>
        <RelatedProducts id={product.id} />
      </div>
      <Footer />
    </ProductProvider>
  );
}

async function RelatedProducts({ id }: { id: string }) {
  const relatedProducts = await getProductRecommendations(id);
  return <RelatedProductsCarousel products={relatedProducts} />;
}
