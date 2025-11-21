import FeaturedProducts from "components/grid/FeaturedProducts";
import PromoBannerCarousel, {
  type PromoBanner,
} from "components/grid/promo-banner-carousel";
import { getCollectionProducts } from "lib/shopify";
import type { Product } from "lib/shopify/types";
import Image from "next/image";
import SearchBox from "./search-box";

const HERO_CTA_CLASSES =
  "relative flex-1  bg-yellow-500 px-6 py-3 text-center text-base font-semibold uppercase tracking-[0.25em] text-black transition-transform duration-150 ease-out shadow-[0_0_25px_rgba(250,204,21,0.45)] hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black dark:focus-visible:ring-yellow-400";

const PROMO_BANNERS: PromoBanner[] = [
  {
    highlight: "20% DE DESCUENTO",
    message: "EN MANO DE OBRA",
  },
  {
    highlight: "PAGOS FLEXIBLES",
    message: "HASTA 12 MSI CON TARJETA PARTICIPANTE",
  },
  {
    highlight: "INSPECCIÓN GRATIS",
    message: "EN LA COMPRA DE 4 LLANTAS NUEVAS",
  },
];

export async function ThreeItemGrid() {
  // Collections that start with `hidden-*` are hidden from the search page.
  const homepageItems = await getCollectionProducts({
    collection: "michelin",
    sortKey: "price",
  });

  const productTiles = homepageItems.filter(Boolean).slice(0, 5) as Product[];

  return (
    <section className="bg-white mx-auto max-w-(--breakpoint-2xl) pt-20 0">
      <div className="absolute w-[70vw] h-[70vw] mt-20 right-0  md:w-[44vw] md:h-[44vw] md:mt-2 md:block md:col-span-5 md:mt-0">
        <div className="relative overflow-hidden">
          <Image
            src="/imagen_portada.svg"
            alt="Servicio automotriz"
            width={640}
            height={640}
            sizes="(min-width: 1024px) 32vw, 60vw"
            className="w-full md:w-[44vw] md:h-[44vw] object-contain"
            priority
          />
        </div>
      </div>
      <div className="relative md:h-[42vw] xl:h-[35vw] overflow-hidden px-6 py-10 shadow-[0_35px_120px_rgba(15,15,15,0.55)] sm:px-10 md:px-14 md:py-0">
        <div className="relative grid  gap-0 md:grid-cols-12 md:items-top">
          <div className="flex flex-col gap-10 md:col-span-7 mt-20 mb-10 md:mb-40">
            <div>
              <h1 className=" text-2xl font-black uppercase tracking-[0.35em] text-[#6E6E6E] sm:text-4xl lg:text-6xl">
                LA MEJOR
              </h1>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.35em] text-[#6E6E6E] sm:text-4xl lg:text-6xl">
                EXPERIENCIA
              </h2>
              <p className="mt-4 text-sm italic text-[#6E6E6E] sm:text-xl">
                EN LLANTAS Y SERVICIO AUTOMOTRÍZ
              </p>
            </div>
            <SearchBox />

            {/* <div className="flex flex-col md:w-2/3 rounded-2xl border border-neutral-200 bg-neutral-50 py-5 mt-5  px-5 md:px-4 md:mt-0 gap-4 ">
              <div className= "flex flex-row gap-4 mb-5">
                <button className="bg-yellow-500 text-black rounded w-25 py-1 text-sm hover:bg-yellow-500">Por Medida</button>
                <button className=" border border-yellow-500 rounded text-yellow-500 w-25 py-1 text-sm hover:bg-yellow-500">Por Auto</button>
              </div>
              <div className="flex flex-col md:flex-row ">
                <div className="flex flex-row gap-5">
                <input className="text-sm h-10 p-3 w-full text-black placeholder:text-black bg-white" placeholder="Alto"></input>
                <input className="text-sm h-10 p-3 w-full  text-black placeholder:text-black bg-white" placeholder="Ancho"></input>
                <input className="text-sm h-10 p-3 w-full text-black placeholder:text-black bg-white" placeholder="Rin"></input>
                </div>
                <button className="rounded bg-yellow-500 mt-5 md:mt-0 md:mx-5 w-full h-10 hover:bg-white hover:text-black">Buscar</button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90  mx-6 mt-2">
        <PromoBannerCarousel banners={PROMO_BANNERS} />
      </div>

      {productTiles?.length ? (
        <FeaturedProducts productTiles={productTiles} />
      ) : null}
    </section>
  );
}
