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
    <nav className="relative flex flex-col gap-4 p-4 lg:px-6 pt-6">
      <div className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
          <Link href="/" prefetch={true} className="flex items-center">
            <LogoSquare />
          </Link>
        </div>
        <CartModal />
      </div>

      <div className="w-full md:hidden">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
      </div>

      <div className="hidden w-full items-center md:flex">
        <div className="flex w-full md:w-1/3">
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
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
