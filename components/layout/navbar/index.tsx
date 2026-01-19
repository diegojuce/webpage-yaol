import { Header } from "app/header/header";
import CartModal from "components/cart/modal";
import LogoSquare from "components/logo-square";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return (
    <div className="fixed z-50 top-0 right-0 left-0">
      <Header/>
    <nav className="fixed left-0 right-0 shadow-md border-b-1  bg-white flex flex-col gap-4 p-3 md:p-0 md:px-10">
      <div className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-0">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
          <Link href="/" prefetch={true} className="flex px-5 items-center">
            <LogoSquare />
          </Link>
        </div>
        <div className="w-full md:hidden px-2">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <CartModal />
      </div>

      {/* <div className="w-full md:hidden">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
      </div> */}

      <div className="hidden w-full items-center justify-center md:flex ">
        <div className="flex flex-1 ">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
          </Link>
          {menu.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
       <div className="flex flex-none justify-center gap-4">
        <div className="relative group ">
        <Link href="" className="text-black text-s ">Llantas</Link>
        <span className="absolute left-0 top-full h-10 w-full bg-transparent" aria-hidden="true" />
        <span className="absolute left-0 -bottom-7 h-1 w-full bg-yellow-500 scale-x-0 origin-middle transition-transform duration-300 ease-out group-hover:scale-x-100 z-100"/>
        <div className="fixed left-0 right-0 top-[113px]  hidden group-hover:block  bg-white  p-8 z-30">
          <div className="grid grid-cols-3 gap-8 w-1/3 mx-auto">
            <div>
              <h4 className="text-neutral-600 text-xs">Buscar por Vehiculo</h4>
              <ul className="mt-5 space-y-2 text-sm text-black">
                <li className="hover:text-blue-500 font-semibold cursor-pointer">SUV</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Sedan</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Jeep</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Pick-up</li>
              </ul>
            </div>
            <div>
              <h4 className="text-neutral-600 text-xs">Buscar por Tipo</h4>
              <ul className="mt-5 space-y-2 text-sm text-black">
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Runflat</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Off-road</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Sport</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Carga</li>
              </ul>
            </div>
            <div>
              <h4 className="text-neutral-600 text-xs">Buscar por Gama</h4>
              <ul className="mt-5 space-y-2 text-sm text-black">
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Alta</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Media</li>
                <li className="hover:text-blue-500 font-semibold cursor-pointer">Económica</li>
              </ul>
            </div>

          </div>
        </div>

        </div>
        <div className="relative group">
        <Link href="/ubicaciones" className="text-black text-s">Ubicaciones</Link>
        <span className="absolute left-0 -bottom-7 h-1 w-full bg-yellow-500 scale-x-0 origin-middle transition-transform duration-300 ease-out group-hover:scale-x-100 z-100"/>
        </div>

       <div className="relative group">
       <Link href="" className="text-black text-s ">Servicios</Link>
       <span className="absolute left-0 -bottom-7 h-1 w-full bg-yellow-500 scale-x-0 origin-middle transition-transform duration-300 ease-out group-hover:scale-x-100 z-100"/>
       </div>
       
       <div className="relative group">
       <Link href="/contacto" className="text-black text-s ">Asistencia</Link>
       <span className="absolute left-0 -bottom-7 h-1 w-full bg-yellow-500 scale-x-0 origin-middle transition-transform duration-300 ease-out group-hover:scale-x-100 z-100"/>
       </div>
       <div className="relative group">
       <Link href="/nosotros" className="text-black text-s ">¿Por que Yantissimo?</Link>
       <span className="absolute left-0 -bottom-7 h-1 w-full bg-yellow-500 scale-x-0 origin-middle transition-transform duration-300 ease-out group-hover:scale-x-100 z-100"/>
       </div>
       </div>
        
        <div className="flex flex-1 justify-end ">
          <div className="flex  py-5 px-5 flex-row text-black">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          <CartModal />

        </div>
      </div>
    </nav>
    </div>
  );
}


