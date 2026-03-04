import { AddToCart } from "components/cart/add-to-cart";
import Price from "components/price";
import { Product } from "lib/shopify/types";
import { PaymentOptions } from "./payment-options";
import { VariantSelector } from "./variant-selector";

export function ProductDescription({
  product,
  descriptions,
}: {
  product: Product;
  descriptions?: string[];
}) {
  const productDescriptions =
    descriptions?.filter((description) => description.trim().length > 0) ?? [];

  return (
    <>
      <div className="mb-6 flex flex-col border-b pb-6 dark:border-neutral-700">
        <h1 className="mb-2 text-md sm:text-3xl md:text-4xl lg:text-2xl font-medium bg-[#E0E0E2] border border-b-10  border-b-neutral-800  rounded-tl-[48] rounded-br-[48] px-5 lg:px-12 py-2">
          {product.title}
        </h1>
        <div className=" flex">
          {/* <div>
        <h2 className="mb-0 text-md sm:text-3xl md:text-4xl lg:text-2xl font-medium bg-red-600 text-neutral-200  rounded-bl-[48]  px-5 lg:px-12 py-2">25%</h2>
        </div> */}
          <div className="flex text-center px-3 rounded-xl text-2xl items-center shadow-xl font-bold text-yellow-900 bg-[#FFC600]">
            <Price
              amount={product.priceRange.minVariantPrice.amount}
              currencyCode={product.priceRange.minVariantPrice.currencyCode}
            />
          </div>
        </div>
      </div>
      {productDescriptions.length > 0 ? (
        <div className=" bg-neutral-100 p-5 rounded-2xl mb-6 space-y-2 text-sm leading-tight text-black">
          {productDescriptions.map((description, index) => (
            <p key={`${description}-${index}`}>{description}</p>
          ))}
        </div>
       ) : null}
       
      <div className="flex lg:flex-row gap-2 mb-6">
        <VariantSelector
          options={product.options}
          variants={product.variants}
        />
      </div>

      
      <AddToCart product={product} />
      <PaymentOptions product={product} />
    </>
  );
}
