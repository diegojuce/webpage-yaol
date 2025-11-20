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
    <nav className="fixed w-[100vw] z-100 top-0 bg-white flex flex-col gap-4 p-4 lg:px-6 pt-6">
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

      <div className="hidden w-full items-center md:flex">
        <div className="flex w-full ">
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
          <div className="flex py-5 px-10 gap-5 flex-row text-black">
            <h1 className="hover:text-blue-900 hover:underline">Inicio</h1>
            <h1 className="hover:text-blue-900 hover:underline">Promociones</h1>
            <h1 className="hover:text-blue-900 hover:underline">Servicios</h1>
            <h1 className="hover:text-blue-900 hover:underline">Nosotros</h1>
          </div>
        </div>
       
        
        <div className="flex w-1/3 justify-end ">
          <div className="flex  py-5 px-5 flex-row text-black">
            <Suspense fallback={<SearchSkeleton />}>
              <Search />
            </Suspense>
          </div>
          <CartModal />

        </div>
      </div>
    </nav>
  );
}


