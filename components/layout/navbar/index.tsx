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
    <div className="fixed z-200 top-0 right-0 left-0">
      <Header/>
    <nav className="top-0 border-b z-150 bg-white flex flex-col gap-4 px-10 ">
      <div className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-0">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
          <Link href="/" prefetch={true} className="flex items-center">
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
        <div className="relative group">
        <Link href="" className="text-black text-s hover:underline">Llantas</Link>
        <span className="absolute left-0 top-full h-10 w-full bg-transparent" aria-hidden="true" />
        <span className="absolute left-0 -bottom-7.5 h-1 w-full bg-black scale-x-0 origin-middle transition-transform duration-300 ease-out group-hover:scale-x-100 z-100"/>
        <div className="fixed left-0 right-0 top-[100px]  hidden group-hover:block  bg-white  p-8 z-50">
          <div className="grid grid-cols-3 gap-8 w-1/3 mx-auto">
            <div>
              <h4 className="font-semibold text-black text-xs">Buscar por Vehiculo</h4>
              <ul className="mt-5 space-y-2 text-sm text-black">
                <li className="hover:text-blue-500 cursor-pointer">Vehículo electrico</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-black text-xs">Buscar por Vehiculo</h4>
            </div>
            <div>
              <h4 className="font-semibold text-black text-xs">Buscar por Vehiculo</h4>
            </div>

          </div>
        </div>

        </div>
       <Link href="" className="text-black text-s hover:underline">Ubicaciones</Link>
       <Link href="" className="text-black text-s hover:underline">Servicios</Link>
       <Link href="" className="text-black text-s hover:underline">Asistencia</Link>
       <Link href="" className="text-black text-s hover:underline">¿Por que Yantissimo?</Link>
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


